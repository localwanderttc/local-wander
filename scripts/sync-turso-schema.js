// schema.prisma -> Turso 同步腳本。Prisma CLI 不能直接對 libsql:// 做 db push/migrate，
// 所以正式資料庫的 schema 靠這支腳本比對補齊。
//
// 原理：
// 1. 用 `prisma db push` 把當下的 schema.prisma 套到一個全新的暫存 sqlite 檔，當作「應該長怎樣」的正確答案。
// 2. 逐表逐欄跟 Turso 現有結構比對，缺表就 CREATE TABLE，缺欄位就 ALTER TABLE ADD COLUMN。
// 3. 只新增，不刪除、不改型別。遇到「NOT NULL 又沒有預設值」這種 SQLite 沒法簡單 ALTER 的情況直接報錯中止。
//
// 用法：
//   node scripts/sync-turso-schema.js --dry-run   # 只印出計畫要跑的 SQL，不動 Turso
//   node scripts/sync-turso-schema.js             # 真的同步
//   Vercel build 內自動跑：見 package.json 的 "vercel-build"，且只有 VERCEL_ENV=production 才會動 Turso。

const fs = require('fs')
const path = require('path')
const os = require('os')
const crypto = require('crypto')
const { execFileSync } = require('child_process')
const { createClient } = require('@libsql/client')

const ROOT = path.join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

function loadEnvFile() {
  for (const name of ['.env', '.env.local']) {
    const envPath = path.join(ROOT, name)
    if (!fs.existsSync(envPath)) continue
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
      if (m) process.env[m[1]] = process.env[m[1]] || m[2]
    }
  }
}

function buildReferenceDb() {
  const tmpPath = path.join(os.tmpdir(), `lw-schema-check-${crypto.randomUUID()}.db`)
  // shell:true 是 Windows 上呼叫 npx.cmd 的必要解法（直接 spawn .cmd 在 Node 18+ 會噴 EINVAL）；
  // 參數全是寫死常數，沒有 shell injection 風險。
  execFileSync(
    'npx',
    ['prisma', 'db', 'push', '--skip-generate', '--accept-data-loss', '--schema', path.join(ROOT, 'prisma', 'schema.prisma')],
    {
      cwd: ROOT,
      env: { ...process.env, DATABASE_URL: `file:${tmpPath}` },
      stdio: 'inherit',
      shell: true,
    }
  )
  return tmpPath
}

function cleanupReferenceDb(tmpPath) {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const p = tmpPath + suffix
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p)
    } catch (e) {
      console.warn(`[sync-turso-schema] 清理暫存檔失敗（可忽略）: ${p} - ${e.message}`)
    }
  }
}

async function getTables(client) {
  const res = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'`
  )
  return res.rows.map(r => r.name)
}

async function getColumns(client, table) {
  const res = await client.execute(`PRAGMA table_info("${table}")`)
  return res.rows
}

async function getCreateStatements(client, table) {
  const res = await client.execute(
    `SELECT sql FROM sqlite_master WHERE tbl_name = ? AND sql IS NOT NULL ORDER BY (type = 'table') DESC`,
    [table]
  )
  return res.rows.map(r => r.sql)
}

function buildAddColumnSql(table, col) {
  let sql = `ALTER TABLE "${table}" ADD COLUMN "${col.name}" ${col.type}`
  if (col.notnull) {
    if (col.dflt_value === null || col.dflt_value === undefined) {
      throw new Error(
        `${table}.${col.name} 是 NOT NULL 但沒有預設值，SQLite 沒辦法用 ALTER TABLE 直接補，需要人工寫遷移`
      )
    }
    sql += ` NOT NULL DEFAULT ${col.dflt_value}`
  } else if (col.dflt_value !== null && col.dflt_value !== undefined) {
    sql += ` DEFAULT ${col.dflt_value}`
  }
  return sql
}

async function main() {
  loadEnvFile()

  if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
    console.log(`[sync-turso-schema] VERCEL_ENV=${process.env.VERCEL_ENV}，非正式環境跳過，不動 Turso。`)
    return
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  if (!tursoUrl || !tursoToken) {
    if (process.env.VERCEL) {
      throw new Error('缺少 TURSO_DATABASE_URL / TURSO_AUTH_TOKEN，無法同步')
    }
    console.log('[sync-turso-schema] 本機沒有設定 TURSO_DATABASE_URL / TURSO_AUTH_TOKEN，跳過（本機開發用 dev.db 即可）。')
    return
  }

  console.log('[sync-turso-schema] 從 schema.prisma 產生暫存參考資料庫...')
  const refPath = buildReferenceDb()
  let ref
  let turso

  try {
    ref = createClient({ url: `file:${refPath}` })
    turso = createClient({ url: tursoUrl, authToken: tursoToken })

    const refTables = await getTables(ref)
    const tursoTables = await getTables(turso)

    const missingTables = refTables.filter(t => !tursoTables.includes(t))
    for (const table of missingTables) {
      const stmts = await getCreateStatements(ref, table)
      for (const stmt of stmts) {
        if (DRY_RUN) console.log(`[dry-run] ${stmt}`)
        else await turso.execute(stmt)
      }
      console.log(`[sync-turso-schema] 表 "${table}" ${DRY_RUN ? '將會建立' : '已建立'}`)
    }

    const existingTables = refTables.filter(t => tursoTables.includes(t))
    let changed = missingTables.length > 0
    for (const table of existingTables) {
      const refCols = await getColumns(ref, table)
      const tursoCols = await getColumns(turso, table)
      const tursoColNames = new Set(tursoCols.map(c => c.name))
      const missingCols = refCols.filter(c => !tursoColNames.has(c.name))

      for (const col of missingCols) {
        const sql = buildAddColumnSql(table, col)
        if (DRY_RUN) {
          console.log(`[dry-run] ${sql}`)
        } else {
          console.log(`[sync-turso-schema] ${table}: 補欄位 -> ${sql}`)
          await turso.execute(sql)
        }
        changed = true
      }
    }

    if (!changed) console.log('[sync-turso-schema] Turso schema 已經跟 schema.prisma 一致，沒有變動。')
    else if (DRY_RUN) console.log('[sync-turso-schema] --dry-run 完成，以上是計畫要跑的 SQL，沒有真的執行。')
    else console.log('[sync-turso-schema] 同步完成。')
  } finally {
    if (ref) ref.close()
    if (turso) turso.close()
    cleanupReferenceDb(refPath)
  }
}

main().catch(e => {
  console.error('[sync-turso-schema] 失敗:', e.message)
  process.exit(1)
})

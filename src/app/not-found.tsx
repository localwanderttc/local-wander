import Link from "next/link";

// 沒有 app/layout.tsx（多 root layout 架構），所以全域 not-found 要自己帶 html/body。
export default function GlobalNotFound() {
  return (
    <html lang="zh-Hant-TW">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#fff",
          color: "#1c1917",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>404</h1>
          <p style={{ color: "#78716c" }}>找不到這個頁面 / Page not found</p>
          <Link href="/zh" style={{ color: "#0f766e" }}>
            回首頁
          </Link>
        </div>
      </body>
    </html>
  );
}

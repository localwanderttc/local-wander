// 詢價相關的共用常數與型別，前後台與 API 都用這份，不要各寫一份。

export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "closed",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export function isInquiryStatus(v: string): v is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(v);
}

// 服務類型 key，需與 content/site-config.json 的 services[].key 對齊（外加 "other"）。
export const SERVICE_TYPES = ["airport", "charter", "daytour", "other"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export function isServiceType(v: string): v is ServiceType {
  return (SERVICE_TYPES as readonly string[]).includes(v);
}

// 前台表單送出的 payload 形狀
export type InquiryInput = {
  name: string;
  phone: string;
  email?: string;
  lineId?: string;
  serviceType: string;
  headcount?: number | null;
  startDate?: string;
  endDate?: string;
  pickup?: string;
  dropoff?: string;
  message?: string;
  locale?: string;
};

// 回傳 null 代表通過；回傳字串代表錯誤原因（給 API 回應用）。
export function validateInquiry(input: Partial<InquiryInput>): string | null {
  if (!input.name || !input.name.trim()) return "name is required";
  if (!input.phone || !input.phone.trim()) return "phone is required";
  if (!input.serviceType || !isServiceType(input.serviceType))
    return "invalid serviceType";
  if (input.name.length > 100) return "name too long";
  if (input.phone.length > 50) return "phone too long";
  if (input.message && input.message.length > 2000) return "message too long";
  return null;
}

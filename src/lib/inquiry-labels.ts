// 後台顯示用的中文標籤（後台只有中文）。

import type { InquiryStatus } from "./inquiry";

export const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "新進",
  contacted: "已聯絡",
  quoted: "已報價",
  confirmed: "已確認",
  closed: "已結案",
};

export const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  quoted: "bg-violet-100 text-violet-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  closed: "bg-stone-200 text-stone-600",
};

export const SERVICE_LABEL: Record<string, string> = {
  airport: "機場接送",
  charter: "包車旅遊 / 環島",
  daytour: "一日遊包車",
  other: "其他",
};

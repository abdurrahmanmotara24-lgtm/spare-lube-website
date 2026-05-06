export const WEEKLY_SPECIAL_HEADERS = [
  "🔥 Weekly Deal",
  "💥 Hot Special",
  "🟢 WhatsApp Exclusive",
  "⚡ Limited Offer",
] as const;

export type WeeklySpecialHeader = (typeof WEEKLY_SPECIAL_HEADERS)[number];

export interface WeeklySpecial {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  specialPrice: number;
  originalPrice: number | null;
  headerLabel: WeeklySpecialHeader;
  isActive: boolean;
  sortOrder: number;
  customDescription: string | null;
}

export interface WeeklyOrderCustomer {
  name: string;
  phone: string;
  area: string;
}

export interface WeeklyOrderItem {
  specialId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

// Định nghĩa các loại giảm giá
export type DiscountType = "ONE_TIME" | "MANY_TIME";

// Định nghĩa các tier khách hàng
export type CustomerTier = "NEW_USER" | "REGULAR" | "VIP" | "DIAMOND" | null;

// Định nghĩa cấu trúc dữ liệu cho DiscountCode
export interface DiscountCode {
  discountCodeId: string;
  name: string;
  percent: number;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  description: string;
  quantity: number; // Số lượng cho public voucher
  minPriceToApply: number;
  discountType: DiscountType;
  maxQuantityCanUse: number; // Lượt dùng tối đa/khách

  // Loyalty + Tier System Fields
  isPublic: boolean; // true = công khai, false = riêng tư
  redeemable: boolean; // true = trao đổi bằng points, false = không trao đổi
  redeemCost?: number | null; // Số điểm cần để đổi (chỉ khi redeemable=true)
  minTierRequired?: CustomerTier; // Tier tối thiểu yêu cầu
}

// Type dùng cho form thêm/sửa (có thể không có discountCodeId)
export interface DiscountFormData extends Omit<DiscountCode, "discountCodeId"> {
  discountCodeId?: string;
}

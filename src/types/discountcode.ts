// Định nghĩa các loại giảm giá
export type DiscountType = "ONE_TIME" | "MANY_TIME";

// Định nghĩa cấu trúc dữ liệu cho Discount
export type DiscountDataType = {
  discountId: string;
  name: string;
  percent: number;
  startDate: string; // Kiểu LocalDate của Java sẽ là string (ISO 8601) ở frontend
  endDate: string;
  description: string;
  quantity: number;
  minPriceToApply: number;
  discountType: DiscountType; // Sử dụng type đã định nghĩa ở trên
  maxQuantityCanUse: number;
};
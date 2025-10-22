export type OrderStatus =
  | "CHỜ_XU_LÝ"
  | "DANG_XU_LY"
  | "DANG_GIAO_HANG"
  | "HOAN_TAT"
  | "HUY";

export type OrderDataType = {
  id: string;
  customerId: string;
  bookId: string;
  status: OrderStatus;
  total: string;
  dateOrder: string;
};

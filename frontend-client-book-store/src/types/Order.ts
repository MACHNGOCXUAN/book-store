/**
 * Order Types
 * 주문 관련 타입 정의
 */

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderDetailRequest {
  bookId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  discountCode?: string | null;
  orderDetails: OrderDetailRequest[];
}

export interface OrderCustomer {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface PaymentInfo {
  paymentId: string;
  amount: number;
  method: "VNPAY" | "MOMO" | "COD";
  paymentCreatedAt?: string;
  paymentCompletedAt?: string;
}

export interface PaymentQRCode {
  orderId: string;
  amount: number;
  paymentUrl: string;
  qrCodeBase64: string;
  message: string;
  expiresAt: number;
}

export interface DiscountInfo {
  discountCodeId: string;
  name: string;
  percent: number;
  discountAmount: number;
}

export interface OrderResponse {
  orderId: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  customer?: OrderCustomer;
  payments?: PaymentInfo[];
  orderDetails?: any[];
  discountCode?: DiscountInfo;
}

// Extended order types for fetching
export interface Customer {
  userId: string;
  fullName: string | null;
  phoneNumber: string;
  status: string;
  email: string;
  address: string;
}

export interface Payment {
  paymentId: string;
  amount: number;
  method: "ONLINE" | "COD" | "VNPAY" | "MOMO";
}

export interface OrderHistory {
  id: string;
  orderId: string;
  timestamp: string;
  status: OrderStatus;
}

export interface Book {
  bookId: string;
  title: string;
  author: string;
  publisher: string;
  price: number;
  category: string;
  coverImage: string;
}

export interface OrderDetail {
  orderDetailId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  book: Book;
}

export interface OrderDataType {
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  customer: Customer;
  payments: Payment[];
  orderDetails: OrderDetail[];
  orderHistories: OrderHistory[];
  discountCode?: DiscountInfo;
}

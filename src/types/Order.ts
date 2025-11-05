/**
 * Order Types
 * 주문 관련 타입 정의
 */

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

export interface OrderResponse {
  orderId: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  customer?: OrderCustomer;
  payments?: any[];
  orderDetails?: any[];
}

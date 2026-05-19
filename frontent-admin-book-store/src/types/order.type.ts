export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

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
  method: "ONLINE" | "COD";
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
}

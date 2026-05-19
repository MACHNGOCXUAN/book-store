import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://DESKTOP-GL3I116:8080/api";

export interface VNPayCheckoutRequest {
  customerId: string;
  voucherId?: string | null;
  discountCode?: string | null;
  orderDetails: Array<{
    bookId: string;
    quantity: number;
  }>;
}

export interface VNPayPaymentOnlyResponse {
  payment: {
    tempOrderId: string;
    amount: number;
    qrCodeBase64: string; // Base64 encoded QR image
    paymentUrl: string;
    expiresAt: number;
  };
  orderRequest: VNPayCheckoutRequest;
}

// Tạo VNPay payment mà KHÔNG tạo order (chỉ hiển thị QR)
export const createVNPayPaymentOnly = async (
  request: VNPayCheckoutRequest,
  token: string
): Promise<VNPayPaymentOnlyResponse> => {
  const response = await axios.post(
    `${API_URL}/orders/create-vnpay-payment-only`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

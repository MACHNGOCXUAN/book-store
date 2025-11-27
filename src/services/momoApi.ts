import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export interface MoMoCheckoutRequest {
    customerId: string;
    voucherId?: string | null;
    discountCode?: string | null;
    orderDetails: Array<{
        bookId: string;
        quantity: number;
    }>;
}

export interface MoMoCheckoutResponse {
    order: any;
    payment: {
        orderId: string;
        amount: number;
        payUrl: string;
        qrCodeUrl: string;
        deeplink: string;
        expiresAt: number;
        message: string;
    };
}

export interface MoMoPaymentOnlyResponse {
    payment: {
        tempOrderId: string;
        amount: number;
        payUrl: string;
        qrCodeUrl: string;
        deeplink: string;
        expiresAt: number;
    };
    orderRequest: MoMoCheckoutRequest;
}

export interface CheckoutResponse {
  message: string;   
  orderId: string;
  amount: number; 
  paymentUrl: string;
}

// Tạo MoMo payment mà KHÔNG tạo order (chỉ hiển thị QR)
export const createMoMoPaymentOnly = async (
    request: MoMoCheckoutRequest,
    token: string
): Promise<MoMoPaymentOnlyResponse> => {
    const response = await axios.post(
        `${API_URL}/orders/create-momo-payment-only`,
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

export const checkoutOrder = async (
    request: MoMoCheckoutRequest,
    token: string
): Promise<CheckoutResponse> => {
    const response = await axios.post(
        `${API_URL}/orders/checkout-order`,
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

export const checkoutWithMomo = async (
    request: MoMoCheckoutRequest,
    token: string
): Promise<MoMoCheckoutResponse> => {
    const response = await axios.post(
        `${API_URL}/orders/checkout-momo`,
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

export const checkMoMoPaymentStatus = async (
    orderId: string,
    token: string
): Promise<any> => {
    const response = await axios.get(
        `${API_URL}/payments/momo/status/${orderId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

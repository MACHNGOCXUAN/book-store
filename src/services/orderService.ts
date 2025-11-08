import { API_BASE } from "../config/api";

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  startTime?: string;
  endTime?: string;
  textSearch?: string;
}

export interface OrdersResponse {
  data: any[];
  paging: {
    curPage: number;
    limitPage: number;
    totalRows: number;
    totalPage: number;
  };
}

/**
 * Fetch orders with optional filters (status, date range, search)
 */
export const fetchOrdersByFilter = async (
  filters: OrderFilterParams
): Promise<OrdersResponse> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
  }

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Lỗi ${response.status}: Không thể tải danh sách đơn hàng`
        );
      } catch (e) {
        if (e instanceof Error && e.message.includes("Lỗi")) {
          throw e;
        }
        throw new Error(
          `Lỗi ${response.status}: Không thể tải danh sách đơn hàng`
        );
      }
    }

    const data: OrdersResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Error fetching orders:", error);
    throw error;
  }
};

/**
 * Fetch orders by status only
 */
export const fetchOrdersByStatus = async (
  status: string,
  page: number = 1,
  limit: number = 10
): Promise<OrdersResponse> => {
  const filters: OrderFilterParams = {
    page,
    limit,
  };

  // Chỉ thêm status nếu không phải "ALL"
  if (status && status !== "ALL") {
    filters.status = status;
  }

  return fetchOrdersByFilter(filters);
};

/**
 * Fetch order details by ID
 */
export const fetchOrderById = async (orderId: string) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Lỗi ${response.status}: Không thể tải chi tiết đơn hàng`
        );
      } catch (e) {
        if (e instanceof Error && e.message.includes("Lỗi")) {
          throw e;
        }
        throw new Error(
          `Lỗi ${response.status}: Không thể tải chi tiết đơn hàng`
        );
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Error fetching order details:", error);
    throw error;
  }
};

/**
 * Fetch all orders for current user
 */
export const fetchAllOrders = async (
  page: number = 1,
  limit: number = 10
): Promise<OrdersResponse> => {
  return fetchOrdersByFilter({
    page,
    limit,
  });
};

/**
 * Cancel an order (only PENDING status)
 */
export const cancelOrder = async (orderId: string): Promise<{ message: string }> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Lỗi ${response.status}: Không thể hủy đơn hàng`
        );
      } catch (e) {
        if (e instanceof Error && e.message.includes("Lỗi")) {
          throw e;
        }
        throw new Error(
          `Lỗi ${response.status}: Không thể hủy đơn hàng`
        );
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Error canceling order:", error);
    throw error;
  }
};

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../config/api";
import {
  fetchOrdersByFilter,
  fetchOrdersByStatus,
  fetchOrderById,
  fetchAllOrders,
  type OrderFilterParams,
  type OrdersResponse,
} from "../../services/orderService";
import type {
  OrderDataType,
  CreateOrderRequest,
  OrderResponse,
  PaymentQRCode,
} from "../../types/Order";

export interface OrdersState {
  loading: boolean;
  orders: OrderDataType[];
  currentOrder: OrderDataType | null;
  order: OrderResponse | null;
  payment: PaymentQRCode | null;
  pagination: {
    curPage: number;
    limitPage: number;
    totalRows: number;
    totalPage: number;
  };
  error: string | null;
}

const initialState: OrdersState = {
  loading: false,
  orders: [],
  currentOrder: null,
  order: null,
  payment: null,
  pagination: {
    curPage: 1,
    limitPage: 10,
    totalRows: 0,
    totalPage: 0,
  },
  error: null,
};

/* ==================== Async Thunks ==================== */

/**
 * Create a new order (for checkout)
 */
export const createOrder = createAsyncThunk<
  { order: OrderResponse; payment?: PaymentQRCode },
  CreateOrderRequest,
  { rejectValue: string }
>(
  "orders/createOrder",
  async (payload: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      console.log(
        "📤 Payload gửi lên Backend:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(`${API_BASE}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error("❌ Error response:", data);
        return rejectWithValue(
          data.message || `Lỗi ${response.status}: Không thể tạo đơn hàng`
        );
      }

      const data = await response.json();
      console.log("✅ Order created successfully:", data);

      return {
        order: data.order,
        payment: data.payment,
      };
    } catch (error: any) {
      console.error("❌ Catch error:", error);
      return rejectWithValue(error.message || "Có lỗi xảy ra khi tạo đơn hàng");
    }
  }
);

/**
 * Fetch orders with filters (status, date range, pagination, search)
 */
export const getOrdersWithFilter = createAsyncThunk<
  OrdersResponse,
  OrderFilterParams,
  { rejectValue: string }
>(
  "orders/getOrdersWithFilter",
  async (filters: OrderFilterParams, { rejectWithValue }) => {
    try {
      console.log("📤 Fetching orders with filters:", filters);
      const response = await fetchOrdersByFilter(filters);
      console.log("✅ Orders fetched successfully:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error fetching orders:", error);
      return rejectWithValue(
        error.message || "Có lỗi xảy ra khi tải danh sách đơn hàng"
      );
    }
  }
);

/**
 * Fetch orders by status
 */
export const getOrdersByStatus = createAsyncThunk<
  OrdersResponse,
  { status: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  "orders/getOrdersByStatus",
  async ({ status, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log("📤 Fetching orders with status:", status);
      const response = await fetchOrdersByStatus(status, page, limit);
      console.log("✅ Orders by status fetched successfully:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error fetching orders by status:", error);
      return rejectWithValue(
        error.message || "Có lỗi xảy ra khi tải danh sách đơn hàng"
      );
    }
  }
);

/**
 * Fetch all orders
 */
export const getAllOrders = createAsyncThunk<
  OrdersResponse,
  { page?: number; limit?: number },
  { rejectValue: string }
>(
  "orders/getAllOrders",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log(
        "📤 Fetching all orders (page: " + page + ", limit: " + limit + ")"
      );
      const response = await fetchAllOrders(page, limit);
      console.log("✅ All orders fetched successfully:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error fetching all orders:", error);
      return rejectWithValue(
        error.message || "Có lỗi xảy ra khi tải danh sách đơn hàng"
      );
    }
  }
);

/**
 * Fetch order details by ID
 */
export const getOrderDetail = createAsyncThunk<
  OrderDataType,
  string,
  { rejectValue: string }
>("orders/getOrderDetail", async (orderId: string, { rejectWithValue }) => {
  try {
    console.log("📤 Fetching order details for:", orderId);
    const response = await fetchOrderById(orderId);
    console.log("✅ Order details fetched successfully:", response);
    return response;
  } catch (error: any) {
    console.error("❌ Error fetching order details:", error);
    return rejectWithValue(
      error.message || "Có lỗi xảy ra khi tải chi tiết đơn hàng"
    );
  }
});

/* ==================== Slice ==================== */

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.pagination = initialState.pagination;
    },
    clearOrder: (state) => {
      state.order = null;
      state.payment = null;
      state.error = null;
    },
    // Xóa đơn hàng khỏi danh sách khi hủy
    removeOrderFromList: (state, action) => {
      state.orders = state.orders.filter(
        (order) => order.orderId !== action.payload
      );
      state.pagination.totalRows = Math.max(0, state.pagination.totalRows - 1);
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
        state.payment = action.payload.payment || null;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không xác định được lỗi";
      });
    // Get Orders With Filter
    builder
      .addCase(getOrdersWithFilter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersWithFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.paging;
        state.error = null;
      })
      .addCase(getOrdersWithFilter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
        state.orders = [];
      });

    // Get Orders By Status
    builder
      .addCase(getOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.paging;
        state.error = null;
      })
      .addCase(getOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
        state.orders = [];
      });

    // Get All Orders
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.paging;
        state.error = null;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
        state.orders = [];
      });

    // Get Order Detail
    builder
      .addCase(getOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(getOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
        state.currentOrder = null;
      });
  },
});

export const { clearCurrentOrder, clearOrders, clearOrder, removeOrderFromList } =
  ordersSlice.actions;
export default ordersSlice.reducer;

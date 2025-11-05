import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../config/api";
import type { CreateOrderRequest, OrderResponse } from "../../types/Order";

type OrderState = {
  loading: boolean;
  order: OrderResponse | null;
  error: string | null;
};

const initialState: OrderState = {
  loading: false,
  order: null,
  error: null,
};

/* ==================== Async Thunks ==================== */

/**
 * Thunk to create a new order
 */
export const createOrder = createAsyncThunk<
  OrderResponse,
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

      // Debug: Log payload
      console.log(
        "📤 Payload gửi lên Backend:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(`${API_BASE}/orders/createOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Debug: Log response status
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error("❌ Error response:", data);
        return rejectWithValue(
          data.message || `Lỗi ${response.status}: Không thể tạo đơn hàng`
        );
      }

      const data: OrderResponse = await response.json();
      console.log("✅ Order created successfully:", data);
      return data;
    } catch (error: any) {
      console.error("❌ Catch error:", error);
      return rejectWithValue(error.message || "Có lỗi xảy ra khi tạo đơn hàng");
    }
  }
);

/* ==================== Slice ==================== */

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không xác định được lỗi";
      });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;

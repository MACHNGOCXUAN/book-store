import http from "@/lib/utils/api";
import { OrderDataType } from "@/types/order.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getFilterOrder = createAsyncThunk(
  "order/getFilterOrder",
  async (data: any) => {
    const response = await http.post("orders", data);
    return response;
  }
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (id: string) => {
    const response = await http.get(`orders/${id}`);
    return response;
  }
);

export const updateStatusOrder = createAsyncThunk(
  "order/updateStatusOrder",
  async (data: any) => {
    const response = await http.put("/orders/update-status", data);
    return response;
  }
);

const pagination = {
  curPage: 1,
  limitPage: 10,
  totalRows: 0,
  totalPage: 0,
};

type initialStateType = {
  loading: boolean;
  listOrder?: OrderDataType[] | null;
  pagination: any;
  order?: OrderDataType | null;
  message?: any;
};

const initialState: initialStateType = {
  loading: false,
  pagination: pagination,
  listOrder: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilterOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFilterOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.listOrder = action.payload.data;
        state.pagination = action.payload.paging;
      })
      .addCase(getFilterOrder.rejected, (state) => {
        state.loading = false;
        state.listOrder = null;
        state.pagination = pagination;
      });

    builder
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state) => {
        state.loading = false;
        state.order = null;
      });

    builder
      .addCase(updateStatusOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStatusOrder.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật thành công!",
        };
      })
      .addCase(updateStatusOrder.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật thất bại!",
        };
      });
  },
});

export default orderSlice.reducer;
export const { resetMessage } = orderSlice.actions

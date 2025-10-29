// stores/slices/discount.slice.ts

import http from "@/lib/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getDiscountsFilter = createAsyncThunk(
  "discount/filterDiscountCodes",
  async (data: any) => {
    const {
      page, 
      limit, 
      discountCode, 
      type, 
      description,
    } = data;
    console.log("Filter data received:", data);
    const params = new URLSearchParams();

    if (page) {
      params.append("page", (page - 1).toString());
    }
    if (limit) {
      params.append("size", limit.toString());
    }


    if (discountCode) {
      params.append("discountCode", discountCode);
    }
    if (type && type !== "tat_ca") {
      params.append("type", type);
    }
    if (description) {
      params.append("description", description);
    }

    const response = await http.get(`discounts?${params.toString()}`);
    console.log("API Response:", response);
    return response;
  }
);

export const createDiscount = createAsyncThunk(
  "discount/createDiscount",
  async (data: any) => {
    const response = await http.post("discounts", data);
    return response;
  }
);

export const getDiscountById = createAsyncThunk(
  "discount/getDiscountById",
  async (id: string) => {
    const response = await http.get(`discounts/${id}`);
    return response;
  }
);

export const updateDiscount = createAsyncThunk(
  "discount/updateDiscount",
  async ({ id, data }: { id: string; data: any }) => {
    const response = await http.put(`discounts/${id}`, data);
    return response;
  }
);


const pagination = {
  curPage: 1,
  limitPage: 10,
  totalRows: 0,
  totalPage: 0,
};

type initialStatetype = {
  loading: boolean;
  listDiscount: any[];
  pagination: any;
  message?: any;
  discount?: any; 
};

const initialState: initialStatetype = {
  loading: false,
  listDiscount: [],
  pagination: pagination,
  message: undefined,
  discount: undefined,
};

export const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDiscountsFilter.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDiscountsFilter.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.listDiscount = action.payload;
          state.pagination = pagination;
        }
        else {
          state.listDiscount = action.payload.data || [];
          state.pagination = action.payload.paging || pagination;
        }
      })
      .addCase(getDiscountsFilter.rejected, (state) => {
        state.loading = false;
        state.listDiscount = [];
        state.pagination = pagination;
      });

    builder
      .addCase(createDiscount.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDiscount.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Tạo mã giảm giá thành công!",
        };
      })
      .addCase(createDiscount.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Tạo mã giảm giá thất bại!",
        };
      });

    builder
      .addCase(getDiscountById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.discount = action.payload;
      })
      .addCase(getDiscountById.rejected, (state) => {
        state.loading = false;
        state.discount = null;
      });

    builder
      .addCase(updateDiscount.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDiscount.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật thành công!",
        };
      })
      .addCase(updateDiscount.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật thất bại!",
        };
      });
  },
});

export default discountSlice.reducer;
export const { resetMessage } = discountSlice.actions;
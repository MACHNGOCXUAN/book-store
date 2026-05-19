import http from "@/lib/utils/api";
import { ProductFormValues } from "@/types/product";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";

export const getFilterProduct = createAsyncThunk(
  "product/getFilterProduct",
  async (data: any) => {
    const response = await http.post("books/filter", data);
    return response;
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id: string) => {
    const response = await http.delete(`books/${id}`);
    return response;
  }
);

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (data: ProductFormValues) => {
    const response = await http.post("books", data);
    return response;
  }
);

export const getProductId = createAsyncThunk(
  "product/getProductId",
  async (id: string) => {
    const response = await http.get(`books/${id}`);
    return response;
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (data: ProductFormValues) => {
    console.log("updateProduct data:", data);
    const response = await http.put(`books/${data.bookId}`, data);
    console.log("updateProduct response:", response);
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
  listProduct: any[];
  pagination: any;
  message?: any;
  product?: any;
};

const initialState: initialStatetype = {
  loading: false,
  listProduct: [],
  pagination: pagination,
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilterProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFilterProduct.fulfilled, (state, action) => {
        state.loading = false;
        (state.listProduct = action.payload.data),
          (state.pagination = action.payload.paging);
      })
      .addCase(getFilterProduct.rejected, (state) => {
        state.loading = false;
        state.pagination = pagination;
      });

    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Xóa sản phẩm thành công!",
        };
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Xóa thất bại!",
        };
      });

    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Tạo sản phẩm thành công!",
          timestamp: Date.now(),
        };
      })
      .addCase(createProduct.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Tạo sản phẩm thất bại!",
          timestamp: Date.now(),
        };
      });

    builder
      .addCase(getProductId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductId.rejected, (state) => {
        state.loading = false;
        state.product = null;
      });

    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật sản phẩm thành công!",
          timestamp: Date.now(),
        };
        console.log("updateProduct fulfilled - message set to:", state.message);
      })
      .addCase(updateProduct.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật sản phẩm thất bại!",
          timestamp: Date.now(),
        };
      });
  },
});

export default productSlice.reducer;
export const { resetMessage } = productSlice.actions;

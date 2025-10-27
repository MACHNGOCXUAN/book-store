// stores/slices/discount.slice.ts

import http from "@/lib/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/**
 * --- ĐỊNH NGHĨA CÁC ASYNC THUNKS (CALL API) ---
 * Tôi đã giả định các đường dẫn API theo cấu trúc của user.slice.ts
 * (ví dụ: admin/get-discount, admin/discount/[id], ...)
 */

// Lấy danh sách discount (có lọc và phân trang)
export const getDiscountsFilter = createAsyncThunk(
  "discount/getAllDiscountCodes",
  async (data: any) => {
    // THAY ĐỔI: Gọi endpoint mới.
    // Lưu ý: tham số 'data' (chứa filter) sẽ bị bỏ qua
    // vì GET /api/discounts không hỗ trợ.
    const response = await http.get("discounts");
    console.log("API Response:", response);
    return response;
  }
);

// Tạo discount mới
export const createDiscount = createAsyncThunk(
  "discount/createDiscount",
  async (data: any) => {
    // Giả định API create: "admin/create-discount"
    const response = await http.post("admin/create-discount", data);
    return response;
  }
);

// Lấy 1 discount bằng ID (dùng cho form Sửa)
export const getDiscountById = createAsyncThunk(
  "discount/getDiscountById",
  async (id: string) => {
    // Giả định API get by id: "admin/discount/[id]"
    const response = await http.get(`admin/discount/${id}`);
    return response;
  }
);

// Cập nhật discount
export const updateDiscount = createAsyncThunk(
  "discount/updateDiscount",
  async (data: any) => {
    // Giả định API update: "admin/discount/update"
    const response = await http.put("admin/discount/update", data);
    return response;
  }
);

// Xóa discount
export const deleteDiscount = createAsyncThunk(
  "discount/deleteDiscount",
  async (id: string) => {
    // Giả định API delete: "admin/discount/[id]"
    const response = await http.delete(`admin/discount/${id}`);
    return response;
  }
);

/**
 * --- ĐỊNH NGHĨA STATE VÀ SLICE ---
 */

// Cấu trúc phân trang cơ bản
const pagination = {
  curPage: 1,
  limitPage: 10,
  totalRows: 0,
  totalPage: 0,
};

// Kiểu dữ liệu cho state (dựa theo user.slice.ts)
type initialStatetype = {
  loading: boolean;
  listDiscount: any[]; // Bạn có thể thay any bằng DiscountDataType
  pagination: any;
  message?: any;
  discount?: any; // Dùng để lưu dữ liệu khi getById (cho form Sửa)
};

// Giá trị state ban đầu
const initialState: initialStatetype = {
  loading: false,
  listDiscount: [],
  pagination: pagination,
  message: undefined,
  discount: undefined,
};

// Tạo slice
export const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    // Reducer để reset message (cho thông báo)
    resetMessage: (state) => {
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    // Xử lý getDiscountsFilter
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

    // Xử lý createDiscount
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

    // Xử lý getDiscountById
    builder
      .addCase(getDiscountById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.discount = action.payload; // Chứa 1 object discount
      })
      .addCase(getDiscountById.rejected, (state) => {
        state.loading = false;
        state.discount = null;
      });

    // Xử lý updateDiscount
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

    // Xử lý deleteDiscount
    builder
      .addCase(deleteDiscount.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Xóa thành công!",
        };
      })
      .addCase(deleteDiscount.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Xóa thất bại!",
        };
      });
  },
});

export default discountSlice.reducer;
export const { resetMessage } = discountSlice.actions;
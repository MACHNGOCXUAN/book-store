import http from "@/lib/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllCategories = createAsyncThunk(
  "category/getAllCategories",
  async (name?: string) => {
    const query = name ? `?name=${encodeURIComponent(name)}` : "";
    const response = await http.get(`/categories${query}`);
    return response;
  }
);


export const addCategory = createAsyncThunk(
  "category/addCategory",
  async (data: any) => {
    const response = await http.post("/categories", data);
    return response;
  }
);

export const getCategoryDetail = createAsyncThunk(
  "category/getCategoryDetail",
  async (categoryId: string) => {
    const response = await http.get(`/categories/detail/${categoryId}`);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (data: { id: string; categoryName: string }) => {
    const response = await http.put(`/categories/${data.id}`, {
      categoryName: data.categoryName,
    });
    return response;
  }
);

type CategoryState = {
  categories: Array<{ categoryId: string; categoryName: string }>;
  loading: boolean;
  message: any;
  categoryDetail?: { categoryId: string; categoryName: string };
};

const initialState: CategoryState = {
  categories: [],
  loading: false,
  message: null,
};

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getAllCategories.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Thêm danh mục thành công",
        };
      })
      .addCase(addCategory.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Thêm danh mục thất bại",
        };
      });

    builder
      .addCase(getCategoryDetail.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCategoryDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryDetail = action.payload;
      })
      .addCase(getCategoryDetail.rejected, (state) => {
        state.loading = false;
      });

    builder

      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật danh mục thành công",
        };
      })
      .addCase(updateCategory.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật danh mục thất bại",
        };
      });
  },
});

export default categorySlice.reducer;
export const { resetMessage } = categorySlice.actions;

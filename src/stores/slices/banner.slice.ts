import http from "@/lib/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface BannerFormValues {
  bannerId?: string;
  title: string;
  imageUrl: string; // will store base64 string or URL
  displayOrder?: number;
  isVisible?: boolean;
  url?: string;
}

// --- ĐIỀU CHỈNH 1: getFilterBanner ---
// Thay đổi từ POST sang GET và sử dụng URLSearchParams, giống như getDiscountsFilter.
// Giả định các tham số filter là: title, isVisible, url
export const getFilterBanner = createAsyncThunk(
  "banner/getFilterBanner",
  async (data: any) => {
    const {
      page,
      limit,
      title,
      isVisible,
      url,
    } = data;

    const params = new URLSearchParams();

    // Xử lý pagination
    if (page) {
      params.append("page", (page - 1).toString()); // Giống discountSlice (page 0-based)
    }
    if (limit) {
      params.append("size", limit.toString()); // Giống discountSlice (dùng 'size')
    }

    // Xử lý filter
    if (title) {
      params.append("title", title);
    }
    // Xử lý isVisible (vì là boolean, cần kiểm tra sự tồn tại)
    if (isVisible === true || isVisible === false) {
      params.append("isVisible", isVisible.toString());
    }
    if (url) {
      params.append("url", url);
    }

    // Thay đổi http.post thành http.get với params
    const response = await http.get(`banners?${params.toString()}`);
    return response;
  }
);

export const deleteBanner = createAsyncThunk(
  "banner/deleteBanner",
  async (id: string) => {
    const response = await http.delete(`banners/${id}`);
    return response;
  }
);

export const createBanner = createAsyncThunk(
  "banner/createBanner",
  async (data: BannerFormValues) => {
    const response = await http.post("banners", data);
    return response;
  }
);

// --- ĐIỀU CHỈNH 2: getBannerId -> getBannerById ---
// Đổi tên cho nhất quán với getDiscountById
export const getBannerId = createAsyncThunk(
  "banner/getBannerById",
  async (id: string) => {
    const response = await http.get(`banners/${id}`);
    return response;
  }
);

// Alias for previous/alternate imports: some files expect getBannerById
export const getBannerById = getBannerId;

// --- ĐIỀU CHỈNH 3: updateBanner ---
// Thay đổi signature để nhận { id, data } cho nhất quán
export const updateBanner = createAsyncThunk(
  "banner/updateBanner",
  async (payload: any) => {
    let id: string;
    let data: BannerFormValues;

    // Support two payload shapes:
    // 1) { id, data }
    // 2) { ...values, bannerId }
    if (payload && payload.id && payload.data) {
      id = payload.id;
      data = payload.data;
    } else if (payload && (payload.bannerId || payload.id)) {
      id = payload.bannerId || payload.id;
      const { bannerId, id: _id, ...rest } = payload;
      data = rest as BannerFormValues;
    } else {
      throw new Error("Invalid payload for updateBanner");
    }

    const response = await http.put(`banners/${id}`, data);
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
  listBanner: any[];
  pagination: any;
  message?: any;
  banner?: any; // --- ĐIỀU CHỈNH 4: Thêm 'banner'
};

const initialState: initialStatetype = {
  loading: false,
  listBanner: [],
  pagination: pagination,
  message: undefined, // --- ĐIỀU CHỈNH 5: Thêm 'message'
  banner: undefined, // Thêm 'banner'
};

export const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilterBanner.pending, (state) => {
        state.loading = true;
      })
      // --- ĐIỀU CHỈNH 6: getFilterBanner.fulfilled ---
      // Thêm logic robust để xử lý payload (giống discountSlice)
      .addCase(getFilterBanner.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.listBanner = action.payload;
          state.pagination = pagination;
        } else {
          state.listBanner = action.payload.data || [];
          state.pagination = action.payload.paging || pagination;
        }
      })
      // --- ĐIỀU CHỈNH 7: getFilterBanner.rejected ---
      // Đồng bộ logic rejected (giống discountSlice)
      .addCase(getFilterBanner.rejected, (state) => {
        state.loading = false;
        state.listBanner = []; // Reset danh sách khi lỗi
        state.pagination = pagination;
      });

    builder
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBanner.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Xóa banner thành công!",
        };
      })
      .addCase(deleteBanner.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Xóa banner thất bại!",
        };
      });

    builder
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBanner.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Tạo banner thành công!",
        };
      })
      .addCase(createBanner.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Tạo banner thất bại!",
        };
      });

    // --- ĐIỀU CHỈNH 8: Đổi tên case thành getBannerById ---
    builder
      .addCase(getBannerId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBannerId.fulfilled, (state, action) => {
        state.loading = false;
        state.banner = action.payload; // Logic này đã đúng
      })
      .addCase(getBannerId.rejected, (state) => {
        state.loading = false;
        state.banner = null;
      });

    builder
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBanner.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật banner thành công!",
        };
      })
      .addCase(updateBanner.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật banner thất bại!",
        };
      });
  },
});

export default bannerSlice.reducer;
export const { resetMessage } = bannerSlice.actions;
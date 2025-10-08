import http from "@/lib/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { da } from "zod/locales";

export const getUserStaffFilter = createAsyncThunk(
  "user/getStaff",
  async (data: any) => {
    const response = await http.post("get-staff", data);
    return response;
  }
);

export const getUserCustomerFilter = createAsyncThunk(
  "user/getCustomer",
  async (data: any) => {
    const response = await http.post("get-customer", data);
    return response;
  }
);

export const createStaff = createAsyncThunk(
  "user/createStaff",
  async (data: any) => {
    const response = await http.post("create-staff", data);
    return response;
  }
);

export const getStaffById = createAsyncThunk(
  "user/getStaffById",
  async (id: string) => {
    const response = await http.get(`staff/${id}`);
    return response;
  }
);

export const updateStaff = createAsyncThunk(
  "user/updateStaff",
  async (data: any) => {
    const response = await http.put("staff/update", data);
    return response;
  }
);

export const updateStatusStaff = createAsyncThunk(
  "user/updateStatusStaff",
  async (data: any) => {
    const response = await http.post("staff/update-status", data);
    return response;
  }
);

export const deleteStaff = createAsyncThunk(
  "user/deleteStaff",
  async (id: string) => {
    const response = await http.delete(`staff/${id}`);
    return response;
  }
);

export const deleteCustomer = createAsyncThunk(
  "user/deleteCustomer",
  async (id: string) => {
    const response = await http.delete(`customer/${id}`);
    return response;
  }
);

export const searchPhone = createAsyncThunk(
  "user/searchPhone",
  async (phone: string) => {
    const response = await http.post("customer/search-phone", { phone });
    return response;
  }
);

export const updateStatusCustomer = createAsyncThunk(
  "user/updateStatusCustomer",
  async (data: any) => {
    const response = await http.post("customer/update-status", data);
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
  listStaff: any[];
  listCustomer: any[];
  pagination: any;
  message?: any;
  staff?: any;
};

const initialState: initialStatetype = {
  loading: false,
  listStaff: [],
  listCustomer: [],
  pagination: pagination,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserStaffFilter.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserStaffFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.listStaff = action.payload.data;
        state.pagination = action.payload.paging;
      })
      .addCase(getUserStaffFilter.rejected, (state) => {
        state.loading = false;
        state.listStaff = [];
        state.pagination = pagination;
      });

    builder
      .addCase(getUserCustomerFilter.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserCustomerFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.listCustomer = action.payload.data;
        state.pagination = action.payload.paging;
      })
      .addCase(getUserCustomerFilter.rejected, (state) => {
        state.loading = false;
        state.listCustomer = [];
        state.pagination = pagination;
      });

    builder
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStaff.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Tạo thành công!",
        };
      })
      .addCase(createStaff.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Tạo thất bại!",
        };
      });

    builder
      .addCase(getStaffById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStaffById.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(getStaffById.rejected, (state) => {
        state.loading = false;
        state.staff = null;
      });

    builder
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStaff.fulfilled, (state) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật thành công!",
        };
      })
      .addCase(updateStaff.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật thất bại!",
        };
      });

    builder
      .addCase(updateStatusStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStatusStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật thành công!",
        };
      })
      .addCase(updateStatusStaff.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật thất bại!",
        };
      });

    builder
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Xóa thành công!",
        };
      })
      .addCase(deleteStaff.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Xóa thất bại!",
        };
      });

    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Xóa thành công!",
        };
      })
      .addCase(deleteCustomer.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Xóa thất bại!",
        };
      });

    builder
      .addCase(updateStatusCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStatusCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.message = {
          type: "success",
          message: "Cập nhật thành công!",
        };
      })
      .addCase(updateStatusCustomer.rejected, (state) => {
        state.loading = false;
        state.message = {
          type: "error",
          message: "Cập nhật thất bại!",
        };
      });

    builder
      .addCase(searchPhone.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.listCustomer = action.payload.data;
      })
      .addCase(searchPhone.rejected, (state) => {
        state.loading = false;
        state.listCustomer = [];
      });
  },
});

export default userSlice.reducer;
export const { resetMessage } = userSlice.actions;

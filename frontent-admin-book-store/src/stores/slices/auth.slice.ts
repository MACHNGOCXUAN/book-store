import http from "@/lib/utils/api";
import { UserDataType } from "@/types/users";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


type initialStateType = {
  loading: boolean,
  isAuth: boolean,
  user: UserDataType | null
}

const initialState: initialStateType = {
  loading: false,
  isAuth: false,
  user: null
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await http.post("auth/admin/login-admin", data);
      if (!response.access_token) {
        return rejectWithValue("Sai tài khoản hoặc mật khẩu");
      }
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đăng nhập thất bại");
    }
  }
);


export const getProfileUser = createAsyncThunk(
  "auth/profile",
  async () => {
    const response = await http.get("admin/me")
    return response
  }
)

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: state => {
      state.isAuth = false;
      state.user = null;
      state.loading = false;
      localStorage.removeItem("access_token")
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuth = true;
        localStorage.setItem("access_token", action.payload.access_token)
      })
      .addCase(loginUser.rejected, state => {
        state.loading = false;
        state.isAuth = false
      })

    builder
      .addCase(getProfileUser.pending, state => {
        state.loading = true;
      })
      .addCase(getProfileUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuth = true;
        state.user = action.payload
      })
      .addCase(getProfileUser.rejected, state => {
        state.loading = false;
        state.isAuth = false
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
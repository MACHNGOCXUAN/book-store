import http from "@/lib/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState = {
  loading: false,
  isAuth: false,
  user: null
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: any) => {
    const response = await http.post("http://localhost:8080/api/auth/admin/login", data)
    return response
  }
)

export const getProfileUser = createAsyncThunk(
  "auth/profile",
  async () => {
    const response = await http.get("http://localhost:8080/api/admin/me")
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
        state.user = action.payload.data
      })
      .addCase(getProfileUser.rejected, state => {
        state.loading = false;
        state.isAuth = false
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
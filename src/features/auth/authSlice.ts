import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/User";

type AuthState = {
  token: string | null;
  user: User | null;
};

const initialState: AuthState = {
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") || null : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_profile") || "null")
      : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user?: User }>) {
      state.token = action.payload.token;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      try {
        localStorage.setItem("access_token", action.payload.token);
      } catch {}
      try {
        if (action.payload.user) {
          localStorage.setItem("user_profile", JSON.stringify(action.payload.user));
          if (action.payload.user.fullName) {
            localStorage.setItem("user_fullName", action.payload.user.fullName);
          } else if (action.payload.user.userName) {
            localStorage.setItem("user_fullName", action.payload.user.userName);
          }
        }
      } catch {}
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user_fullName");
      } catch {}
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/User";
import { API_BASE } from "../../config/api";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") || null : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_profile") || "null")
      : null,
  loading: false,
  error: null,
};

// Helper function for safe JSON parsing
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Async thunk for login
export const loginUser = createAsyncThunk<
  { token: string; user?: User },
  { phone: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue((data && (data.message || data)) || `Login failed: ${res.status}`);
      }
      const resData: any = await res.json();
      if (!resData?.access_token) {
        return rejectWithValue("No token received from server");
      }
      const token = resData.access_token;

      // Fetch user profile
      try {
        const profileRes = await fetch(`${API_BASE}/admin/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const user: any = await profileRes.json();
          return {
            token,
            user: {
              userId: user?.userId,
              userName: user?.userName,
              fullName: user?.fullName,
              email: user?.email,
            },
          };
        }
      } catch {
        // If profile fetch fails, return token only
      }

      return { token };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Async thunk for register
export const registerUser = createAsyncThunk<
  void,
  {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    dateOfBirth?: string;
  },
  { rejectValue: string }
>(
  "auth/register",
  async ({ fullName, email, phone, password, dateOfBirth }, { rejectWithValue }) => {
    try {
      const body: any = { fullName, email, phone, password };
      if (dateOfBirth) body.dateOfBirth = dateOfBirth;

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue((data && (data.message || data)) || `Register failed: ${res.status}`);
      }
      return undefined;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Async thunk for Google login
export const googleLogin = createAsyncThunk<
  { token: string; user?: User },
  { idToken: string },
  { rejectValue: string }
>(
  "auth/googleLogin",
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue((data && (data.message || data)) || `Google login failed: ${res.status}`);
      }
      const resData: any = await res.json();
      if (!resData?.access_token) {
        return rejectWithValue("No token received from Google");
      }
      const token = resData.access_token;

      // Fetch user profile
      try {
        const profileRes = await fetch(`${API_BASE}/admin/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const user: any = await profileRes.json();
          return {
            token,
            user: {
              userId: user?.userId,
              userName: user?.userName,
              fullName: user?.fullName,
              email: user?.email,
            },
          };
        }
      } catch {
        // If profile fetch fails, return token only
      }

      return { token };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

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
      state.error = null;
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user_fullName");
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        try {
          localStorage.setItem("access_token", action.payload.token);
          if (action.payload.user) {
            localStorage.setItem("user_profile", JSON.stringify(action.payload.user));
            if (action.payload.user.fullName) {
              localStorage.setItem("user_fullName", action.payload.user.fullName);
            } else if (action.payload.user.userName) {
              localStorage.setItem("user_fullName", action.payload.user.userName);
            }
          }
        } catch {}
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Register failed";
      })

      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        try {
          localStorage.setItem("access_token", action.payload.token);
          if (action.payload.user) {
            localStorage.setItem("user_profile", JSON.stringify(action.payload.user));
            if (action.payload.user.fullName) {
              localStorage.setItem("user_fullName", action.payload.user.fullName);
            } else if (action.payload.user.userName) {
              localStorage.setItem("user_fullName", action.payload.user.userName);
            }
          }
        } catch {}
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Google login failed";
      });
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

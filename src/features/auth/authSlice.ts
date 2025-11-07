import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../config/api";
import type { User } from "../../types";

/* ===================== Auth State Type ===================== */
type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isGoogleLogin: boolean;
};

const initialState: AuthState = {
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || null
      : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_profile") || "null")
      : null,
  loading: false,
  error: null,
  isGoogleLogin:
    typeof window !== "undefined"
      ? localStorage.getItem("isGoogleLogin") === "true"
      : false,
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
  { username: string; password: string; remember?: boolean },
  { rejectValue: string }
>(
  "auth/login",
  async ({ username, password, remember }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue(
          (data && (data.message || data)) || `Login failed: ${res.status}`
        );
      }
      const resData: any = await res.json();
      if (!resData?.access_token) {
        return rejectWithValue("No token received from server");
      }
      const token = resData.access_token;

      // Store remember preference if enabled
      if (remember) {
        try {
          localStorage.setItem("remember_me", "true");
        } catch {}
      }

      // Fetch user profile
      try {
        const profileRes = await fetch(`${API_BASE}/admin/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const user: any = await profileRes.json();
          console.log("User: .............", user);
          return {
            token,
            user: {
              userId: user?.userId,
              userName: user?.userName,
              fullName: user?.fullName,
              email: user?.email,
              phone: user?.phoneNumber,
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

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;

    if (!token) {
      return rejectWithValue("No token available");
    }

    console.log("fetchUserProfile - Token:", token);

    const res = await fetch(`${API_BASE}/admin/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const data = await safeJson(res);
      return rejectWithValue(
        (data && (data.message || data)) || `Fetch failed: ${res.status}`
      );
    }

    const user: any = await res.json();
    console.log("fetchUserProfile - User data:", user);

    // Normalize gender from backend (MALE/FEMALE to male/female)
    const genderValue = user?.gender ? user.gender.toLowerCase() : undefined;

    return {
      userId: user?.userId,
      userName: user?.userName,
      fullName: user?.fullName,
      email: user?.email,
      phone: user?.phoneNumber,
      gender: genderValue,
      birthday: user?.dateOfBirth,
    };
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

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
  async (
    { fullName, email, phone, password, dateOfBirth },
    { rejectWithValue }
  ) => {
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
        return rejectWithValue(
          (data && (data.message || data)) || `Register failed: ${res.status}`
        );
      }
      return undefined;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Async thunk for updating user profile
export const updateUser = createAsyncThunk<
  User,
  {
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
  },
  { rejectValue: string }
>(
  "auth/updateUser",
  async (
    { fullName, email, phone, gender, dateOfBirth },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue("No token available");
      }

      console.log("updateUser - Token:", token);
      console.log("updateUser - Data:", {
        fullName,
        email,
        phone,
        gender,
        dateOfBirth,
      });

      const body: any = {};
      if (fullName) body.fullName = fullName;
      if (email) body.email = email;
      if (phone) body.phone = phone;
      if (gender) body.gender = gender;
      if (dateOfBirth) body.dateOfBirth = dateOfBirth;

      const res = await fetch(`${API_BASE}/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue(
          (data && (data.message || data)) || `Update failed: ${res.status}`
        );
      }

      const updatedUser: any = await res.json();
      console.log("updateUser - Response:", updatedUser);

      // Normalize gender from backend (MALE/FEMALE to male/female)
      const genderValue = updatedUser?.gender
        ? updatedUser.gender.toLowerCase()
        : undefined;

      return {
        userId: updatedUser?.userId,
        userName: updatedUser?.userName,
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        phone: updatedUser?.phoneNumber,
        gender: genderValue,
        birthday: updatedUser?.dateOfBirth,
      };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Async thunk for requesting OTP
export const requestOtp = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/requestOtp", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/password/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await safeJson(res);
      return rejectWithValue(
        (data && (data.error || data.message)) ||
          `Request OTP failed: ${res.status}`
      );
    }
    return undefined;
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

// Async thunk for resetting password with OTP
export const resetPasswordWithOtp = createAsyncThunk<
  void,
  { email: string; otp: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/resetPasswordWithOtp",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/password/otp/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue(
          (data && (data.error || data.message)) ||
            `Reset password failed: ${res.status}`
        );
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
  { idToken: string; remember?: boolean },
  { rejectValue: string }
>("auth/googleLogin", async ({ idToken, remember }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const data = await safeJson(res);
      return rejectWithValue(
        (data && (data.message || data)) || `Google login failed: ${res.status}`
      );
    }
    const resData: any = await res.json();
    if (!resData?.access_token) {
      return rejectWithValue("No token received from Google");
    }
    const token = resData.access_token;

    // Store remember preference if enabled
    if (remember) {
      try {
        localStorage.setItem("remember_me", "true");
      } catch {}
    }

    // Backend giờ đã trả về user info trong response
    if (resData?.user) {
      console.log(
        "Google login user info from response: .............",
        resData.user
      );
      return {
        token,
        user: {
          userId: resData.user?.userId,
          userName: resData.user?.userName,
          fullName: resData.user?.fullName,
          email: resData.user?.email,
          phone: resData.user?.phoneNumber,
        },
      };
    }

    // Fallback: Fetch user profile nếu response không có user info
    try {
      const profileRes = await fetch(`${API_BASE}/admin/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const user: any = await profileRes.json();
        console.log(
          "Google login user profile from /admin/me: .............",
          user
        );

        // Normalize gender from backend (MALE/FEMALE to male/female)
        const genderValue = user?.gender
          ? user.gender.toLowerCase()
          : undefined;

        return {
          token,
          user: {
            userId: user?.userId,
            userName: user?.userName,
            fullName: user?.fullName,
            email: user?.email,
            phone: user?.phoneNumber,
            gender: genderValue,
            birthday: user?.dateOfBirth,
          },
        };
      } else {
        console.warn("Profile fetch failed with status:", profileRes.status);
      }
    } catch (profileError) {
      console.error(
        "Error fetching user profile after Google login:",
        profileError
      );
    }

    return { token };
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

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
      } catch (error) {
        console.log(error);
      }
      try {
        if (action.payload.user) {
          localStorage.setItem(
            "user_profile",
            JSON.stringify(action.payload.user)
          );
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
      state.isGoogleLogin = false;
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user_fullName");
        localStorage.removeItem("remember_me");
        localStorage.removeItem("isGoogleLogin");
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
            localStorage.setItem(
              "user_profile",
              JSON.stringify(action.payload.user)
            );
            if (action.payload.user.fullName) {
              localStorage.setItem(
                "user_fullName",
                action.payload.user.fullName
              );
            } else if (action.payload.user.userName) {
              localStorage.setItem(
                "user_fullName",
                action.payload.user.userName
              );
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

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        try {
          localStorage.setItem("user_profile", JSON.stringify(action.payload));
          if (action.payload.fullName) {
            localStorage.setItem("user_fullName", action.payload.fullName);
          }
        } catch {}
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Fetch failed";
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        try {
          localStorage.setItem("user_profile", JSON.stringify(action.payload));
          if (action.payload.fullName) {
            localStorage.setItem("user_fullName", action.payload.fullName);
          }
        } catch {}
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Update failed";
      })

      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Request OTP failed";
      })

      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Reset password failed";
      })

      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isGoogleLogin = true;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        try {
          localStorage.setItem("access_token", action.payload.token);
          localStorage.setItem("isGoogleLogin", "true");
          if (action.payload.user) {
            localStorage.setItem(
              "user_profile",
              JSON.stringify(action.payload.user)
            );
            if (action.payload.user.fullName) {
              localStorage.setItem(
                "user_fullName",
                action.payload.user.fullName
              );
            } else if (action.payload.user.userName) {
              localStorage.setItem(
                "user_fullName",
                action.payload.user.userName
              );
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

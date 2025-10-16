import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type User = {
  userId?: string;
  userName?: string;
  fullName?: string;
  email?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
};

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? (localStorage.getItem('access_token') || null) : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user_profile') || 'null') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user?: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user || state.user;
      try { localStorage.setItem('access_token', action.payload.token); } catch (e) {}
      try { if (action.payload.user) localStorage.setItem('user_profile', JSON.stringify(action.payload.user)); } catch (e) {}
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      try { localStorage.removeItem('access_token'); localStorage.removeItem('user_profile'); } catch (e) {}
    }
  }
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

// src/features/loyalty/loyaltySlice.ts

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AvailableVoucher,
  ExchangeableVoucher,
  LoyaltyInfo,
  TierUpgradeNotification,
} from "../../types/loyalty";
import {
  fetchAvailableVouchers,
  fetchExchangeableVouchers,
  fetchLoyaltyInfo,
} from "../../services/loyaltyService";
export interface LoyaltyState {
  info: LoyaltyInfo | null;
  exchangeableVouchers: ExchangeableVoucher[];
  availableVouchers: AvailableVoucher[];
  currentAppliedVoucherId: string | null;
  tierUpgradeNotification: TierUpgradeNotification | null;
  loading: boolean;
  error: string | null;
}

const initialState: LoyaltyState = {
  info: null,
  exchangeableVouchers: [],
  availableVouchers: [],
  currentAppliedVoucherId: null,
  tierUpgradeNotification: null,
  loading: false,
  error: null,
};

// Async thunks
export const loadLoyaltyInfo = createAsyncThunk(
  "loyalty/loadInfo",
  async (token: string, { rejectWithValue }) => {
    try {
      return await fetchLoyaltyInfo(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadExchangeableVouchers = createAsyncThunk(
  "loyalty/loadExchangeable",
  async (token: string, { rejectWithValue }) => {
    try {
      return await fetchExchangeableVouchers(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadAvailableVouchers = createAsyncThunk(
  "loyalty/loadAvailable",
  async (
    { token, cartTotal }: { token: string; cartTotal: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchAvailableVouchers(token, cartTotal);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const loyaltySlice = createSlice({
  name: "loyalty",
  initialState,
  reducers: {
    setAppliedVoucher: (state, action: PayloadAction<string | null>) => {
      state.currentAppliedVoucherId = action.payload;
    },
    setTierUpgradeNotification: (
      state,
      action: PayloadAction<TierUpgradeNotification | null>
    ) => {
      state.tierUpgradeNotification = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearNotification: (state) => {
      state.tierUpgradeNotification = null;
    },
  },
  extraReducers: (builder) => {
    // Load Loyalty Info
    builder
      .addCase(loadLoyaltyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLoyaltyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload;
      })
      .addCase(loadLoyaltyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load Exchangeable Vouchers
    builder
      .addCase(loadExchangeableVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExchangeableVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeableVouchers = action.payload;
      })
      .addCase(loadExchangeableVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load Available Vouchers
    builder
      .addCase(loadAvailableVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAvailableVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableVouchers = action.payload;
      })
      .addCase(loadAvailableVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAppliedVoucher,
  setTierUpgradeNotification,
  clearError,
  clearNotification,
} = loyaltySlice.actions;

export default loyaltySlice.reducer;

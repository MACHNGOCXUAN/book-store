// src/features/loyalty/rewardExchangeSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  ExchangeRewardRequest,
  ExchangeRewardResponse,
} from "../../types/loyalty";
import { exchangeVoucher } from "../../services/loyaltyService";

export interface RewardExchangeState {
  exchangeResponse: ExchangeRewardResponse | null;
  isExchanging: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RewardExchangeState = {
  exchangeResponse: null,
  isExchanging: false,
  error: null,
  successMessage: null,
};

export const performExchange = createAsyncThunk(
  "rewards/exchange",
  async (
    {
      token,
      request,
    }: {
      token: string;
      request: ExchangeRewardRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      return await exchangeVoucher(token, request);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const rewardExchangeSlice = createSlice({
  name: "rewardExchange",
  initialState,
  reducers: {
    clearExchangeState: (state) => {
      state.exchangeResponse = null;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performExchange.pending, (state) => {
        state.isExchanging = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(performExchange.fulfilled, (state, action) => {
        state.isExchanging = false;
        state.exchangeResponse = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(performExchange.rejected, (state, action) => {
        state.isExchanging = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearExchangeState, clearError } = rewardExchangeSlice.actions;

export default rewardExchangeSlice.reducer;

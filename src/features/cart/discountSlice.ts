// src/features/cart/discountSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApplyVoucherResponse } from "@/types/loyalty";
import { applyVoucher } from "@/services/loyaltyService";

export interface DiscountState {
  appliedVoucher: ApplyVoucherResponse | null;
  discountAmount: number;
  finalTotal: number;
  isApplying: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: DiscountState = {
  appliedVoucher: null,
  discountAmount: 0,
  finalTotal: 0,
  isApplying: false,
  error: null,
  successMessage: null,
};

export const applyDiscount = createAsyncThunk(
  "discount/apply",
  async (
    {
      token,
      voucherId,
      cartTotal,
    }: {
      token: string;
      voucherId: string;
      cartTotal: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await applyVoucher(token, voucherId, cartTotal);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscount: (state) => {
      state.appliedVoucher = null;
      state.discountAmount = 0;
      state.finalTotal = 0;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCartTotal: (state, action: PayloadAction<number>) => {
      state.finalTotal = action.payload - state.discountAmount;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyDiscount.pending, (state) => {
        state.isApplying = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyDiscount.fulfilled, (state, action) => {
        state.isApplying = false;
        state.appliedVoucher = action.payload;
        state.discountAmount = action.payload.discountAmount || 0;
        state.finalTotal = action.payload.finalTotal || 0;
        state.successMessage = action.payload.message;
      })
      .addCase(applyDiscount.rejected, (state, action) => {
        state.isApplying = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDiscount, clearError, setCartTotal } =
  discountSlice.actions;

export default discountSlice.reducer;

// src/features/discount/discountCodeSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { applyDiscountCode as applyDiscountCodeService } from "@/services/loyaltyService";

export interface DiscountCodeState {
  appliedCode: string | null;
  discountAmount: number;
  message: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DiscountCodeState = {
  appliedCode: null,
  discountAmount: 0,
  message: null,
  isLoading: false,
  error: null,
};

/**
 * Async thunk để áp dụng discount code
 */
export const applyDiscountCode = createAsyncThunk(
  "discountCode/apply",
  async (
    {
      token,
      code,
      cartTotal,
    }: {
      token: string;
      code: string;
      cartTotal: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await applyDiscountCodeService(token, code, cartTotal);
      return {
        appliedCode: code,
        discountAmount: response.discountAmount || 0,
        message:
          response.message ||
          `Áp dụng thành công! Tiết kiệm ${response.discountAmount}₫`,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể áp dụng mã giảm giá");
    }
  }
);

const discountCodeSlice = createSlice({
  name: "discountCode",
  initialState,
  reducers: {
    clearDiscountCode: (state) => {
      state.appliedCode = null;
      state.discountAmount = 0;
      state.message = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyDiscountCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(applyDiscountCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appliedCode = action.payload.appliedCode;
        state.discountAmount = action.payload.discountAmount;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(applyDiscountCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.appliedCode = null;
        state.discountAmount = 0;
      });
  },
});

export const { clearDiscountCode, clearError } = discountCodeSlice.actions;
export default discountCodeSlice.reducer;

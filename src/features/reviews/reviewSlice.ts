import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Comment } from "../../types";
import { API_BASE } from "../../config/api";

const REVIEWS_API = `${API_BASE}/reviews`;

interface ReviewState {
  reviews: Comment[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  success: false,
};

/* ===== API Helper Functions ===== */

async function fetchReviewsFromApi(bookId: string): Promise<Comment[]> {
  const response = await fetch(`${REVIEWS_API}/book/${bookId}`);
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return await response.json();
}

async function createReviewOnApi(payload: {
  bookId: string;
  customerId: string;
  rating: number;
  content: string;
}): Promise<Comment> {
  const response = await fetch(REVIEWS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create review");
  return await response.json();
}

async function updateReviewOnApi(
  reviewId: string,
  payload: { rating: number; content: string },
  userId?: string
): Promise<Comment> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (userId) headers["X-User-Id"] = userId;
  
  const response = await fetch(`${REVIEWS_API}/${reviewId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.text();
    console.error("Update review error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorData,
      reviewId,
      userId,
    });
    throw new Error(`Failed to update review: ${response.status} ${errorData}`);
  }
  return await response.json();
}

async function deleteReviewOnApi(reviewId: string, userId?: string): Promise<void> {
  const headers: HeadersInit = {};
  if (userId) headers["X-User-Id"] = userId;
  
  const response = await fetch(`${REVIEWS_API}/${reviewId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const errorData = await response.text();
    console.error("Delete review error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorData,
      reviewId,
      userId,
    });
    throw new Error(`Failed to delete review: ${response.status} ${errorData}`);
  }
}

/* ===== Exported API Functions ===== */
export const reviewApi = {
  getReviewsByBookId: fetchReviewsFromApi,
  createReview: createReviewOnApi,
  updateReview: updateReviewOnApi,
  deleteReview: deleteReviewOnApi,
};

/* ===== Async Thunks ===== */

export const fetchReviewsByBookId = createAsyncThunk(
  "reviews/fetchReviewsByBookId",
  async (bookId: string, { rejectWithValue }) => {
    try {
      return await fetchReviewsFromApi(bookId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReviewThunk = createAsyncThunk(
  "reviews/createReview",
  async (payload: { bookId: string; customerId: string; rating: number; content: string }, { rejectWithValue }) => {
    try {
      return await createReviewOnApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReviewThunk = createAsyncThunk(
  "reviews/updateReview",
  async (payload: { reviewId: string; rating: number; content: string; userId?: string }, { rejectWithValue }) => {
    try {
      return await updateReviewOnApi(payload.reviewId, { rating: payload.rating, content: payload.content }, payload.userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReviewThunk = createAsyncThunk(
  "reviews/deleteReview",
  async (payload: { reviewId: string; userId?: string }, { rejectWithValue }) => {
    try {
      await deleteReviewOnApi(payload.reviewId, payload.userId);
      return payload.reviewId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/* ===== Redux Slice ===== */

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    addReviewLocal: (state, action: PayloadAction<Comment>) => { state.reviews.unshift(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByBookId.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReviewsByBookId.fulfilled, (state, action) => { state.loading = false; state.reviews = action.payload; })
      .addCase(fetchReviewsByBookId.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(createReviewThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createReviewThunk.fulfilled, (state, action) => { state.loading = false; state.reviews.unshift(action.payload); state.success = true; })
      .addCase(createReviewThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(updateReviewThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex((r) => r.review_id === action.payload.review_id);
        if (index !== -1) state.reviews[index] = action.payload;
        state.success = true;
      })
      .addCase(updateReviewThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(deleteReviewThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r.review_id !== Number(action.payload));
        state.success = true;
      })
      .addCase(deleteReviewThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError, clearSuccess, addReviewLocal } = reviewSlice.actions;
export default reviewSlice.reducer;

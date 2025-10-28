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

/* ===== Utility Functions ===== */

/**
 * Normalize review data from API response to Comment type
 * Backend returns snake_case, we need to handle both formats
 */
function normalizeReview(data: any): Comment {
  return {
    review_id: data.review_id || data.reviewId || "",
    content: data.content || "",
    rating: data.rating || 0,
    rating_date:
      data.rating_date ||
      data.ratingDate ||
      new Date().toISOString().split("T")[0],
    customer_id: data.customer_id || data.customerId || "",
    customer_name: data.customer_name || data.customerName || "Khách hàng",
    customer_full_name: data.customer_full_name || data.customerFullName || "",
    book_id: data.book_id || data.bookId || "",
    bookTitle: data.book_title || data.bookTitle || "",
    customerId: data.customer_id || data.customerId || "",
    customerName: data.customer_name || data.customerName || "Khách hàng",
    customerFullName: data.customer_full_name || data.customerFullName || "",
    bookId: data.book_id || data.bookId || "",
  };
}

/* ===== API Helper Functions ===== */

async function fetchReviewsFromApi(bookId: string): Promise<Comment[]> {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${REVIEWS_API}/book/${bookId}`, { headers });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Fetch reviews error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
        bookId,
      });
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }

    const data = await response.json();
    // Normalize each review to handle snake_case from backend
    return Array.isArray(data) ? data.map(normalizeReview) : [];
  } catch (error) {
    console.error("Error in fetchReviewsFromApi:", error);
    throw error;
  }
}

async function createReviewOnApi(payload: {
  bookId: string;
  customerId: string;
  rating: number;
  content: string;
}): Promise<Comment> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const response = await fetch(REVIEWS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create review");
  const data = await response.json();
  return normalizeReview(data);
}

async function updateReviewOnApi(
  reviewId: string,
  payload: { rating: number; content: string },
  userId?: string
): Promise<Comment> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (userId) {
    // Send user ID in headers for authorization check
    headers["X-User-Id"] = userId;
    headers["X-Customer-Id"] = userId;
  }

  // Backend expects review ID in path and user ID in header
  const url = `${REVIEWS_API}/${encodeURIComponent(reviewId)}`;

  const response = await fetch(url, {
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
  const data = await response.json();
  return normalizeReview(data);
}

async function deleteReviewOnApi(
  reviewId: string,
  userId?: string
): Promise<string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (userId) {
    headers["X-User-Id"] = userId;
    headers["X-Customer-Id"] = userId;
  }

  // Backend expects review ID in path and user ID in header
  const url = `${REVIEWS_API}/${encodeURIComponent(reviewId)}`;

  console.log("Deleting review:", { reviewId, userId, url, headers });

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    console.log(
      "Delete response status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Delete review error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
        reviewId,
        userId,
      });
      throw new Error(
        `Failed to delete review: ${response.status} ${errorData}`
      );
    }

    console.log("Review deleted successfully:", reviewId);
    return reviewId;
  } catch (error) {
    console.error("Delete review request failed:", error);
    throw error;
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
  async (
    payload: {
      bookId: string;
      customerId: string;
      rating: number;
      content: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await createReviewOnApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReviewThunk = createAsyncThunk(
  "reviews/updateReview",
  async (
    payload: {
      reviewId: string;
      rating: number;
      content: string;
      userId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await updateReviewOnApi(
        payload.reviewId,
        { rating: payload.rating, content: payload.content },
        payload.userId
      );
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReviewThunk = createAsyncThunk(
  "reviews/deleteReview",
  async (
    payload: { reviewId: string; userId?: string },
    { rejectWithValue }
  ) => {
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
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    addReviewLocal: (state, action: PayloadAction<Comment>) => {
      state.reviews.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByBookId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByBookId.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByBookId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.success = true;
      })
      .addCase(createReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(
          (r) => r.review_id === action.payload.review_id
        );
        if (index !== -1) state.reviews[index] = action.payload;
        state.success = true;
      })
      .addCase(updateReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Deleting review from state with ID:", action.payload);
        const beforeLength = state.reviews.length;
        state.reviews = state.reviews.filter(
          (r) => r.review_id !== action.payload
        );
        const afterLength = state.reviews.length;
        console.log(
          `Reviews filtered: before=${beforeLength}, after=${afterLength}, deleted=${
            beforeLength - afterLength
          }`
        );
        state.success = true;
      })
      .addCase(deleteReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, addReviewLocal } = reviewSlice.actions;
export default reviewSlice.reducer;

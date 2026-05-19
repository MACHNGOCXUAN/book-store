import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../config/api";
import type { Book } from "../../types";

/* ===================== Book State Type ===================== */
type BookState = {
  books: Book[];
  loading: boolean;
  error: string | null;
};

const initialState: BookState = {
  books: [],
  loading: false,
  error: null,
};

// Fetch all books
export const fetchBooks = createAsyncThunk<
  Book[],
  void,
  { rejectValue: string }
>("books/fetchBooks", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/books`);
    if (!res.ok) {
      return rejectWithValue(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as Book[];
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Fetch book by ID
export const getBookById = createAsyncThunk<
  Book,
  string,
  { rejectValue: string }
>("books/getBookById", async (bookId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/books/${bookId}`);
    if (!res.ok) {
      return rejectWithValue("Không tìm thấy sản phẩm");
    }
    const data = (await res.json()) as Book;
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Fetch books by category ID
export const fetchBooksByCategory = createAsyncThunk<
  Book[],
  string,
  { rejectValue: string }
>("books/fetchBooksByCategory", async (categoryId, { rejectWithValue }) => {
  try {
    const res = await fetch(
      `${API_BASE}/books/categories/${encodeURIComponent(categoryId)}`
    );
    if (!res.ok) {
      return rejectWithValue(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as Book[];
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Search books by keyword
export const searchBooks = createAsyncThunk<
  Book[],
  string,
  { rejectValue: string }
>("books/searchBooks", async (keyword, { rejectWithValue }) => {
  try {
    const res = await fetch(
      `${API_BASE}/books/search?search=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) {
      return rejectWithValue(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as Book[];
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Lỗi khi tải dữ liệu";
      })
      .addCase(fetchBooksByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooksByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooksByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Lỗi khi tải danh mục sách";
      })
      .addCase(searchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Lỗi khi tìm kiếm sách";
      });
  },
});

export default bookSlice.reducer;

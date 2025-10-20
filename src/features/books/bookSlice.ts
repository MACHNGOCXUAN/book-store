import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Book } from "../../types/Book";
import { API_BASE } from "../../config/api";


interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
}

const initialState: BookState = {
  books: [],
  loading: false,
  error: null,
};

// Fetch all books
export const fetchBooks = createAsyncThunk<Book[], void, { rejectValue: string }>(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
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
  }
);

// Fetch book by ID
export const getBookById = createAsyncThunk<Book, string, { rejectValue: string }>(
  "books/getBookById",
  async (bookId, { rejectWithValue }) => {
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
  }
);

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
        state.books = action.payload; // vẫn hợp lệ
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Lỗi khi tải dữ liệu";
      });
  },
});

export default bookSlice.reducer;

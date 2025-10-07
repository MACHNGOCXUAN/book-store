import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Book } from "../../types/Book";


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

// Gọi API Spring Boot: GET http://localhost:8080/api/books
export const fetchBooks = createAsyncThunk<Book[], void, { rejectValue: string }>(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8080/api/books");
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

import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "../features/books/bookSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    books: bookReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

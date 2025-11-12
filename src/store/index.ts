import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "../features/books/bookSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import { reviewReducer } from "../features/reviews";
import ordersReducer from "../features/orders/ordersSlice";
import addressReducer from "../features/addresses/addressSlice";
import sessionReducer from "../features/session/session.slice";

export const store = configureStore({
  reducer: {
    books: bookReducer,
    auth: authReducer,
    cart: cartReducer,
    reviews: reviewReducer,
    orders: ordersReducer,
    addresses: addressReducer,
    session: sessionReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

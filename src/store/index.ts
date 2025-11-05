import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "../features/books/bookSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import { reviewReducer } from "../features/reviews";
import orderReducer from "../features/orders/orderSlice";
import addressReducer from "../features/addresses/addressSlice";

export const store = configureStore({
  reducer: {
    books: bookReducer,
    auth: authReducer,
    cart: cartReducer,
    reviews: reviewReducer,
    orders: orderReducer,
    addresses: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

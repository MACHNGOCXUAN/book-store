import { configureStore } from "@reduxjs/toolkit";
import addressReducer from "../features/addresses/addressSlice";
import authReducer from "../features/auth/authSlice";
import bannerReducer from "../features/banner/bannerSlice";
import bookReducer from "../features/books/bookSlice";
import cartReducer from "../features/cart/cartSlice";
import ordersReducer from "../features/orders/ordersSlice";
import { reviewReducer } from "../features/reviews";
import sessionReducer from "../features/session/session.slice";

export const store = configureStore({
  reducer: {
    books: bookReducer,
    auth: authReducer,
    cart: cartReducer,
    reviews: reviewReducer,
    orders: ordersReducer,
    addresses: addressReducer,
    session: sessionReducer,
    banner: bannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

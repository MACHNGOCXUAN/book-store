import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth.slice'
import userReducer from "./slices/user.slice"
import productReducer from "./slices/product.slice"
import sessionReducer from "./slices/session.slice"
import discountReducer from "./slices/discount.slice"
import orderReducer from "./slices/order.slice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      product: productReducer,
      session: sessionReducer,
      discount: discountReducer,
      order: orderReducer
    },
  })
}

export const store = makeStore();

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
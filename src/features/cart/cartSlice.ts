import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

// API helpers
import { getCartItems, addCartItem, deleteCartItem } from '../../lib/api';

// Server CartItem shape (partial)
export interface ServerCartItem {
  cartItemId: string;
  quantity: number;
  unitPrice: number;
  book: any;
}

export type CartState = {
  items: ServerCartItem[];
  status: 'idle' | 'loading' | 'failed';
  error?: string | null;
};

const initialState: CartState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const items = await getCartItems();
  return items as ServerCartItem[];
});

export const addOrUpdateCartItem = createAsyncThunk(
  'cart/addOrUpdate',
  async ({ bookId, quantity }: { bookId: string; quantity: number }) => {
    // backend returns created/updated CartItem or 204
    const res = await addCartItem(bookId, quantity);
    return res; // may be null
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/remove',
  async ({ cartItemId }: { cartItemId: string }) => {
    await deleteCartItem(cartItemId);
    return cartItemId;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchCart.fulfilled, (s, a) => { s.status = 'idle'; s.items = a.payload || []; })
      .addCase(fetchCart.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })

      .addCase(addOrUpdateCartItem.fulfilled, (s, a) => {
        // optimistic: we will refetch in UI after calling the thunk if needed
        // If API returned a CartItem, try to upsert it locally
        const it = a.payload as ServerCartItem | null;
        if (!it) return;
        const idx = s.items.findIndex(x => x.cartItemId === it.cartItemId || (x.book && it.book && x.book.bookId === it.book.bookId));
        if (idx >= 0) s.items[idx] = it as any;
        else s.items.push(it as any);
      })
      .addCase(removeCartItem.fulfilled, (s, a) => {
        const cartItemId = a.payload as string;
        s.items = s.items.filter(it => it.cartItemId !== cartItemId);
      });
  }
});

export const selectCartItems = (state: RootState) => state.cart.items;
export default cartSlice.reducer;

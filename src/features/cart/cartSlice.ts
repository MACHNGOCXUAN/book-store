import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { API_BASE } from '../../config/api';

/* ===================== Cart State Type ===================== */
interface ServerCartItem {
  cartItemId: string;
  quantity: number;
  unitPrice: number;
  book: any;
}

type CartState = {
  items: ServerCartItem[];
  status: 'idle' | 'loading' | 'failed';
  error?: string | null;
};

const initialState: CartState = {
  items: [],
  status: 'idle',
  error: null,
};

// Helper function for safe JSON parsing
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Fetch cart items for current user
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE}/cart/me`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return [];
      const cart = await res.json();
      return Array.isArray(cart?.items) ? cart.items : [];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Add or update cart item
export const addOrUpdateCartItem = createAsyncThunk(
  'cart/addOrUpdate',
  async ({ bookId, quantity }: { bookId: string; quantity: number }, { rejectWithValue }) => {
    try {
      // Get customerId from localStorage
      let customerId: string | null = null;
      try {
        const stored = localStorage.getItem('user_profile');
        if (stored) {
          const p = JSON.parse(stored);
          customerId = p?.userId ?? null;
        }
      } catch (e) {
        // ignore
      }
      if (!customerId) {
        return rejectWithValue('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId, bookId, quantity }),
      });

      if (res.status === 204) return null; // item removed
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue((data && (data.message || JSON.stringify(data))) || `Add to cart failed: ${res.status}`);
      }
      return res.json();
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Remove cart item
export const removeCartItem = createAsyncThunk(
  'cart/remove',
  async ({ cartItemId }: { cartItemId: string }, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE}/cart/${encodeURIComponent(cartItemId)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const data = await safeJson(res);
        return rejectWithValue((data && (data.message || JSON.stringify(data))) || `Delete cart item failed: ${res.status}`);
      }
      return cartItemId;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
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

const API_BASE = "http://localhost:8080";

type LoginRes = { access_token: string };

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function login(phone: string, password: string): Promise<LoginRes> {
  const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error((data && (data.message || data)) || `Login failed: ${res.status}`);
  }
  return res.json();
}

export async function register(fullName: string, email: string, phone: string, password: string, address?: string, dateOfBirth?: string) {
  const body: any = { fullName, email, phone, password };
  if (address) body.address = address;
  if (dateOfBirth) body.dateOfBirth = dateOfBirth; // expect yyyy-MM-dd

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error((data && (data.message || data)) || `Register failed: ${res.status}`);
  }
  return res.json();
}

export async function getProfile(tokenOverride?: string | null) {
  const token = tokenOverride ?? (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (!token) return null; // no token available, caller should handle this

  const res = await fetch(`${API_BASE}/api/admin/me`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    // return null for unauthorized/forbidden so callers can fallback gracefully
    if (res.status === 401 || res.status === 403) return null;
    const data = await safeJson(res);
    throw new Error((data && (data.message || data)) || `Profile fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function addCartItem(bookId: string, quantity = 1) {
  // Try to obtain customerId from profile endpoint or localStorage
  const profile = await getProfile().catch(() => null);
  let customerId: string | null = profile?.userId ?? null;
  if (!customerId) {
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const p = JSON.parse(stored);
        customerId = p?.userId ?? null;
      }
    } catch (e) {
      // ignore
    }
  }
  if (!customerId) throw new Error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');

  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}/api/cart`, {
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
    throw new Error((data && (data.message || JSON.stringify(data))) || `Add to cart failed: ${res.status}`);
  }
  return res.json();
}

export async function getCartItems() {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}/api/cart/me`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return [];
  try {
    const cart = await res.json();
    return Array.isArray(cart?.items) ? cart.items : [];
  } catch {
    return [];
  }
}

export async function deleteCartItem(cartItemId: string) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}/api/cart/${encodeURIComponent(cartItemId)}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error((data && (data.message || JSON.stringify(data))) || `Delete cart item failed: ${res.status}`);
  }
  return true;
}

export async function getBookById(bookId: string) {
  const res = await fetch(`${API_BASE}/api/books/${bookId}`);
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    throw new Error("Không tìm thấy sản phẩm");
  }
}

export default { login, register, getProfile };

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

export async function register(fullName: string, email: string, phone: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, phone, password }),
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

export default { login, register, getProfile };

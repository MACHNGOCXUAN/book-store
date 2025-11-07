// src/components/Header.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { API_BASE } from "../config/api";
import { fetchBooks } from "../features/books/bookSlice";
import { fetchCart } from "../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Book } from "../types";

// Icons
import {
  BookOutlined,
  MenuOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

// Ant Design
import type { MenuProps } from "antd";
import { Badge, Button, Grid, Input } from "antd";

// Local
import { toast } from "react-toastify";
import { clearAuth } from "../features/auth/authSlice";
import AuthModal from "./AuthModal";

// Import các component con
import HeaderActions from "./header/HeaderActions";
import HeaderCategoryMenu from "./header/HeaderCategoryMenu";
import HeaderMobileDrawer from "./header/HeaderMobileDrawer";
import HeaderSearchModal from "./header/HeaderSearchModal";
import HeaderSecondaryNav from "./header/HeaderSecondaryNav";
import HeaderTopBanner from "./header/HeaderTopBanner";

const { useBreakpoint } = Grid;

const Header = () => {
  // -------------------- Redux --------------------
  const authUser = useAppSelector((s) => s.auth.user);
  const bookData = useAppSelector((s) => s.books.books);
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  // -------------------- Local states --------------------
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [fallbackFullName, setFallbackFullName] = useState<string>("");

  const screens = useBreakpoint();
  const navigate = useNavigate();
  const searchDebounce = useRef<number | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const token = useAppSelector((s) => s.auth.token);

  // -------------------- Derived data --------------------
  const cartCount = useMemo(() => {
    return Array.isArray(cartItems) ? cartItems.length : 0;
  }, [cartItems]);

  const isLoggedIn = !!authUser;
  const displayName =
    authUser?.fullName || authUser?.userName || fallbackFullName || "Tài khoản";

  // -------------------- Effects --------------------
  // 1) Lấy books cho menu danh mục
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // 2) Lấy cart items khi user đăng nhập
  useEffect(() => {
    if (!authUser) return;
    dispatch(fetchCart());
  }, [authUser, dispatch]);

  // 3) Lắng nghe 'cart-updated' event để refetch cart
  useEffect(() => {
    let mounted = true;
    const handler = () => {
      if (mounted) {
        dispatch(fetchCart());
      }
    };
    window.addEventListener("cart-updated", handler as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("cart-updated", handler as EventListener);
    };
  }, [dispatch]);

  // 4) Fallback đọc tên từ localStorage lúc mount (chỉ 1 lần)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_fullName");
      if (stored && !authUser) setFallbackFullName(stored);
    } catch {
      /* ignore */
    }
  }, []); // mount-only

  // 5) Khi Redux user thay đổi, cập nhật fallbackName
  useEffect(() => {
    if (authUser?.fullName) {
      setFallbackFullName(authUser.fullName);
    } else if (authUser?.userName) {
      setFallbackFullName(authUser.userName);
    }
  }, [authUser]);

  // -------------------- Derived menus --------------------
  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>(); // id -> name
    bookData.forEach((b) => {
      if (b.category && b.category.categoryId && b.category.categoryName) {
        categoryMap.set(b.category.categoryId, b.category.categoryName);
      }
    });
    return Array.from(categoryMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "vi")
    );
  }, [bookData]);

  // Menu items cho cả desktop và mobile
  const categoryMenuItems: MenuProps["items"] = useMemo(() => {
    if (!categories.length) {
      return [{ key: "no-cat", disabled: true, label: "Chưa có danh mục." }];
    }
    return categories.map(([categoryId, categoryName]) => ({
      key: `/categories/${encodeURIComponent(categoryId)}`,
      label: (
        <Link
          style={{ textDecoration: "none" }}
          to={`/categories/${encodeURIComponent(categoryId)}`}
        >
          {categoryName}
        </Link>
      ),
      icon: <BookOutlined />,
    }));
  }, [categories]);

  // -------------------- Handlers --------------------
  const handleSearch = (value?: string) => {
    const q = (value ?? searchValue).trim();
    if (!q) return;
    // Navigate to FilterCategory page with type 'search' and pass the query param
    navigate(`/categories/search?search=${encodeURIComponent(q)}`);
    setSearchValue("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setOpenDrawer(false);
    setIsSearchModalOpen(false);
  };

  // Select suggestion -> go to book detail
  const handleSelectSuggestion = (book: Book) => {
    navigate(`/books/${book.bookId}`);
    setSearchValue("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  // Debounced effect: call API when searchValue changes
  useEffect(() => {
    const q = searchValue.trim();

    // clear previous debounce
    if (searchDebounce.current) {
      window.clearTimeout(searchDebounce.current);
      searchDebounce.current = null;
    }

    // abort previous fetch
    if (searchAbort.current) {
      try {
        searchAbort.current.abort();
      } catch {
        /* ignore */
      }
      searchAbort.current = null;
    }

    if (!q) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    // debounce 300ms
    searchDebounce.current = window.setTimeout(async () => {
      const controller = new AbortController();
      searchAbort.current = controller;
      try {
        // Use centralized API_BASE and the same endpoint used elsewhere (/books/search?q=)
        const url = `${API_BASE}/books/search?search=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error("Fetch error");
        const data = (await res.json()) as Book[];
        // limit to 5
        setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
        setIsSuggestionsOpen(Array.isArray(data) && data.length > 0);
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((err as any)?.name === "AbortError") {
          // aborted - ignore
        } else {
          // on error, clear suggestions
          setSuggestions([]);
          setIsSuggestionsOpen(false);
        }
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);

    return () => {
      if (searchDebounce.current) {
        window.clearTimeout(searchDebounce.current);
        searchDebounce.current = null;
      }
      if (searchAbort.current) {
        try {
          searchAbort.current.abort();
        } catch {
          /* ignore */
        }
        searchAbort.current = null;
      }
    };
  }, [searchValue, navigate, token]);

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.error("Đã đăng xuất ☹️");
    navigate("/");
    try {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      /* ignore */
    }
  };

  const handleAuthSuccess = () => {
    setIsLoginModalOpen(false);
  };

  // -------------------- Render --------------------
  return (
    <>
      <HeaderTopBanner />

      {/* Sticky Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #E5E5E5",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          paddingTop: 6,
          paddingBottom: 6,
        }}
      >
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 64,
              gap: 16,
            }}
          >
            {/* Mobile Layout */}
            {!screens.md && (
              <>
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 20 }} />}
                  onClick={() => setOpenDrawer(true)}
                />
                <Link to="/">
                  <img
                    src={logo}
                    alt="logo"
                    style={{ height: 50, width: 100 }}
                  />
                </Link>
                <div style={{ flex: 1 }} />
                <Button
                  type="text"
                  icon={<SearchOutlined style={{ fontSize: 20 }} />}
                  onClick={() => setIsSearchModalOpen(true)}
                />
                <Link to="/cart">
                  <Badge count={cartCount} size="small">
                    <Button
                      type="text"
                      icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                    />
                  </Badge>
                </Link>
              </>
            )}

            {/* Desktop Layout */}
            {screens.md && (
              <>
                {/* Logo */}
                <Link to="/" style={{ flexShrink: 0 }}>
                  <img src={logo} alt="BookStore Logo" style={{ height: 48 }} />
                </Link>

                {/* Category Menu */}
                <HeaderCategoryMenu categories={categories} />

                {/* Search */}
                <div style={{ flex: 1, maxWidth: 600, position: "relative" }}>
                  <Input.Search
                    placeholder="Tìm kiếm sách..."
                    size="large"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={handleSearch}
                    onFocus={() => {
                      if (suggestions.length) setIsSuggestionsOpen(true);
                    }}
                    style={{ borderRadius: 4 }}
                    enterButton={
                      <Button
                        icon={<SearchOutlined />}
                        style={{
                          background: "#f5f5f5",
                          borderColor: "#d9d9d9",
                          color: "#333",
                        }}
                      />
                    }
                  />

                  {/* Suggestions dropdown */}
                  {isSuggestionsOpen && suggestions.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        marginTop: 8,
                        background: "#fff",
                        border: "1px solid #e8e8e8",
                        borderRadius: 6,
                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                        zIndex: 1200,
                        overflow: "hidden",
                      }}
                    >
                      {suggestions.map((b) => (
                        <div
                          key={b.bookId}
                          onMouseDown={(e) => {
                            // use onMouseDown so click navigates before blur
                            e.preventDefault();
                            handleSelectSuggestion(b);
                          }}
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: "8px 12px",
                            alignItems: "center",
                            cursor: "pointer",
                            borderBottom: "1px solid #f5f5f5",
                          }}
                        >
                          <img
                            src={b.coverImage}
                            alt={b.title}
                            style={{
                              width: 48,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 4,
                              background: "#f5f5f5",
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {b.title}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#666",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {b.author}
                            </div>
                          </div>
                          <div style={{ marginLeft: 8, textAlign: "right" }}>
                            <div style={{ color: "#C92127", fontWeight: 700 }}>
                              {(
                                Number(b.price) -
                                (Number(b.price) * Number(b.discountPercent)) /
                                100
                              ).toLocaleString("vi-VN")}
                              ₫
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side actions */}
                <HeaderActions
                  isLoggedIn={isLoggedIn}
                  displayName={displayName}
                  cartCount={cartCount}
                  onLogout={handleLogout}
                  onLoginClick={() => setIsLoginModalOpen(true)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <HeaderSecondaryNav />

      {/* Modals & Drawers (Quản lý bởi component cha) */}
      <HeaderMobileDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        categoryMenuItems={categoryMenuItems}
        isLoggedIn={isLoggedIn}
        displayName={displayName}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      <HeaderSearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
      />

      <AuthModal
        open={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;

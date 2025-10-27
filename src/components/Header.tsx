// src/components/Header.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { fetchBooks } from "../features/books/bookSlice";
import { fetchCart } from "../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

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
import HeaderTopBanner from "./header/HeaderTopBanner";
import HeaderSecondaryNav from "./header/HeaderSecondaryNav";
import HeaderCategoryMenu from "./header/HeaderCategoryMenu";
import HeaderActions from "./header/HeaderActions";
import HeaderMobileDrawer from "./header/HeaderMobileDrawer";
import HeaderSearchModal from "./header/HeaderSearchModal";

const { useBreakpoint } = Grid;

const Header = () => {
  // -------------------- Redux --------------------
  const authUser = useAppSelector((s) => s.auth.user);
  const bookData = useAppSelector((s) => s.books.books);
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  // -------------------- Local states --------------------
  const [searchValue, setSearchValue] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [fallbackFullName, setFallbackFullName] = useState<string>("");

  const screens = useBreakpoint();
  const navigate = useNavigate();

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
    const set = new Set<string>();
    bookData.forEach((b) => b.category && set.add(b.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [bookData]);

  // Menu items cho cả desktop và mobile
  const categoryMenuItems: MenuProps["items"] = useMemo(() => {
    if (!categories.length) {
      return [{ key: "no-cat", disabled: true, label: "Chưa có danh mục." }];
    }
    return categories.map((c) => ({
      key: `/categories/${encodeURIComponent(c)}`,
      label: (
        <Link
          style={{ textDecoration: "none" }}
          to={`/categories/${encodeURIComponent(c)}`}
        >
          {c}
        </Link>
      ),
      icon: <BookOutlined />,
    }));
  }, [categories]);

  // -------------------- Handlers --------------------
  const handleSearch = (value?: string) => {
    const q = (value ?? searchValue).trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchValue("");
    setOpenDrawer(false);
    setIsSearchModalOpen(false);
  };

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
                <div style={{ flex: 1, maxWidth: 600 }}>
                  <Input.Search
                    placeholder="Tìm kiếm sách..."
                    size="large"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={handleSearch}
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

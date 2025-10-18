import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import logo from "../assets/logo1.png";
import type { Book } from "../types/Book";

// Icons
import {
  AppstoreOutlined,
  BellOutlined,
  BookOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";

// Ant Design
import type { MenuProps } from "antd";
import {
  Badge,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Input,
  Menu,
  Modal,
  Space,
  Typography,
} from "antd";

// Local
import { clearAuth } from "../features/auth/authSlice";
import AuthModal from "../login_register/AuthModal";
import { toast } from "react-toastify";

const { useBreakpoint } = Grid;
const { Title } = Typography;

const Header = () => {
  // -------------------- Redux auth --------------------
  const authUser = useAppSelector((s) => s.auth.user);
  
  const dispatch = useAppDispatch();

  // -------------------- Local states --------------------
  const [books, setBooks] = useState<Book[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [hoveredCart, setHoveredCart] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fallback name khi vừa reload (trước khi Redux có user)
  const [fallbackFullName, setFallbackFullName] = useState<string>("");

  const screens = useBreakpoint();
  const navigate = useNavigate();
  

  const isLoggedIn = !!authUser; // dựa hoàn toàn vào Redux
  const displayName =
    authUser?.fullName || authUser?.userName || fallbackFullName || "Tài khoản";

  // -------------------- Effects --------------------
  // 1) Lấy books cho menu danh mục
  useEffect(() => {
    fetch("http://localhost:8080/api/books")
      .then((res) => res.json())
      .then((data: Book[]) => setBooks(data ?? []))
      .catch(() => setBooks([]));
  }, []);

  // 2) Khởi tạo cartCount + lắng nghe 'cart-updated'
  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      try {
        const { getCartItems } = await import("../lib/api");
        const items: any[] = await getCartItems();
        if (!mounted) return;
        setCartCount(Array.isArray(items) ? items.length : 0);
      } catch {
        /* ignore */
      }
    };
    loadCart();

    const handler = async () => {
      try {
        const { getCartItems } = await import("../lib/api");
        const items: any[] = await getCartItems();
        setCartCount(Array.isArray(items) ? items.length : 0);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("cart-updated", handler as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("cart-updated", handler as EventListener);
    };
  }, []);

  // 3) Fallback đọc tên từ localStorage lúc mount (chỉ 1 lần)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_fullName");
      if (stored && !authUser) setFallbackFullName(stored);
    } catch {
      /* ignore */
    }
  }, []); // mount-only

  // 4) Khi Redux user thay đổi, cập nhật fallbackName (đảm bảo hiển thị tức thì)
  useEffect(() => {
    if (authUser?.fullName) {
      setFallbackFullName(authUser.fullName);
    } else if (authUser?.userName) {
      setFallbackFullName(authUser.userName);
    }
  }, [authUser]);

  // 5) Khi user thay đổi (ví dụ vừa đăng nhập), fetch cart items for that user and set cartCount
  useEffect(() => {
    if (!authUser) return;
    let mounted = true;
    (async () => {
      try {
        const { getCartItems } = await import('../lib/api');
        const items: any[] = await getCartItems();
        if (!mounted) return;
        setCartCount(Array.isArray(items) ? items.length : 0);
        // also emit event so any other listeners update
        try { window.dispatchEvent(new CustomEvent('cart-updated')); } catch (e) {}
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [authUser]);

  // -------------------- Derived menus --------------------
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.category && set.add(b.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [books]);

  const categoryMenuItems: MenuProps["items"] = useMemo(() => {
    if (!categories.length) {
      return [{ key: "no-cat", disabled: true, label: "Chưa có danh mục." }];
    }
    return categories.map((c) => ({
      key: `/categories/${encodeURIComponent(c)}`,
      label: (
        <Link style={{ textDecoration: "none" }} to={`/categories/${encodeURIComponent(c)}`}>
          {c}
        </Link>
      ),
      icon: <BookOutlined />,
    }));
  }, [categories]);

  const userMenuItems: MenuProps["items"] = [
    { key: "profile", label: "Trang cá nhân", icon: <SolutionOutlined /> },
    { key: "orders", label: "Đơn hàng của tôi", icon: <ShoppingCartOutlined /> },
    { type: "divider" },
    { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, danger: true },
  ];

  

  // -------------------- Handlers --------------------
  const handleSearch = (value?: string) => {
    const q = (value ?? searchValue).trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchValue("");
    setOpenDrawer(false);
    setIsSearchModalOpen(false);
  };

  
  // Gọi toast ở đây
  const handleLogout = () => {
    dispatch(clearAuth());
    // reset cart count immediately
    try { setCartCount(0); } catch {}
    toast.error("Đã đăng xuất ☹️");
    // reload to clear any cached state and ensure header reflects logged-out state
    try { window.location.reload(); } catch {
      try { navigate('/'); } catch {}
    }
  };

  

  const handleAuthSuccess = () => {
    // AuthModal đã dispatch setAuth({token, user})
    setIsLoginModalOpen(false);
    // KHÔNG reload – Header tự cập nhật qua Redux selector
  };

  // -------------------- Render --------------------
  return (
    <>
      {/* Top Banner */}
      {screens.md && (
        <div style={{ background: "linear-gradient(135deg, #C92127 0%, #E63946 100%)", padding: "8px 0" }}>
          <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
            <div style={{ textAlign: "center", color: "white", fontSize: 14, fontWeight: 500 }}>
              🎉 DOANH NHÂN NUÔI CHÍ - SÁCH HAY ĐƯỜNG TRÍ{" "}
              <span
                style={{
                  background: "white",
                  color: "#C92127",
                  padding: "2px 12px",
                  borderRadius: 20,
                  marginLeft: 8,
                  fontWeight: 700,
                }}
              >
                Giảm đến 50%
              </span>{" "}
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 12px",
                  borderRadius: 20,
                  marginLeft: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                MUA NGAY
              </span>
            </div>
          </div>
        </div>
      )}

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
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>
            {/* Mobile */}
            {!screens.md && (
              <>
                <Button type="text" icon={<MenuOutlined style={{ fontSize: 20 }} />} onClick={() => setOpenDrawer(true)} />
                <Link to="/">
                  <img src={logo} alt="logo" style={{ height: 50, width: 100 }} />
                </Link>
                <div style={{ flex: 1 }} />
                <Button type="text" icon={<SearchOutlined style={{ fontSize: 20 }} />} onClick={() => setIsSearchModalOpen(true)} />
                <Link to="/cart">
                  <Badge count={cartCount} size="small">
                    <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />} />
                  </Badge>
                </Link>
              </>
            )}

            {/* Desktop */}
            {screens.md && (
              <>
                {/* Logo */}
                <Link to="/" style={{ flexShrink: 0 }}>
                  <img src={logo} alt="BookStore Logo" style={{ height: 48 }} />
                </Link>

                {/* Category Menu */}
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => setIsCategoryMenuOpen(true)}
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                >
                  <Button
                    type="text"
                    icon={<AppstoreOutlined style={{ fontSize: 18 }} />}
                    style={{
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#333",
                      border: "1px solid #E5E5E5",
                      borderRadius: 4,
                    }}
                  />
                  {isCategoryMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 4,
                        backgroundColor: "white",
                        borderRadius: 8,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        minWidth: 250,
                        maxHeight: 400,
                        overflowY: "auto",
                        zIndex: 1001,
                      }}
                      onMouseEnter={() => setIsCategoryMenuOpen(true)}
                      onMouseLeave={() => setIsCategoryMenuOpen(false)}
                    >
                      <div style={{ padding: "8px 0" }}>
                        <div
                          style={{
                            padding: "8px 16px",
                            fontWeight: 600,
                            color: "#C92127",
                            borderBottom: "1px solid #f0f0f0",
                            marginBottom: 4,
                            fontSize: 14,
                          }}
                        >
                          Danh mục sản phẩm
                        </div>
                        {categories.length === 0 ? (
                          <div style={{ padding: "12px 16px", color: "#999", fontSize: 14 }}>Chưa có danh mục</div>
                        ) : (
                          categories.map((category) => (
                            <Link
                              key={category}
                              to={`/categories/${encodeURIComponent(category)}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 16px",
                                color: "#333",
                                textDecoration: "none",
                                transition: "all 0.2s",
                                gap: 8,
                                fontSize: 14,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#FFF5F5";
                                e.currentTarget.style.color = "#C92127";
                                e.currentTarget.style.paddingLeft = "20px";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#333";
                                e.currentTarget.style.paddingLeft = "16px";
                              }}
                            >
                              <BookOutlined />
                              <span>{category}</span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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

                {/* Right side */}
                <Space size="middle">
                  {/* Notifications */}
                  <Button
                    type="text"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "auto",
                      padding: "4px 8px",
                      color: "#666",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                  >
                    <BellOutlined style={{ fontSize: 24 }} />
                    <span style={{ fontSize: 11, marginTop: 2 }}>Thông Báo</span>
                  </Button>

                  {/* Cart */}
                  <Link to="/cart">
                    <Button
                      type="text"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "auto",
                        padding: "4px 8px",
                        color: hoveredCart ? "#C92127" : "#666",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={() => setHoveredCart(true)}
                      onMouseLeave={() => setHoveredCart(false)}
                    >
                      <Badge count={cartCount} offset={[-8, 2]}>
                        <ShoppingCartOutlined
                          style={{
                            fontSize: 24,
                            color: hoveredCart ? "#C92127" : "#666", // icon đổi màu cùng button
                            transition: "color 0.3s",
                          }}
                        />
                      </Badge>
                      <span style={{ fontSize: 11, marginTop: 2 }}>Giỏ Hàng</span>
                    </Button>
                  </Link>

                  {/* Account */}
                  {isLoggedIn ? (
                    <Dropdown
                      placement="bottomRight"
                      trigger={["click"]}
                      menu={{ items: userMenuItems, onClick: ({ key }) => {
                        if (key === "logout") return handleLogout();
                        if (key === "profile") return navigate("/profile");
                        if (key === "orders")  return navigate("/orders");
                      }}}
                    >
                      <Button
                        type="text"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "auto",
                          padding: "4px 8px",
                          color: "#666",
                          transition: "color 0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                      >
                        <UserOutlined style={{ fontSize: 24 }} />
                        <span style={{ fontSize: 11, marginTop: 2 }}>{displayName}</span>
                      </Button>
                    </Dropdown>
                  ) : (
                    <Button
                      type="text"
                      onClick={() => setIsLoginModalOpen(true)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "auto",
                        padding: "4px 8px",
                        color: "#666",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                    >
                      <UserOutlined style={{ fontSize: 24 }} />
                      <span style={{ fontSize: 11, marginTop: 2 }}>Tài khoản</span>
                    </Button>
                  )}

                  {/* Language */}
                  <Button
                    type="text"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px",
                      color: "#666",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                      alt="VN"
                      style={{ width: 20, height: 14, borderRadius: 2 }}
                    />
                    <GlobalOutlined style={{ fontSize: 14 }} />
                  </Button>
                </Space>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secondary nav bar (desktop) */}
      {screens.md && (
        <div style={{ background: "#F5F5F5" }}>
          <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 40,
                padding: "12px 0",
                background: "#CF262D",
              }}
            >
              <Link
                to="/"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.3s",
                }}
              >
                Trang chủ
              </Link>
              <Link
                to="/about"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Giới thiệu
              </Link>
              <a
                href="#"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  position: "relative",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Membership
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -35,
                    background: "#FF3B5C",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    border: "1px solid white",
                  }}
                >
                  HOT
                </span>
              </a>
              <a
                href="#"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Review sách
              </a>
              <Link
                to="/contact"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Drawer (mobile) */}
      <Drawer
        title={<Title level={4} style={{ margin: 0 }}>Menu</Title>}
        placement="left"
        width={300}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Menu mode="inline" items={categoryMenuItems} style={{ border: "none" }} />
          {isLoggedIn ? (
            <Button
              block
              icon={<UserOutlined />}
              onClick={() => {
                setOpenDrawer(false);
                navigate("/profile");
              }}
            >
              {displayName}
            </Button>
          ) : (
            <Button
              block
              type="primary"
              icon={<UserOutlined />}
              onClick={() => {
                setOpenDrawer(false);
                setIsLoginModalOpen(true);
              }}
              style={{ background: "#C92127", borderColor: "#C92127" }}
            >
              Đăng nhập
            </Button>
          )}
        </Space>
      </Drawer>

      {/* Search Modal */}
      <Modal
        title="Tìm kiếm sản phẩm"
        open={isSearchModalOpen}
        onCancel={() => setIsSearchModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Input.Search
          placeholder="Nhập tên sách bạn muốn tìm..."
          allowClear
          enterButton="Tìm"
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          autoFocus
        />
      </Modal>

      {/* Auth Modal */}
      <AuthModal open={isLoginModalOpen} onCancel={() => setIsLoginModalOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default Header;

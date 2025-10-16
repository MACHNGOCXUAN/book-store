  import { useEffect, useMemo, useState } from "react";
  import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
  import type { Book } from "../types/Book";
  import logo from "../assets/logo.png";

  // --- Ant Design Icons ---
  import {
    AppstoreOutlined,
    BookOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    MenuOutlined,
    SearchOutlined,
    DownOutlined,
    LogoutOutlined,
    SolutionOutlined,
  } from "@ant-design/icons";

  // --- Ant Design Components ---
  import {
    Layout,
    Menu,
    Input,
    Badge,
    Avatar,
    Button,
    Dropdown,
    Drawer,
    Grid,
    Space,
    Typography,
    theme,
    Affix,
    Modal,
  } from "antd";
  import type { MenuProps } from "antd";
  import AuthModal from "../auth/AuthModal";

  const { Header: AntHeader } = Layout;
  const { useBreakpoint } = Grid;
  const { Title } = Typography;

  // --- Constants ---
  const NAV_ITEMS = [
    { key: "/", label: "Trang chủ" },
    { key: "/about", label: "Giới thiệu" },
    { key: "/membership", label: "Membership", tag: "HOT" },
    { key: "/review", label: "Review sách" },
    { key: "/contact", label: "Liên hệ" },
  ];

  const MAX_WIDTH_CONTAINER = 1200;
  const MODERN_NAV_COLOR = '#2C3E50'; 
  const MODERN_NAV_TEXT_COLOR = '#FFFFFF';

  const Header = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [openDrawer, setOpenDrawer] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // TODO: Thay thế bằng state từ Redux/Context API
    const [cartCount] = useState<number>(5);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [userFullName, setUserFullName] = useState<string>("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const screens = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();

    useEffect(() => {
      fetch("http://localhost:8080/api/books")
        .then((res) => res.json())
        .then((data: Book[]) => setBooks(data))
        .catch(() => setBooks([]));
    }, []);

    // load user full name from localStorage or fetch profile
    useEffect(() => {
      try {
        const stored = localStorage.getItem("user_fullName");
        if (stored) {
          setUserFullName(stored);
          setIsLoggedIn(true);
          return;
        }
      } catch (e) {}

      const token = (() => {
        try { return localStorage.getItem("access_token"); } catch { return null; }
      })();

      if (token) {
        fetch("http://localhost:8080/api/admin/me", { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.ok ? r.json() : Promise.resolve(null))
          .then((user) => {
            if (user) {
              const name = user.fullName || user.userName || "";
              setUserFullName(name);
              try { if (name) localStorage.setItem("user_fullName", name); } catch (e) {}
              setIsLoggedIn(true);
            } else {
              setIsLoggedIn(false);
            }
          })
          .catch(() => setIsLoggedIn(false));
      } else {
        setIsLoggedIn(false);
      }
    }, []);

    const categories = useMemo(() => {
      const categorySet = new Set<string>();
      books.forEach((book) => book.category && categorySet.add(book.category));
      return Array.from(categorySet).sort((a, b) => a.localeCompare(b, "vi"));
    }, [books]);

    const categoryMenuItems: MenuProps['items'] = useMemo(() => {
      if (!categories.length) {
        return [{ key: "no-cat", disabled: true, label: "Chưa có danh mục." }];
      }
      return categories.map((c) => ({
        key: `/categories/${encodeURIComponent(c)}`,
        label: <Link style={{textDecoration: 'none'}} to={`/categories/${encodeURIComponent(c)}`}>{c}</Link>,
        icon: <BookOutlined />,
      }));
    }, [categories]);

    const selectedTopKey = useMemo(() => {
      const currentPath = location.pathname;
      const match = NAV_ITEMS.find((it) =>
        it.key === "/" ? currentPath === "/" : currentPath.startsWith(it.key)
      );
      return match ? [match.key] : [];
    }, [location.pathname]);

    const handleSearch = (value?: string) => {
      const query = (value ?? searchValue).trim();
      if (!query) return;
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchValue("");
      setOpenDrawer(false);
      setIsSearchModalOpen(false);
    };

    const handleLogout = () => {
      try { localStorage.removeItem('access_token'); localStorage.removeItem('user_fullName'); } catch (e) {}
      setUserFullName("");
      setIsLoggedIn(false);
      // reload the whole page to reset app state
      try { window.location.reload(); } catch (e) { navigate('/'); }
    };

    const userMenuItems: MenuProps['items'] = [
      { key: 'profile', label: 'Trang cá nhân', icon: <SolutionOutlined /> },
      { key: 'orders', label: 'Đơn hàng của tôi', icon: <ShoppingCartOutlined /> },
      { type: 'divider' },
      { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ];

    // UPDATED: Áp dụng border-radius chung cho các nút và input
    const BORDER_RADIUS = 8;
    const buttonStyle: React.CSSProperties = { borderRadius: BORDER_RADIUS, border: '1px solid #D3D3D3' };
    const searchStyle: React.CSSProperties = { borderRadius: BORDER_RADIUS, overflow: 'hidden' };

    const headerStyle: React.CSSProperties = {
      padding: 0,
      background: token.colorBgContainer,
      height: 'auto',
      lineHeight: 'initial',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    };

  // Hàm được gọi khi đăng nhập/đăng ký thành công
  const handleAuthSuccess = () => {
    setIsLoginModalOpen(false); // Đóng modal
    // Tải lại trang để cập nhật trạng thái đăng nhập (ví dụ: hiển thị tên người dùng)
    window.location.reload(); 
  };

    return (
      <Affix offsetTop={0} style={{ zIndex: 1000, display: 'block', justifyContent: 'center'}}>
        <AntHeader style={headerStyle}>
          {/* ================= TẦNG TRÊN CỦA HEADER ================= */}
          <div style={{ padding: '12px 24px' }}>
            <div className="mx-auto" style={{ maxWidth: MAX_WIDTH_CONTAINER, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {!screens.lg && ( // --- Mobile View ---
                <>
                  <Link to="/" title="Trang chủ">
                    <img src={logo} alt="logo" style={{ height: 38 }} />
                  </Link>
                  <Space size="middle">
                    <Button shape="circle" icon={<SearchOutlined />} onClick={() => setIsSearchModalOpen(true)} aria-label="Tìm kiếm"/>
                    <Link to="/cart">
                      <Badge count={cartCount} size="small">
                        <Button shape="circle" icon={<ShoppingCartOutlined />} />
                      </Badge>
                    </Link>
                    <Button icon={<MenuOutlined />} onClick={() => setOpenDrawer(true)} aria-label="Mở menu" />
                  </Space>
                </>
              )}
              {screens.lg && ( // --- Desktop View ---
                <Space align="center" style={{ width: '100%', display: "flex", justifyContent: "center", alignItems:"center" }} size={32}>
                  <Link to="/" title="Trang chủ" style={{ flexShrink: 0 }}>
                    <img src={logo} alt="logo" style={{ height: 70, width: 70 }} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 200, width: 600 }}>
                    <Input.Search
                      placeholder="Tìm kiếm sản phẩm bạn mong muốn..."
                      allowClear
                      enterButton="Tìm kiếm"
                      size="large"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onSearch={handleSearch}
                      style={searchStyle}
                    />
                  </div>
                  <Space size="large" style={{ flexShrink: 0 }}>
                    <Link to="/cart">
                      <Badge count={cartCount}>
                        <Button icon={<ShoppingCartOutlined />} style={buttonStyle}>Giỏ hàng</Button>
                      </Badge>
                    </Link>
                    {isLoggedIn ? (
                      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']} >
                        <Button type="text" icon={<UserOutlined />} style={{ padding: '4px 8px', ...buttonStyle}}>
                          <Space>
                            {userFullName || 'Tài khoản'}
                          </Space>
                        </Button>
                      </Dropdown>
                    ) : (
                      <>
                        <>
                          <>
                            <Button 
                              icon={<UserOutlined />} 
                              onClick={() => setIsLoginModalOpen(true)}
                            >
                              Đăng nhập
                            </Button>

                            <AuthModal 
                              open={isLoginModalOpen}
                              onCancel={() => setIsLoginModalOpen(false)}
                              onSuccess={handleAuthSuccess}
                            />
                          </>
                        </>
                      </>
                    )}
                  </Space>
                </Space>
              )}
            </div>
          </div>

          {/* ================= TẦNG DƯỚI - THANH ĐIỀU HƯỚNG CHÍNH (DESKTOP) ================= */}
          {screens.lg && (
            <div style={{ background: MODERN_NAV_COLOR, padding: '0 24px' , paddingBottom: 5, paddingTop: 5}}>
              <div className="mx-auto" style={{ maxWidth: MAX_WIDTH_CONTAINER, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Dropdown menu={{ items: categoryMenuItems }} trigger={["click"]}>
                  <Button type="text" size="large" icon={<AppstoreOutlined />} style={{ color: MODERN_NAV_TEXT_COLOR }}>
                    Danh mục
                  </Button>
                </Dropdown>
                <Menu
                  mode="horizontal"
                  selectedKeys={selectedTopKey}
                  items={NAV_ITEMS.map((it) => ({
                    key: it.key,
                    label: (
                      <NavLink to={it.key} style={{ color: MODERN_NAV_TEXT_COLOR, textDecoration: 'none' }}>
                        {it.label}
                        {it.tag && <Badge count={it.tag} style={{ backgroundColor: '#f5222d', marginLeft: 8 }} />}
                      </NavLink>
                    ),
                  }))}
                  style={{
                    flex: 1,
                    borderBottom: "none",
                    background: 'transparent',
                    lineHeight: '46px',
                    // NEW: Canh giữa các mục menu
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                />
                {/* NEW: Thêm một div trống để giữ cho menu ở giữa hoàn hảo bằng cách cân bằng với nút Danh mục */}
                <div style={{ width: 120, textAlign: 'right' }}>
                  {/* Có thể thêm icon hoặc text ở đây nếu muốn, ví dụ: Hotline */}
                </div>
              </div>
            </div>
          )}
        </AntHeader>

        {/* --- DRAWER & MODAL FOR MOBILE --- */}
        {!screens.lg && (
          <>
              <Drawer title={<Title level={4}>Menu</Title>} placement="right" width={300} open={openDrawer} onClose={() => setOpenDrawer(false)}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Menu mode="inline" selectedKeys={selectedTopKey} onClick={() => setOpenDrawer(false)} items={NAV_ITEMS.map(it => ({
                          key: it.key,
                          label: it.label,
                          icon: it.key === '/' ? <HomeOutlined /> : it.key === '/about' ? <InfoCircleOutlined /> : <PhoneOutlined/>,
                      }))}/>
                      <Menu mode="inline" onClick={() => setOpenDrawer(false)} items={[{
                          key: 'categories',
                          label: 'Danh mục sản phẩm',
                          icon: <AppstoreOutlined />,
                          children: categoryMenuItems,
                      }]}/>
                      <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 16 }}>
                        {isLoggedIn ? (
                          <Dropdown menu={{ items: userMenuItems }} placement="bottom" trigger={['click']}>
                            <Button block icon={<UserOutlined />} style={buttonStyle}>Tài khoản của tôi</Button>
                          </Dropdown>
                        ) : (
                          <><Button
                          style={buttonStyle}
                            icon={<UserOutlined />}
                            onClick={() => setIsLoginModalOpen(true)}
                          >Đăng nhập</Button>
                          <AuthModal
                              open={isLoginModalOpen}
                              onCancel={() => setIsLoginModalOpen(false)}
                              onSuccess={handleAuthSuccess} /></>
                        )}
                      </div>
                  </Space>
              </Drawer>
              
              <Modal title="Tìm kiếm sản phẩm" open={isSearchModalOpen} onCancel={() => setIsSearchModalOpen(false)} footer={null} destroyOnClose>
                  <Input.Search
                      placeholder="Nhập tên sách bạn muốn tìm..."
                      allowClear
                      enterButton="Tìm"
                      size="large"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onSearch={handleSearch}
                      autoFocus
                      style={searchStyle}
                  />
              </Modal>
          </>
        )}
      </Affix>
    );
  };

  export default Header;
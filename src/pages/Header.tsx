import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import type { Book } from "../types/Book";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catOpenMobile, setCatOpenMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsFixed(window.pageYOffset > 190);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/books")
      .then((r) => r.json())
      .then((data: Book[]) => setBooks(data))
      .catch(() => setBooks([]));
  }, []);

  const categories: string[] = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.category && set.add(b.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [books]);

  const items = [
    { to: "/", label: "Trang chủ" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/contact", label: "Liên hệ" },
  ];

  const goCategory = (cat: string) => {
    navigate(`/categories/${encodeURIComponent(cat)}`);
    setOpen(false);
    setCatOpen(false);
    setCatOpenMobile(false);
  };

  return (
    <header className="" style={{ backgroundColor: "#FFF8E1", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-around gap-3 p-3">
        <button
          style={{ borderRadius: "5px" }}
          className="md:hidden inline-flex items-center justify-center h-12 w-12 p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
          aria-label="Mở menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="shrink-0">
          <img src={logo} alt="logo" className="w-24 md:w-20" />
        </Link>

        <div className="hidden sm:flex justify-between items-center border-b-2 border-black h-11 flex-1 max-w-md w-full">
          <input type="text" placeholder="Tìm kiếm..." className="p-2 focus:outline-none w-full" />
          <button className="ml-2 hover:bg-amber-600 p-2 rounded-md transition-colors">
            <Search />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            style={{ borderRadius: "5px" , color: 'black', textDecoration: 'none'}}
            className="hidden sm:flex items-center gap-2 p-2 border border-gray-400 rounded-full text-sm text-gray-700 hover:bg-amber-100 transition"
          >
            <User className="h-6 w-4" />
            Đăng nhập
          </Link>
          <Link
            to="/cart"
            style={{ borderRadius: "5px" , color: 'black', textDecoration: 'none'}}
            className="inline-flex items-center justify-center p-2 gap-2 sm:h-auto sm:w-auto sm:px-4 sm:py-2 border border-gray-400 rounded-full text-sm text-gray-700 hover:bg-amber-100 transition"
          >
            <ShoppingCart className="h-6 w-4" />
            <span className="hidden sm:inline">Giỏ hàng</span>
          </Link>
        </div>
      </div>

      {/* Nav desktop */}
      <div
        style={{ boxShadow: "0 5px 5px rgba(0,0,0,0.1)" , padding:"12px"}}
        className={`bg-amber-600 text-white hidden md:block ${
          isFixed ? "fixed top-0 left-0 right-0 z-[100]" : ""
        }`}
      >
        <nav className="mx-auto max-w-5xl">
          <ul className="flex items-center justify-around gap-2 m-0">
            {items.map((it) => (
              <li key={it.to}>
                <NavLink
                  style={{ textDecoration: "none", color: "black", fontWeight: "500", fontSize: "17px" }}
                  to={it.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap transition-colors px-2 py-1 ${
                      isActive
                        ? "text-amber-200 border-b-2 border-white pb-0.5"
                        : "text-white hover:text-amber-100 hover:border-b-2 hover:border-white hover:pb-0.5"
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              </li>
            ))}

            {/* Danh mục */}
            <li className="relative z-[9999]">
              <button
                  type="button"
                  onClick={() => setCatOpen((v) => !v)}
                  className="flex items-center gap-1 whitespace-nowrap px-2 py-1 transition-colors text-white hover:text-amber-100"
                  aria-haspopup="menu"
                  aria-expanded={catOpen}
                >
                  <span style={{ color: "white", fontWeight: 500, fontSize: "17px" }}>Danh mục</span>
                  {catOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {catOpen && categories.length > 0 && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-2 w-60 rounded-xl bg-white text-gray-800 shadow-lg border border-gray-200 overflow-hidden z-[9999] pointer-events-auto"
                  >
                    <ul className="max-h-[60vh] overflow-auto">
                      {categories.map((cat) => (
                        <li key={cat}>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-amber-50"
                            onClick={() => goCategory(cat)}
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {catOpen && categories.length === 0 && (
                  <div className="absolute left-0 mt-2 w-60 rounded-xl bg-white text-gray-800 shadow-lg border border-gray-200 p-3 z-[9999]">
                    <span className="text-sm text-gray-500">Chưa có danh mục.</span>
                  </div>
                )}
              </li> 

          </ul>
        </nav>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden bg-amber-600 border-t border-gray-200 shadow-sm z-[100] relative">
          <nav className="mx-auto max-w-5xl">
            <ul className="flex flex-col p-2">
              <li>
                <button
                  onClick={() => setCatOpenMobile((v) => !v)}
                  className="flex items-center justify-between w-full text-left px-2 py-2 text-white"
                >
                  <span style={{ color: "black", fontWeight: 500, fontSize: "17px" }}>Danh mục</span>
                  {catOpenMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {catOpenMobile && (
                  <ul className="pl-4 pb-2">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <li key={cat}>
                          <button
                            className="w-full text-left px-2 py-1 text-white/90 hover:text-white"
                            onClick={() => goCategory(cat)}
                          >
                            • {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-2 py-1 text-white/80">Chưa có danh mục.</li>
                    )}
                  </ul>
                )}
              </li>

              {items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    style={{ textDecoration: "none", color: "black", fontWeight: "500", fontSize: "17px" }}
                    to={it.to}
                    className={({ isActive }) =>
                      `whitespace-nowrap transition-colors px-2 py-2 ${
                        isActive
                          ? "text-amber-200 border-b-2 border-white pb-0.5"
                          : "text-white hover:text-amber-100 hover:border-b-2 hover:border-white hover:pb-0.5"
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

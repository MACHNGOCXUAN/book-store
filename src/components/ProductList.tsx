import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import type { Book } from "../types/Book";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const ProductList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;
  const [isJumping, setIsJumping] = useState(false);
  const [jumpValue, setJumpValue] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/books");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Book[] = await res.json();
        setBooks(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const totalPages = Math.ceil(books.length / booksPerPage) || 1;
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setIsJumping(false);
    setJumpValue("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJumpSubmit = () => {
    const n = Number(jumpValue);
    if (!Number.isInteger(n) || n < 1 || n > totalPages) return;
    goToPage(n);
  };

  const handleJumpKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleJumpSubmit();
    if (e.key === "Escape") {
      setIsJumping(false);
      setJumpValue("");
    }
  };

  // ✅ Cửa sổ trượt trang hiển thị
  const getVisiblePages = () => {
    const visibleCount = 3;
    let start = Math.max(1, currentPage - 1);
    let end = start + visibleCount - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - visibleCount + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  const PageBtn: React.FC<{
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
  }> = ({ active, disabled, onClick, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-[#FFF8E1]  text-amber-500 border-[#FFC107] hover:bg-amber-100"
            : "border-gray-600 text-gray-800 hover:bg-gray-100"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );

  if (loading) return <p className="text-center mt-10">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Lỗi: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Grid hiển thị sách */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
        {currentBooks.map((book) => (
          <ProductCard key={book.bookId} book={book} />
        ))}
      </div>

      {/* Pagination động + input */}
      <div style={{height:"100px"}} className="border-t border-gray-200 mb-10 flex justify-center items-center gap-2">
        {/* Nút về đầu */}
        <PageBtn onClick={() => goToPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-5 w-5" />
        </PageBtn>

        {/* Nút prev */}
        <PageBtn onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="h-5 w-5" />
        </PageBtn>

        {/* Các trang hiển thị */}
        {visiblePages.map((page) => (
          <PageBtn
            key={page}
            active={currentPage === page}
            onClick={() => goToPage(page)}
          >
            {page}
          </PageBtn>
        ))}

        {/* Dấu ... + input */}
        {showEllipsis && (
          <>
            {isJumping ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  onKeyDown={handleJumpKeyDown}
                  placeholder="Trang"
                  className="w-16 h-10 text-center text-sm rounded-full border-2 border-gray-600 outline-none focus:border-pink-600"
                />
                <button
                  onClick={handleJumpSubmit}
                  className="px-3 h-10 rounded-full text-sm font-medium border-2 border-gray-600 hover:bg-gray-100"
                >
                  Go
                </button>
              </div>
            ) : (
              <PageBtn onClick={() => setIsJumping(true)}>...</PageBtn>
            )}
          </>
        )}

        {/* Nút next */}
        <PageBtn
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-5 w-5" />
        </PageBtn>

        {/* Nút tới cuối */}
        <PageBtn
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-5 w-5" />
        </PageBtn>
      </div>
    </div>
  );
};

export default ProductList;

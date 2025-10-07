import React from "react";
import type { Book } from "../types/Book";
import { Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ book, onAddToCart }) => {
  return (
    <div
      className="
        group relative overflow-hidden 
        bg-white rounded-2xl border border-gray-200 
        shadow-sm hover:shadow-lg transition-all duration-300
      "
    >
      {/* Ảnh lớn hơn */}
      <div className="relative w-full h-72 overflow-hidden rounded-t-xl">
        <Image
          src={`http://localhost:8080${book.coverImage}`}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Thanh action trượt lên khi hover */}
        <div
          className="
            absolute inset-x-0 bottom-0
            translate-y-full group-hover:translate-y-0
            transition-transform duration-300
            bg-gradient-to-t from-black/60 to-black/0
            p-3 flex justify-center
          "
        >
          <button
            onClick={() => onAddToCart?.(book)}
            className="
              flex items-center justify-around text-white
              text-sm font-medium px-4 py-2
              rounded-full shadow-md transition-colors
            "
          >
            <ShoppingCart className="inline-block h-6 w-6 mr-2" />
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Thông tin sách nhỏ gọn hơn */}
      <div className="p-3 text-center space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>

        <div className="pt-1">
          <span className="inline-block rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-[13px] font-bold">
            {Number(book.price).toLocaleString("vi-VN")} ₫
          </span>
        </div>

        {/* Nút Xem chi tiết luôn hiển thị */}
        <div className="pt-2">
          <Link
            to={`/books/${book.bookId}`}
            className="
              inline-flex items-center gap-2
              rounded-full border border-gray-300
              px-4 py-2 text-[13px] font-medium
              text-gray-700 hover:bg-gray-100 transition-colors
            "
          >
            <Eye className="h-4 w-4" />
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

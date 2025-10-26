import { useState, useEffect } from "react";
import {
  Radio,
  Button,
  Collapse,
  InputNumber,
  Space,
  Select,
  Row,
  Col,
  Tooltip,
} from "antd";
import { SortAscendingOutlined, ReloadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import type { Book as BookType } from "../types/Book";
import ProductCard from "../components/ProductCard";
import { API_BASE } from "../config/api"; // Updated import path

// --- Dummy Interfaces for Missing Imports ---
interface FilterOption {
  id: string;
  label: string;
  count: number;
}
interface PriceRange {
  id: string;
  label: string;
}
// --- END Dummy Interfaces ---

export default function FilterCategory() {
  const { type } = useParams<{ type: string }>();

  // --- State chính ---
  const [books, setBooks] = useState<BookType[]>([]); // Khởi tạo là mảng rỗng
  const [authors, setAuthors] = useState<{ label: string; value: string }[]>(
    []
  );
  const [publishers, setPublishers] = useState<
    { label: string; value: string }[]
  >([]);

  // States lọc
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [customPriceFrom, setCustomPriceFrom] = useState<number | null>(null);
  const [customPriceTo, setCustomPriceTo] = useState<number | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(
    null
  );
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);

  // States phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // MÀU CHỦ ĐẠO
  const PRIMARY_COLOR = "rgb(217, 47, 56)";

  // --- Lấy dữ liệu & Sinh Authors/Publishers ---
  useEffect(() => {
    async function doFecth() {
      try {
        const response = await fetch(`${API_BASE}/books/categories/${type}`);
        // Kiểm tra lỗi HTTP (ví dụ: 404)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        let bookList: BookType[] = [];
        if (Array.isArray(data)) {
          bookList = data;
        } else if (data && Array.isArray(data.books)) {
          bookList = data.books;
        }
        console.log(bookList);
        setBooks(bookList);

        const authorSet = Array.from(new Set(bookList.map((b) => b.author)));
        const publisherSet = Array.from(
          new Set(bookList.map((b) => b.publisher))
        );
        setAuthors(authorSet.map((a) => ({ label: a, value: a })));
        setPublishers(publisherSet.map((p) => ({ label: p, value: p })));
      } catch (error) {
        console.error("Error fetching data:", error);
        setBooks([]); // Quan trọng: Đặt về mảng rỗng nếu có lỗi
      }
    }

    doFecth();
  }, [type]);

  const handlePriceRangeChange = (e: any) => {
    setSelectedPrice(e.target.value);
    setCustomPriceFrom(null);
    setCustomPriceTo(null);
  };

  const handleCustomPriceChange = (value: number | null, isFrom: boolean) => {
    console.log(value);
    setSelectedPrice(null);
    if (isFrom) {
      setCustomPriceFrom(value);
    } else {
      setCustomPriceTo(value);
    }
  };

  const toggleCategory = (id: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCategories(newSelected);
  };

  const resetAllFilters = () => {
    setSelectedCategories(new Set());
    setSelectedPrice(null);
    setCustomPriceFrom(null);
    setCustomPriceTo(null);
    setSelectedAuthor(null);
    setSelectedPublisher(null);
    setSelectedDiscount(null);
    setSortBy(null);
    setCurrentPage(1);
  };

  // --- ÁP DỤNG BỘ LỌC VÀ SẮP XẾP ---
  const filteredBooks = books // <-- FIX: books được đảm bảo là mảng rỗng nếu fetch lỗi
    .filter(
      (b) => selectedCategories.size === 0 || selectedCategories.has(b.category)
    )
    .filter((b) => !selectedAuthor || b.author === selectedAuthor)
    .filter((b) => !selectedPublisher || b.publisher === selectedPublisher)
    .filter((b) => {
      const price = b.price;
      // Nếu chọn mức giá có sẵn (radio)
      if (selectedPrice) {
        switch (selectedPrice) {
          case "under-150k":
            return price < 150000;
          case "150k-300k":
            return price >= 150000 && price < 300000;
          case "300k-500k":
            return price >= 300000 && price < 500000;
          case "500k-700k":
            return price >= 500000 && price < 700000;
          case "over-700k":
            return price >= 700000;
          default:
            return true;
        }
      }

      // --- Lọc theo giá nhập tay (InputNumber) ---
      // --- Lọc theo giá nhập tay (InputNumber) ---
      const from = (customPriceFrom ?? 0) * 1000;
      const to = (customPriceTo ?? Infinity) * 1000;

      // Nếu cả hai đều trống → không lọc
      if (from == null && to == null) return true;

      // Nếu chỉ nhập giá từ
      if (from != null && to == null) return price >= from;

      // Nếu chỉ nhập giá đến
      if (from == null && to != null) return price <= to;

      // Nếu nhập cả hai
      if (from != null && to != null) return price >= from && price <= to;

      return true;
    })

    .filter((b) => {
      if (!selectedDiscount) return true;
      switch (selectedDiscount) {
        case "0-5":
          return b.discountPercent >= 0 && b.discountPercent <= 5;
        case "5-10":
          return b.discountPercent >= 5 && b.discountPercent <= 10;
        case "10-20":
          return b.discountPercent >= 10 && b.discountPercent <= 20;
        case "20-30":
          return b.discountPercent >= 20 && b.discountPercent <= 30;
        case "over-30":
          return b.discountPercent > 30;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return b.publishDate.localeCompare(a.publishDate);
        default:
          return 0;
      }
    });

  const priceRanges: PriceRange[] = [
    { id: "under-150k", label: "0đ - 150.000đ" },
    { id: "150k-300k", label: "150.000đ - 300.000đ" },
    { id: "300k-500k", label: "300.000đ - 500.000đ" },
    { id: "500k-700k", label: "500.000đ - 700.000đ" },
    { id: "over-700k", label: "700.000đ Trở Lên" },
  ];

  const discountLevels = [
    { id: "0-5", label: "0% - 5%" },
    { id: "5-10", label: "5% - 10%" },
    { id: "10-20", label: "10% - 20%" },
    { id: "20-30", label: "20% - 30%" },
    { id: "over-30", label: "Trên 30%" },
  ];

  const sortOptions = [
    { label: "Giá: Thấp đến Cao", value: "price-asc" },
    { label: "Giá: Cao đến Thấp", value: "price-desc" },
    { label: "Mới Nhất", value: "newest" },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredBooks.length / pageSize);

  const priceContent = (
    <div className="space-y-3">
      <Radio.Group value={selectedPrice} onChange={handlePriceRangeChange}>
        <Space direction="vertical" className="w-full">
          {priceRanges.map((range) => (
            <Radio key={range.id} value={range.id}>
              <span className="text-sm">{range.label}</span>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );

  const customPriceContent = (
    <div className="space-y-3 pt-3 border-t border-gray-200">
      <p className="text-xs text-gray-600 font-medium flex justify-between items-center">
        Hoặc chọn mức giá phù hợp (nghìn đồng)
        {(customPriceFrom !== null || customPriceTo !== null) && (
          <Tooltip title="Xóa mức giá tùy chỉnh">
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => {
                setCustomPriceFrom(null);
                setCustomPriceTo(null);
              }}
            />
          </Tooltip>
        )}
      </p>
      <div className="flex gap-2">
        <InputNumber
          placeholder="Từ"
          value={customPriceFrom}
          onChange={(value) => handleCustomPriceChange(value, true)}
          className="flex-1"
          min={0}
        />
        <span className="text-gray-400 px-2">-</span>
        <InputNumber
          placeholder="Đến"
          value={customPriceTo}
          onChange={(value) => handleCustomPriceChange(value, false)}
          className="flex-1"
          min={0}
        />
      </div>
    </div>
  );

  const authorContent = (
    <div className="space-y-3">
      <Select
        placeholder="Chọn tác giả"
        value={selectedAuthor}
        onChange={setSelectedAuthor}
        allowClear
        showSearch
        options={authors}
        className="w-full"
      />
    </div>
  );

  const publisherContent = (
    <div className="space-y-3">
      <Select
        placeholder="Chọn nhà xuất bản"
        value={selectedPublisher}
        onChange={setSelectedPublisher}
        allowClear
        showSearch
        options={publishers}
        className="w-full"
      />
    </div>
  );

  const discountContent = (
    <div className="space-y-3">
      <Radio.Group
        value={selectedDiscount}
        onChange={(e) => setSelectedDiscount(e.target.value)}
      >
        <Space direction="vertical" className="w-full">
          {discountLevels.map((level) => (
            <Radio key={level.id} value={level.id}>
              <span className="text-sm">{level.label}</span>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );

  const items = [
    {
      key: "1",
      label: <span className="font-bold text-sm">GIÁ</span>,
      children: (
        <>
          {priceContent}
          {customPriceContent}
        </>
      ),
    },
    {
      key: "2",
      label: <span className="font-bold text-sm">TÁC GIẢ</span>,
      children: authorContent,
    },
    {
      key: "3",
      label: <span className="font-bold text-sm">NHÀ XUẤT BẢN</span>,
      children: publisherContent,
    },
    {
      key: "4",
      label: <span className="font-bold text-sm">MỨC GIẢM GIÁ</span>,
      children: discountContent,
    },
  ];

  return (
    <div
      className="w-full max-w-7xl rounded-lg shadow-sm border border-gray-200 overflow-hidden container"
      style={{
        maxWidth: 1200,
        margin: "20px auto",
        padding: 16,
        paddingTop: 20,
      }}
    >
      <Row gutter={16}>
        <Col span={6}>
          {/* HEADER VÀ NÚT RESET */}
          <div
            className="flex justify-between items-center p-2"
            style={{ borderBottom: `2px solid ${PRIMARY_COLOR}` }}
          >
            <p
              className="font-bold"
              style={{
                color: PRIMARY_COLOR,
                fontSize: 20,
                margin: 0,
              }}
            >
              LỌC THEO
            </p>
            <Tooltip title="Đặt lại tất cả bộ lọc">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={resetAllFilters}
                style={{
                  color: "white",
                  fontWeight: "bold",
                  backgroundColor: "rgb(208, 39, 47)",
                }}
              >
                Đặt lại
              </Button>
            </Tooltip>
          </div>

          <div className="p-4">
            <Collapse
              items={items}
              defaultActiveKey={["1", "2"]}
              style={{ borderColor: PRIMARY_COLOR }}
            />

            <div className="mt-4 mb-4">
              <Select
                placeholder="Sắp xếp theo"
                value={sortBy}
                onChange={setSortBy}
                allowClear
                options={sortOptions}
                className="w-full"
                suffixIcon={<SortAscendingOutlined />}
              />
            </div>

            <Button
              type="primary"
              block
              size="large"
              style={{
                backgroundColor: PRIMARY_COLOR,
                border: `1px solid ${PRIMARY_COLOR}`,
                color: "white",
              }}
            >
              Áp Dụng
            </Button>
          </div>
        </Col>

        <Col span={18}>
          <div
            className="mb-4"
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
              borderBottom: "2px solid #eee",
              paddingBottom: "8px",
              marginBottom: "16px",
            }}
          >
            Tìm thấy
            <span
              style={{
                color: PRIMARY_COLOR,
                margin: "0 4px",
                fontSize: "18px",
              }}
            >
              {filteredBooks.length}
            </span>
            sản phẩm phù hợp.
          </div>

          <Row gutter={[16, 16]}>
            {paginatedBooks.map((book) => (
              <Col key={book.bookId} span={8}>
                <ProductCard book={book} />
              </Col>
            ))}
          </Row>

          {/* Phân trang */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                type={currentPage === i + 1 ? "primary" : "default"}
                style={{
                  margin: "0 4px",
                  backgroundColor:
                    currentPage === i + 1 ? PRIMARY_COLOR : undefined,
                  borderColor:
                    currentPage === i + 1 ? PRIMARY_COLOR : undefined,
                  color: currentPage === i + 1 ? "white" : "black",
                  fontWeight: "bold",
                }}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Checkbox,
  Radio,
  Button,
  Collapse,
  InputNumber,
  Space,
  Select,
  Row,
  Col,
  // Thêm Icon để reset
  Tooltip,
} from "antd";
import { SortAscendingOutlined, ReloadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import type { Book as BookType } from "../types/Book";
import ProductCard from "../components/ProductCard";
import { API_BASE } from "../lib/api.ts";

// ... (Interface giữ nguyên) ...

export default function FilterCategory() {
  const { type } = useParams<{ type: string }>();

  // --- State chính ---
  const [books, setBooks] = useState<BookType[]>([]);
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

  // --- Lấy dữ liệu + sinh authors, publishers (Giữ nguyên) ---
  useEffect(() => {
    async function doFecth() {
      const response = await fetch(`${API_BASE}/api/books/categories/${type}`);
      const data = await response.json();
      setBooks(data);
      const authorSet = Array.from(new Set(data.map((b) => b.author)));
      const publisherSet = Array.from(new Set(data.map((b) => b.publisher)));
      setAuthors(authorSet.map((a) => ({ label: a, value: a })));
      setPublishers(publisherSet.map((p) => ({ label: p, value: p })));
    }

    doFecth();
  }, [type]);

  // --- Bộ dữ liệu (Giữ nguyên) ---
  const categories: FilterOption[] = [
    {
      id: "van-phong-pham",
      label: "Văn Phòng Phẩm - Dụng Cụ Học Sinh",
      count: 48,
    },
    { id: "foreign-books", label: "Foreign Books", count: 29 },
    { id: "sach-tieng-viet", label: "Sách Tiếng Việt", count: 23 },
    { id: "bach-hoa-tong-hop", label: "Bách Hóa Tổng Hợp", count: 4 },
    { id: "luu-niem", label: "Lưu Niệm", count: 4 },
  ];

  const priceRanges: PriceRange[] = [
    { id: "under-150k", label: "0đ - 150.000đ" },
    { id: "150k-300k", label: "150.000đ - 300.000đ" },
    { id: "300k-500k", label: "300.000đ - 500.000đ" },
    { id: "500k-700k", label: "500.000đ - 700.000đ" },
    { id: "over-700k", label: "700.000đ Trở Lên" },
  ];

  const discountLevels = [
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

  // --- HÀM XỬ LÝ LỌC ---

  // Xử lý khi chọn mức giá cố định (Reset giá tùy chỉnh)
  const handlePriceRangeChange = (e: any) => {
    setSelectedPrice(e.target.value);
    setCustomPriceFrom(null); // RẤT QUAN TRỌNG: Reset giá tùy chỉnh
    setCustomPriceTo(null); // RẤT QUAN TRỌNG: Reset giá tùy chỉnh
  };

  // Xử lý khi nhập giá tùy chỉnh (Reset mức giá cố định)
  const handleCustomPriceChange = (value: number | null, isFrom: boolean) => {
    setSelectedPrice(null); // RẤT QUAN TRỌNG: Reset mức giá cố định
    if (isFrom) {
      setCustomPriceFrom(value);
    } else {
      setCustomPriceTo(value);
    }
  };

  // Hàm Toggle danh mục (Giữ nguyên)
  const toggleCategory = (id: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCategories(newSelected);
  };

  // Hàm Reset toàn bộ bộ lọc
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
  const filteredBooks = books
    .filter(
      (b) => selectedCategories.size === 0 || selectedCategories.has(b.category)
    )
    .filter((b) => !selectedAuthor || b.author === selectedAuthor)
    .filter((b) => !selectedPublisher || b.publisher === selectedPublisher)
    .filter((b) => {
      // 1. Áp dụng Mức giá cố định (nếu có)
      if (selectedPrice) {
        const price = b.price;
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

      // 2. Áp dụng Mức giá tùy chỉnh (chỉ áp dụng nếu selectedPrice = null)
      if (customPriceFrom && b.price < customPriceFrom) return false;
      if (customPriceTo && b.price > customPriceTo) return false;

      return true;
    })
    .filter((b) => {
      if (!selectedDiscount) return true;
      switch (selectedDiscount) {
        case "5-10":
          return b.discount >= 5 && b.discount <= 10;
        case "10-20":
          return b.discount >= 10 && b.discount <= 20;
        case "20-30":
          return b.discount >= 20 && b.discount <= 30;
        case "over-30":
          return b.discount > 30;
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
          // Giả định publishDate là chuỗi có thể so sánh được (ISO 8601)
          return b.publishDate.localeCompare(a.publishDate);
        default:
          return 0;
      }
    });

  // --- Phân trang (Giữ nguyên) ---
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredBooks.length / pageSize);

  // --- Nội dung các phần collapse ---
  const categoriesContent = (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between">
          <Checkbox
            checked={selectedCategories.has(category.id)}
            onChange={() => toggleCategory(category.id)}
          >
            <span className="text-sm">{category.label}</span>
          </Checkbox>
          <span className="text-xs text-gray-500">({category.count})</span>
        </div>
      ))}
    </div>
  );

  const priceContent = (
    <div className="space-y-3">
      <Radio.Group
        value={selectedPrice}
        onChange={handlePriceRangeChange} // Dùng hàm mới
      >
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
        Hoặc chọn mức giá phù hợp
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
      label: <span className="font-bold text-sm">DANH MỤC CHÍNH</span>,
      children: categoriesContent,
    },
    {
      key: "2",
      label: <span className="font-bold text-sm">GIÁ</span>,
      children: (
        <>
          {priceContent}
          {customPriceContent}
        </>
      ),
    },
    {
      key: "3",
      label: <span className="font-bold text-sm">TÁC GIẢ</span>,
      children: authorContent,
    },
    {
      key: "4",
      label: <span className="font-bold text-sm">NHÀ XUẤT BẢN</span>,
      children: publisherContent,
    },
    {
      key: "5",
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
          <div className="flex justify-center items-center p-4">
            <p
              className="font-bold"
              style={{
                color: "rgb(208, 39, 47)",
                fontWeight: "bold",
                fontSize: 30,
                margin: 0,
                textAlign: "center",
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
                  backgroundColor: "rgb(208, 39, 47)",
                  fontWeight: "bold",
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
              style={{ borderColor: "rgb(217, 47, 56)" }}
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
              style={{ backgroundColor: "rgb(217, 47, 56)" }}
              // Khi người dùng nhấn nút này, toàn bộ bộ lọc sẽ được áp dụng (đã áp dụng trong state)
            >
              Áp Dụng
            </Button>
          </div>
        </Col>

        {/* Cột hiển thị sách */}
        <Col span={18}>
          <div className="mb-4 text-gray-600">
            Tìm thấy {filteredBooks.length} sản phẩm phù hợp.
          </div>
          <Row gutter={[16, 16]}>
            {paginatedBooks.map((book) => (
              // Giả sử ProductCard sử dụng col-span 8 tương đương col-md-4 của Bootstrap
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
                    currentPage === i + 1 ? "rgb(217, 47, 56)" : undefined,
                  borderColor:
                    currentPage === i + 1 ? "rgb(217, 47, 56)" : undefined,
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

// src/pages/ProductList.tsx

import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import type { Book } from "../types/Book";
import { Row, Col, Pagination, Spin, Result, Typography, Divider, Select } from 'antd';

const { Text } = Typography;
const BOOKS_PER_PAGE = 12;

const ProductList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('default'); // State cho việc sắp xếp

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/books");
        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
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

  // Sắp xếp sách dựa trên sortOrder, sử dụng useMemo để tối ưu hiệu năng
  const sortedBooks = useMemo(() => {
    const sortableBooks = [...books];
    switch (sortOrder) {
      case 'price-asc':
        sortableBooks.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortableBooks.sort((a, b) => b.price - a.price);
        break;
      case 'alpha-asc':
        sortableBooks.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      default:
        break;
    }
    return sortableBooks;
  }, [books, sortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const indexOfLastBook = currentPage * BOOKS_PER_PAGE;
  const indexOfFirstBook = indexOfLastBook - BOOKS_PER_PAGE;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);

  if (loading) return (<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" tip="Đang tải dữ liệu sách..." /></div>);

  if (error) {
    return <Result status="error" title="Không thể tải dữ liệu" subTitle={`Lỗi: ${error}`} />;
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* === TIÊU ĐỀ VÀ BỘ LỌC === */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong>Sắp xếp theo:</Text>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: 160 }}
              options={[
                { value: 'default', label: 'Mặc định' },
                { value: 'price-asc', label: 'Giá tăng dần' },
                { value: 'price-desc', label: 'Giá giảm dần' },
                { value: 'alpha-asc', label: 'Tên (A-Z)' },
              ]}
            />
          </div>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* === DANH SÁCH SẢN PHẨM === */}
        <Row gutter={[24, 32]}>
          {currentBooks.map((book) => (
            <Col key={book.bookId} xs={12} sm={8} lg={6}>
              <ProductCard book={book} />
            </Col>
          ))}
        </Row>

        {/* === PHÂN TRANG === */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
          <Pagination
            current={currentPage}
            total={sortedBooks.length}
            pageSize={BOOKS_PER_PAGE}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>
      </div>
    </div>
  );
};

export default ProductList;
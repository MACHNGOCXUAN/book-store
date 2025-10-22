// src/pages/ProductList.tsx

import { Col, Pagination, Row, Select, Spin, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const { Text } = Typography;
const BOOKS_PER_PAGE = 12;

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector((s) => s.books.books);
  const loading = useAppSelector((s) => s.books.loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('default'); // State cho việc sắp xếp

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/books");

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        // Parse JSON
        const data = await res.json();

        setBooks(data);
      } catch (err) {
        console.error(err);
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

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingTop: 24, paddingBottom: 24 }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* === TIÊU ĐỀ VÀ BỘ LỌC === */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'white',
          padding: '16px 20px',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          marginBottom: 24
        }}>
          <div>
            <Text strong style={{ fontSize: 18, color: '#333', display: 'block' }}>
              Sản phẩm nổi bật
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: '#666', fontSize: 14 }}>Sắp xếp:</Text>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: 160 }}
              size="middle"
              options={[
                { value: 'default', label: 'Mặc định' },
                { value: 'price-asc', label: 'Giá tăng dần' },
                { value: 'price-desc', label: 'Giá giảm dần' },
                { value: 'alpha-asc', label: 'Tên A-Z' },
              ]}
            />
          </div>
        </div>

        {/* === DANH SÁCH SẢN PHẨM === */}
        <Row gutter={[24, 32]}>
          {currentBooks.map((book, index) => (
            <Col
              key={book.bookId}
              xs={12}
              sm={8}
              lg={6}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`
              }}
            >
              <ProductCard book={book} />
            </Col>
          ))}
        </Row>

        {/* === PHÂN TRANG === */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 32,
          padding: '24px 0'
        }}>
          <Pagination
            current={currentPage}
            total={sortedBooks.length}
            pageSize={BOOKS_PER_PAGE}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            size="default"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductList;
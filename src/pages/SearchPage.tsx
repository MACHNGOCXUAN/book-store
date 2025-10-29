import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Row, Col, Spin, Empty } from "antd";
import type { Book } from "../types/Book";
import ProductCard from "../components/ProductCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { searchBooks } from "../features/books/bookSlice";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const dispatch = useAppDispatch();
  const books = useAppSelector((s) => s.books.books);
  const loading = useAppSelector((s) => s.books.loading);

  useEffect(() => {
    if (!q.trim()) {
      return;
    }
    dispatch(searchBooks(q));
  }, [q, dispatch]);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "20px auto",
        padding: "0 16px",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>
        Kết quả tìm kiếm cho: <strong>{q}</strong>
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin />
        </div>
      ) : books.length === 0 ? (
        <Empty description="Không tìm thấy sách nào" />
      ) : (
        <>
          <p style={{ marginBottom: 20, color: "#666" }}>
            Tìm thấy {books.length} sách
          </p>
          <Row gutter={[16, 16]}>
            {books.map((book) => (
              <Col key={book.bookId} xs={24} sm={12} md={8} lg={6}>
                <ProductCard book={book} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}

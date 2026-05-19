import type { Category } from "./Category";

export interface Book {
  bookId: string;
  title: string;
  author: string;
  publisher: string;
  category: Category;
  price: number;
  importPrice: number;
  stock: number;
  discountPercent: number;
  description: string;
  publishDate: string; // LocalDate từ backend, truyền qua JSON thành string
  coverImage: string;
}

// File: types/product.ts

export interface ProductDataType {
  bookId: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverImage: string;
  description?: string;
  publisher?: string;
  publishDate?: number;
  isbn?: string;
  pages?: number;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    categoryId: string;
    categoryName: string;
  },
  importPrice: number;
  discountPercent: number;
}

export interface ProductFormValues {
  bookId?: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverImage?: string;
  description?: string;
  publisher?: string;
  publishDate?: number;
}

export interface ProductFilterValues {
  title?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
import type { Book } from "./Book";
import type { User } from "./User";

export interface Comment {
  review_id: string | number;
  content: string;
  rating: number;
  rating_date: string;
  book?: Book;
  customer?: User;
  book_id?: string | number;
  customer_id?: string | number;
  customer_name?: string;
  customer_full_name?: string;
  bookId?: string;
  bookTitle?: string;
  customerId?: string;
  customerName?: string;
  customerFullName?: string;
  ratingDate?: string;
}

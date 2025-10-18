import type { Book } from "./Book";

export interface CartItem{
    cartItemId: string;
    quantity: number;
    unitPrice: number;
    book: Book;    
}
import type { CartItem } from "./CartItem";

export interface Cart{
    cartId: string;
    createdDate: string;
    totalAmount: number;
    customerId: string;
    items: CartItem[];
}
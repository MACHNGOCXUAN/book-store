// File: data/mockCustomers.ts
import { Customer } from "@/types/message.types";

export const customers: Customer[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    online: true,
    messages: [
      { id: 1, sender: "customer", text: "Xin chào quản lý!", time: "09:00" },
      { id: 2, sender: "manager", text: "Chào bạn, tôi có thể giúp gì?", time: "09:01" },
    ],
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    online: false,
    messages: [
      { id: 1, sender: "customer", text: "Tôi cần tư vấn sách.", time: "10:00" },
      { id: 2, sender: "manager", text: "Bạn muốn tìm sách gì ạ?", time: "10:01" },
    ],
  },
  {
    id: 3,
    name: "Phạm Văn C",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    online: true,
    messages: [
      { id: 1, sender: "customer", text: "Có sách mới không?", time: "11:00" },
      { id: 2, sender: "manager", text: "Có bạn nhé!", time: "11:01" },
    ],
  },
];
import { ImageIcon } from "@/assets/icons";
import Image from "next/image";

export const MenuItems = [
  {
    key: "/reports",
    label: "Thống kê",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.StatisticalIcon} alt="stat" width={20} height={20} />
      </span>
    ),
  },
  {
    key: "/products",
    label: "Quản lý sản phẩm",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.ProductIcon} alt="product" width={20} height={20} />
      </span>
    ),
  },
  {
    key: "/categorys",
    label: "Quản lý danh mục",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.CategoryIcon} alt="category" width={20} height={20} />
      </span>
    ),
  },
  {
    key: "/orders",
    label: "Quản lý đơn hàng",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.OrderProductIcon} alt="order" width={20} height={20} />
      </span>
    ),
  },
  {
    key: "users",
    label: "Quản lý người dùng",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.UserIcon} alt="user" width={20} height={20} />
      </span>
    ),
    children: [
      { key: '/users/customers', label: 'Khách hàng' },
      { key: '/users/staffs', label: 'Nhân viên' },
    ],
  },
  {
    key: "/messages",
    label: "Quản lý tin nhắn",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.MessageIcon} alt="message" width={20} height={20} />
      </span>
    ),
  },
  {
    key: "/discounts",
    label: "Quản lý mã giảm giá",
    icon: (
      <span style={{ display: 'inline-block', width: 20, height: 20 }}>
        <Image src={ImageIcon.DiscountIcon} alt="discount" width={20} height={20} />
      </span>
    ),
  },
];

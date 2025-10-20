// src/components/CartItem.tsx

import React from 'react';
import { Checkbox, InputNumber, Button, Flex, Typography, Image, Space, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Text } = Typography;

// Định nghĩa kiểu dữ liệu cho một item trong giỏ hàng
export interface CartItemType {
  id: string | number;
  bookId?: string | number;
  title: string;
  author?: string;
  note?: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

// Định nghĩa props cho component
interface CartItemProps {
  item: CartItemType;
  selected: boolean;
  onSelect: (id: string | number, checked: boolean) => void;
  onQuantityChange: (id: string | number, quantity: number) => void;
  onRemove: (id: string | number) => void;
}

// Hàm helper để định dạng tiền tệ - không làm tròn, giữ nguyên giá trị chính xác
const formatCurrency = (amount: number) => {
  // Định dạng VND với 2 chữ số thập phân, không làm tròn
  const formatter = new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  selected, 
  onSelect, 
  onQuantityChange, 
  onRemove 
}) => {
  
  const itemTotalPrice = item.price * item.quantity;

  const handleSelectChange = (e: CheckboxChangeEvent) => {
    onSelect(item.id, e.target.checked);
  };

  const handleQuantity = (value: number | null) => {
    if (value && value > 0) {
      onQuantityChange(item.id, value);
    }
  };

  const handleRemoveClick = () => {
    onRemove(item.id);
  };

  return (
    <Flex 
      align="center" 
      gap="middle" 
      style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0' }}
    >
      {/* Checkbox */}
      <Checkbox 
        checked={selected} 
        onChange={handleSelectChange} 
        style={{ flexShrink: 0 }}
      />

      {/* Ảnh sản phẩm */}
      <Image 
        width={100} 
        height={100} 
        src={item.imageUrl} // Bạn sẽ thay thế bằng đường dẫn ảnh thật
        alt={item.title} 
        style={{ objectFit: 'contain', flexShrink: 0, border: '1px solid #f0f0f0', borderRadius: 4 }}
        fallback="https://via.placeholder.com/100?text=Book" // Ảnh dự phòng
      />

      {/* Thông tin sách */}
      <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text strong ellipsis={{ tooltip: item.title }}>{item.title}</Text>
        {item.author && <Text type="secondary">{item.author}</Text>}
        <Space>
          <Text strong style={{ color: '#d70018' }}>{formatCurrency(item.price)}</Text>
          <Text delete type="secondary">{formatCurrency(item.originalPrice)}</Text>
        </Space>
        {item.note && <Tag color="orange">{item.note}</Tag>}
      </Flex>

      {/* Bộ chọn số lượng */}
      <InputNumber 
        min={1} 
        max={99} 
        value={item.quantity} 
        onChange={handleQuantity}
        style={{ width: 100, margin: '0 16px', flexShrink: 0, textAlign: 'center' }}
      />

      {/* Tổng tiền của item */}
      <Text strong style={{ color: '#d70018', width: 120, textAlign: 'right', flexShrink: 0 }}>
        {formatCurrency(itemTotalPrice)}
      </Text>

      {/* Nút Xóa */}
      <Button 
        type="text" 
        danger
        icon={<DeleteOutlined />} 
        onClick={handleRemoveClick}
        style={{ flexShrink: 0, marginLeft: 16 }}
      />
    </Flex>
  );
};
// src/pages/CartPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Checkbox, Button, Flex, Divider, Progress, Space } from 'antd';
import { GiftOutlined, TagOutlined, RightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { CartItem, type CartItemType } from '../components/CartItem'; // Import component CartItem
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCart, addOrUpdateCartItem, removeCartItem } from '../features/cart/cartSlice';

const { Title, Text, Link } = Typography;


// Hàm helper để định dạng tiền tệ - không làm tròn, giữ nguyên giá trị chính xác
const formatCurrency = (amount: number) => {
  const formatter = new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const CartPage = () => {
  const dispatch = useAppDispatch();
  const serverItems = useAppSelector((s) => s.cart.items || []);
  const [selectedItemIds, setSelectedItemIds] = useState<(string|number)[]>([]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Map server items to UI shape expected by CartItem component
  const cartItems: CartItemType[] = serverItems.map((it, idx) => {
    // Calculate discounted price using: discountedPrice = price - (price * discountPercent) / 100
    // No rounding - keep exact decimal value
    const bookPrice = Number(it.book?.price ?? 0);
    const discountPercent = Number(it.book?.discountPercent ?? 0);
    const discountedPrice = bookPrice - (bookPrice * discountPercent) / 100;

    return {
      id: it.cartItemId || `${idx}`,
      bookId: it.book?.bookId ?? it.book?.id,
      title: it.book?.title ?? it.book?.name ?? 'Sản phẩm',
      author: it.book?.author,
      note: undefined,
      imageUrl: it.book?.coverImage ?? '',
      price: discountedPrice > 0 ? discountedPrice : Number(it.unitPrice ?? 0),
      originalPrice: bookPrice > 0 ? bookPrice : Number(it.unitPrice ?? 0),
      quantity: Number(it.quantity ?? 1),
    };
  });

  useEffect(() => {
    // select all by default when items load
    setSelectedItemIds(cartItems.map(i => i.id));
  }, [serverItems.length]);

  const handleQuantityChange = async (id: string | number, quantity: number) => {
    // Find associated bookId from cartItems
    const ci = cartItems.find(c => c.id === id);
    if (!ci) return;
    const bookId = ci.bookId ?? String(ci.id);
    // backend expects quantity as delta to add (quantity>0 increases), so compute delta
    const delta = quantity - (ci.quantity || 0);
    if (delta === 0) return;
    try {
      await dispatch(addOrUpdateCartItem({ bookId: String(bookId), quantity: delta })).unwrap();
    } catch (e) {
      // ignore or show error
    }
    await dispatch(fetchCart()).unwrap();
    try { window.dispatchEvent(new CustomEvent('cart-updated')); } catch (e) {}
  };

  const handleRemoveItem = async (id: string | number) => {
    try {
      await dispatch(removeCartItem({ cartItemId: String(id) })).unwrap();
    } catch (e) {
      // ignore or show error
    }
    await dispatch(fetchCart()).unwrap();
    setSelectedItemIds(ids => ids.filter(itemId => itemId !== id));
    try { window.dispatchEvent(new CustomEvent('cart-updated')); } catch (e) {}
  };

  const handleSelect = (id: string | number, checked: boolean) => {
    setSelectedItemIds(ids => checked ? [...ids, id] : ids.filter(itemId => itemId !== id));
  };

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    setSelectedItemIds(e.target.checked ? cartItems.map(item => item.id) : []);
  };

  // --- Tính toán hiển thị ---

  const allSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  const indeterminate = selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length;

  const selectedItems = useMemo(() => {
    return cartItems.filter(item => selectedItemIds.includes(item.id));
  }, [cartItems, selectedItemIds]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [selectedItems]);
  
  const total = subtotal; // Giả sử VAT đã bao gồm
  const totalItemsInCart = cartItems.length;

  // Logic khuyến mãi
  const promoThreshold = 130000;
  const amountToPromo = Math.max(0, promoThreshold - subtotal);

  return (
    <div style={{ background: '#f5f5f5', padding: '24px' }}>
      <Row gutter={[24, 24]} style={{ maxWidth: 1280, margin: '0 auto' }}>
        
        {/* === CỘT BÊN TRÁI (DANH SÁCH SẢN PHẨM) === */}
        <Col xs={24} lg={16}>
          <Card bordered={false}>
            <Title level={4}>GIỎ HÀNG ({totalItemsInCart} sản phẩm)</Title>
            <Divider />
            
            {/* Header của danh sách */}
            <Flex align="center" style={{ padding: '0 8px', marginBottom: 8 }}>
              <Checkbox 
                checked={allSelected} 
                indeterminate={indeterminate} 
                onChange={handleSelectAll}
              >
                Chọn tất cả ({totalItemsInCart} sản phẩm)
              </Checkbox>
              <Text type="secondary" style={{ marginLeft: 'auto', width: 100, textAlign: 'center' }}>Số lượng</Text>
              <Text type="secondary" style={{ width: 120, textAlign: 'right' }}>Thành tiền</Text>
              <div style={{ width: 58 }} /> {/* Placeholder cho nút xóa */}
            </Flex>
            <Divider style={{ margin: '8px 0' }}/>

            {/* Danh sách Cart Items */}
            {cartItems.length === 0 ? (
              <Text type="secondary" style={{textAlign: 'center', display: 'block', padding: '40px 0'}}>
                Giỏ hàng của bạn đang trống.
              </Text>
            ) : (
              cartItems.map(item => (
                <CartItem 
                  key={item.id}
                  item={item}
                  selected={selectedItemIds.includes(item.id)}
                  onSelect={handleSelect}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))
            )}
          </Card>
        </Col>

        {/* === CỘT BÊN PHẢI (TÓM TẮT & THANH TOÁN) === */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Khuyến mãi */}
            <Card bordered={false}>
              <Flex justify="space-between" align="center">
                <Text strong><TagOutlined style={{ color: '#0A68FF', marginRight: 8 }} /> KHUYẾN MÃI</Text>
                <Link>Xem thêm <RightOutlined /></Link>
              </Flex>
              <Divider style={{margin: '12px 0'}} />
              <Flex align="center" gap="middle">
                <Flex vertical style={{flex: 1}}>
                  <Text strong>Mã Giảm 10K - Toàn Sàn <InfoCircleOutlined style={{color: '#0A68FF'}} /></Text>
                  <Text type="secondary" style={{fontSize: 12}}>Đơn hàng từ 130K - Không bao gồm...</Text>
                  <Progress percent={Math.min(100, (subtotal / promoThreshold) * 100)} showInfo={false} />
                  {amountToPromo > 0 ? (
                    <Text type="secondary" style={{fontSize: 12}}>Mua thêm {formatCurrency(amountToPromo)}</Text>
                  ) : (
                    <Text strong style={{color: 'green', fontSize: 12}}>Bạn đã đủ điều kiện nhận mã!</Text>
                  )}
                </Flex>
                <Button type="primary" disabled={amountToPromo > 0}>Mua thêm</Button>
              </Flex>
            </Card>

            {/* Nhận quà */}
            <Card bordered={false}>
              <Flex justify="space-between" align="center">
                <Text strong><GiftOutlined style={{ color: '#d70018', marginRight: 8 }} /> Nhận quà</Text>
                <Link>Chọn quà <RightOutlined /></Link>
              </Flex>
            </Card>

            {/* Tóm tắt đơn hàng */}
            <Card bordered={false}>
              <Flex justify="space-between" style={{marginBottom: 12}}>
                <Text>Thành tiền</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </Flex>
              <Divider style={{margin: '12px 0'}} />
              <Flex justify="space-between" align="center">
                <Text strong>Tổng Số Tiền (gồm VAT)</Text>
                <Text strong style={{ color: '#d70018', fontSize: '1.5rem' }}>
                  {formatCurrency(total)}
                </Text>
              </Flex>
              <Button 
                type="primary" 
                block 
                size="large" 
                disabled={total === 0} // Vô hiệu hóa nếu giỏ hàng rỗng
                style={{ 
                  marginTop: 16, 
                  background: total > 0 ? '#d70018' : '',
                  height: 48
                }}
              >
                THANH TOÁN
              </Button>
              <Text type="secondary" style={{fontSize: 12, textAlign: 'center', display: 'block', marginTop: 8}}>
                (Giảm giá trên web chỉ áp dụng cho bán lẻ)
              </Text>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
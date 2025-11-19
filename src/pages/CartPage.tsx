// src/pages/CartPage.tsx

import { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Checkbox,
  Button,
  Flex,
  Divider,
  Progress,
  Space,
  Modal,
  Drawer,
  Tag,
  message,
} from "antd";
import {
  GiftOutlined,
  TagOutlined,
  RightOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { CartItem, type CartItemType } from "../components/CartItem";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCart,
  addOrUpdateCartItem,
  removeCartItem,
} from "../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

// Hàm helper để định dạng tiền tệ - không làm tròn, giữ nguyên giá trị chính xác
const formatCurrency = (amount: number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

export const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const serverItems = useAppSelector((s) => s.cart.items || []);
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>(
    []
  );

  // Modal & Drawer states
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  // Mock data untuk khuyến mãi
  const mockPromos = [
    {
      id: "promo-1",
      name: "Mã Giảm 10K - Toàn Sàn",
      discount: "10,000₫",
      minOrder: "130,000₫",
      code: "XUAN2024",
      description: "Giảm 10K cho đơn hàng từ 130K",
      validity: "01/01 - 31/12/2024",
      quantity: "Số lượng: 5000 mã",
    },
    {
      id: "promo-2",
      name: "Mã Giảm 20% - Sách Lập Trình",
      discount: "Giảm 20%",
      minOrder: "200,000₫",
      code: "PROG2024",
      description: "Giảm 20% cho sách lập trình từ 200K",
      validity: "01/01 - 31/12/2024",
      quantity: "Số lượng: 1000 mã",
    },
    {
      id: "promo-3",
      name: "Mã Giảm 5K - Đơn từ 50K",
      discount: "5,000₫",
      minOrder: "50,000₫",
      code: "SUMMER2024",
      description: "Giảm 5K cho đơn hàng từ 50K",
      validity: "01/06 - 31/08/2024",
      quantity: "Số lượng: 10000 mã",
    },
  ];

  // Mock data cho quà tặng
  const mockGifts = [
    {
      id: "gift-1",
      name: "Combo Bút & Sổ Tay",
      image: "📔",
      minOrder: 200000,
      description: "Tặng combo bút tặng kèm sổ tay khi mua từ 200K",
      quantity: 50,
    },
    {
      id: "gift-2",
      name: "Tặng Bookmark Kim Loại",
      image: "📌",
      minOrder: 100000,
      description: "Tặng 1 Bookmark kim loại hình sách khi mua từ 100K",
      quantity: 200,
    },
    {
      id: "gift-3",
      name: "Tặng Túi Vải Bố",
      image: "👜",
      minOrder: 300000,
      description: "Tặng túi vải bố cao cấp khi mua từ 300K",
      quantity: 30,
    },
    {
      id: "gift-4",
      name: "Tặng Đèn LED Đọc Sách",
      image: "💡",
      minOrder: 500000,
      description: "Tặng đèn LED đọc sách khi mua từ 500K",
      quantity: 20,
    },
  ];

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    navigate("/checkout", { state: { items: selectedItems } });
  };

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const cartItems: CartItemType[] = serverItems.map((it, idx) => {
    const bookPrice = Number(it.book?.price ?? 0);
    const discountPercent = Number(it.book?.discountPercent ?? 0);
    const discountedPrice = bookPrice - (bookPrice * discountPercent) / 100;

    return {
      id: it.cartItemId || `${idx}`,
      bookId: it.book?.bookId ?? it.book?.id,
      title: it.book?.title ?? it.book?.name ?? "Sản phẩm",
      author: it.book?.author,
      note: undefined,
      imageUrl: it.book?.coverImage ?? "",
      price: discountedPrice > 0 ? discountedPrice : Number(it.unitPrice ?? 0),
      originalPrice: bookPrice > 0 ? bookPrice : Number(it.unitPrice ?? 0),
      quantity: Number(it.quantity ?? 1),
    };
  });

  useEffect(() => {
    // select all by default when items load
    setSelectedItemIds(cartItems.map((i) => i.id));
  }, [serverItems.length]);

  const handleQuantityChange = async (
    id: string | number,
    quantity: number
  ) => {
    // Find associated bookId from cartItems
    const ci = cartItems.find((c) => c.id === id);
    if (!ci) return;
    const bookId = ci.bookId ?? String(ci.id);
    // backend expects quantity as delta to add (quantity>0 increases), so compute delta
    const delta = quantity - (ci.quantity || 0);
    if (delta === 0) return;
    try {
      await dispatch(
        addOrUpdateCartItem({ bookId: String(bookId), quantity: delta })
      ).unwrap();
    } catch (e) {
      // ignore or show error
    }
    await dispatch(fetchCart()).unwrap();
    try {
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (e) {}
  };

  const handleRemoveItem = async (id: string | number) => {
    try {
      await dispatch(removeCartItem({ cartItemId: String(id) })).unwrap();
    } catch (e) {
      // ignore or show error
    }
    await dispatch(fetchCart()).unwrap();
    setSelectedItemIds((ids) => ids.filter((itemId) => itemId !== id));
    try {
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (e) {}
  };

  const handleSelect = (id: string | number, checked: boolean) => {
    setSelectedItemIds((ids) =>
      checked ? [...ids, id] : ids.filter((itemId) => itemId !== id)
    );
  };

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    setSelectedItemIds(
      e.target.checked ? cartItems.map((item) => item.id) : []
    );
  };

  // --- Tính toán hiển thị ---

  const allSelected =
    cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  const indeterminate =
    selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length;

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => selectedItemIds.includes(item.id));
  }, [cartItems, selectedItemIds]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [selectedItems]);

  const total = subtotal; // Giả sử VAT đã bao gồm
  const totalItemsInCart = cartItems.length;

  // Logic khuyến mãi
  const promoThreshold = 130000;
  const amountToPromo = Math.max(0, promoThreshold - subtotal);

  // Handle promo modal
  const handlePromoClick = () => {
    setIsPromoModalOpen(true);
  };

  // Handle gift drawer
  const handleGiftClick = () => {
    if (subtotal < 50000) {
      message.warning("Cần mua từ 50K để có quà tặng");
      return;
    }
    setIsGiftDrawerOpen(true);
  };

  // Handle select gift
  const handleSelectGift = (giftId: string) => {
    const gift = mockGifts.find((g) => g.id === giftId);
    if (gift && subtotal < gift.minOrder) {
      message.warning(
        `Cần mua từ ${formatCurrency(gift.minOrder)} để chọn quà này`
      );
      return;
    }
    setSelectedGift(giftId);
    message.success("Đã chọn quà tặng!");
  };

  // Handle copy promo code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("Đã copy mã: " + code);
  };

  return (
    <div style={{ background: "#f5f5f5", padding: "24px" }}>
      <Row gutter={[24, 24]} style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* === CỘT BÊN TRÁI (DANH SÁCH SẢN PHẨM) === */}
        <Col xs={24} lg={16}>
          <Card variant="borderless">
            <Title level={4}>GIỎ HÀNG ({totalItemsInCart} sản phẩm)</Title>
            <Divider />

            {/* Header của danh sách */}
            <Flex align="center" style={{ padding: "0 8px", marginBottom: 8 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={handleSelectAll}
              >
                Chọn tất cả ({totalItemsInCart} sản phẩm)
              </Checkbox>
              <Text
                type="secondary"
                style={{ marginLeft: "auto", width: 100, textAlign: "center" }}
              >
                Số lượng
              </Text>
              <Text type="secondary" style={{ width: 120, textAlign: "right" }}>
                Thành tiền
              </Text>
              <div style={{ width: 58 }} /> {/* Placeholder cho nút xóa */}
            </Flex>
            <Divider style={{ margin: "8px 0" }} />

            {/* Danh sách Cart Items */}
            {cartItems.length === 0 ? (
              <Text
                type="secondary"
                style={{
                  textAlign: "center",
                  display: "block",
                  padding: "40px 0",
                }}
              >
                Giỏ hàng của bạn đang trống.
              </Text>
            ) : (
              cartItems.map((item) => (
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
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Khuyến mãi */}
            <Card bordered={false}>
              <Flex justify="space-between" align="center">
                <Text strong>
                  <TagOutlined style={{ color: "#0A68FF", marginRight: 8 }} />{" "}
                  KHUYẾN MÃI
                </Text>
                <Button
                  type="text"
                  onClick={handlePromoClick}
                  style={{ color: "#0A68FF" }}
                >
                  Xem thêm <RightOutlined />
                </Button>
              </Flex>
              <Divider style={{ margin: "12px 0" }} />
              <Flex align="center" gap="middle">
                <Flex vertical style={{ flex: 1 }}>
                  <Text strong>
                    Mã Giảm 10K - Toàn Sàn{" "}
                    <InfoCircleOutlined style={{ color: "#0A68FF" }} />
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Đơn hàng từ 130K - Không bao gồm...
                  </Text>
                  <Progress
                    percent={Math.min(100, (subtotal / promoThreshold) * 100)}
                    showInfo={false}
                  />
                  {amountToPromo > 0 ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Mua thêm {formatCurrency(amountToPromo)}
                    </Text>
                  ) : (
                    <Text strong style={{ color: "green", fontSize: 12 }}>
                      Bạn đã đủ điều kiện nhận mã!
                    </Text>
                  )}
                </Flex>
                <Button type="primary" disabled={amountToPromo > 0}>
                  Mua thêm
                </Button>
              </Flex>
            </Card>

            {/* Nhận quà */}
            <Card bordered={false}>
              <Flex justify="space-between" align="center">
                <Text strong>
                  <GiftOutlined style={{ color: "#d70018", marginRight: 8 }} />{" "}
                  Nhận quà
                </Text>
                <Button
                  type="text"
                  onClick={handleGiftClick}
                  style={{ color: "#d70018" }}
                >
                  Chọn quà <RightOutlined />
                </Button>
              </Flex>
              {selectedGift && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#fff7f0",
                    borderRadius: 6,
                  }}
                >
                  <Text type="success">
                    ✓ Đã chọn quà tặng:{" "}
                    {mockGifts.find((g) => g.id === selectedGift)?.name}
                  </Text>
                </div>
              )}
            </Card>

            {/* Tóm tắt đơn hàng */}
            <Card bordered={false}>
              <Flex justify="space-between" style={{ marginBottom: 12 }}>
                <Text>Thành tiền</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </Flex>
              <Divider style={{ margin: "12px 0" }} />
              <Flex justify="space-between" align="center">
                <Text strong>Tổng Số Tiền (gồm VAT)</Text>
                <Text strong style={{ color: "#d70018", fontSize: "1.5rem" }}>
                  {formatCurrency(total)}
                </Text>
              </Flex>
              <Button
                type="primary"
                block
                size="large"
                disabled={total === 0}
                style={{
                  marginTop: 16,
                  background: total > 0 ? "#d70018" : "",
                  height: 48,
                }}
                onClick={handleCheckout}
              >
                THANH TOÁN
              </Button>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  textAlign: "center",
                  display: "block",
                  marginTop: 8,
                }}
              >
                (Giảm giá trên web chỉ áp dụng cho bán lẻ)
              </Text>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* PROMO MODAL */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <TagOutlined style={{ marginRight: 8, color: "#0A68FF" }} />
            Danh Sách Khuyến Mãi
          </div>
        }
        open={isPromoModalOpen}
        onCancel={() => setIsPromoModalOpen(false)}
        footer={null}
        width={700}
      >
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {mockPromos.map((promo) => (
              <Card
                key={promo.id}
                style={{ borderLeft: "4px solid #0A68FF", borderRadius: 8 }}
              >
                <Flex justify="space-between" align="flex-start" gap="middle">
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 16 }}>
                        {promo.name}
                      </Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Tag color="blue">{promo.discount}</Tag>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        Đơn tối thiểu: {promo.minOrder}
                      </Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">{promo.description}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        📅 Hiệu lực: {promo.validity}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {promo.quantity}
                      </Text>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    onClick={() => handleCopyCode(promo.code)}
                    style={{ background: "#0A68FF" }}
                  >
                    Copy: {promo.code}
                  </Button>
                </Flex>
              </Card>
            ))}
          </Space>
        </div>
      </Modal>

      {/* GIFT DRAWER */}
      <Drawer
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <GiftOutlined style={{ marginRight: 8, color: "#d70018" }} />
            Chọn Quà Tặng
          </div>
        }
        placement="right"
        onClose={() => setIsGiftDrawerOpen(false)}
        open={isGiftDrawerOpen}
        width={450}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div
            style={{
              padding: "12px",
              background: "#fff7f0",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text strong style={{ color: "#d70018" }}>
              💡 Mục Tiêu Đơn Hàng Của Bạn: {formatCurrency(subtotal)}
            </Text>
          </div>

          {mockGifts.map((gift) => {
            const canSelect = subtotal >= gift.minOrder;
            return (
              <Card
                key={gift.id}
                hoverable={canSelect}
                style={{
                  borderRadius: 8,
                  opacity: canSelect ? 1 : 0.6,
                  border:
                    selectedGift === gift.id
                      ? "2px solid #d70018"
                      : "1px solid #f0f0f0",
                  background:
                    selectedGift === gift.id ? "#fff7f0" : "transparent",
                }}
                onClick={() => {
                  if (canSelect) {
                    handleSelectGift(gift.id);
                  }
                }}
              >
                <Flex gap="middle" align="flex-start">
                  <div
                    style={{
                      fontSize: 40,
                      width: 60,
                      textAlign: "center",
                    }}
                  >
                    {gift.image}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {gift.name}
                        {selectedGift === gift.id && (
                          <Tag color="red" style={{ marginLeft: 8 }}>
                            ✓ Đã chọn
                          </Tag>
                        )}
                      </Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {gift.description}
                      </Text>
                    </div>
                    <Flex justify="space-between" align="center">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Yêu cầu: từ {formatCurrency(gift.minOrder)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Còn: {gift.quantity}
                      </Text>
                    </Flex>
                  </div>
                </Flex>
              </Card>
            );
          })}
        </Space>
      </Drawer>
    </div>
  );
};

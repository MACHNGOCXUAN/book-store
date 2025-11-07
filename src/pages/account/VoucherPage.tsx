import { CopyOutlined, GiftOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Col, Empty, message, Row, Tabs } from "antd";
import { useState } from "react";

interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discount: string;
  minOrder?: string;
  expiryDate: string;
  description?: string;
  type: "freeship" | "discount" | "gift";
  status: "available" | "used" | "expired";
}

interface VoucherProps {
  vouchers?: VoucherItem[];
}

const VoucherPage = ({ vouchers }: VoucherProps) => {
  const [activeTab, setActiveTab] = useState("available");

  // Mock data
  const mockVouchers: VoucherItem[] = vouchers || [
    {
      id: "1",
      code: "FAHASA50K",
      title: "Giảm 50.000đ",
      discount: "50.000đ",
      minOrder: "Đơn hàng từ 300.000đ",
      expiryDate: "31/12/2025",
      description: "Áp dụng cho tất cả sản phẩm",
      type: "discount",
      status: "available",
    },
    {
      id: "2",
      code: "FREESHIP30K",
      title: "Freeship 30K",
      discount: "30.000đ",
      minOrder: "Đơn hàng từ 150.000đ",
      expiryDate: "30/11/2025",
      description: "Miễn phí vận chuyển",
      type: "freeship",
      status: "available",
    },
    {
      id: "3",
      code: "DISCOUNT20",
      title: "Giảm 20%",
      discount: "20%",
      minOrder: "Đơn hàng từ 500.000đ",
      expiryDate: "15/11/2025",
      description: "Tối đa 100.000đ",
      type: "discount",
      status: "available",
    },
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("Đã copy mã voucher!");
  };

  const getVouchersByStatus = (status: string) => {
    return mockVouchers.filter((v) => v.status === status);
  };

  const renderVoucherCard = (voucher: VoucherItem) => {
    const isExpired = voucher.status === "expired";
    const isUsed = voucher.status === "used";

    return (
      <Col xs={24} sm={12} lg={8} key={voucher.id}>
        <Card
          hoverable={!isExpired && !isUsed}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid #f0f0f0",
            position: "relative",
            opacity: isExpired || isUsed ? 0.6 : 1,
          }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Voucher Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #C92127 0%, #E63946 100%)",
              padding: "16px 20px",
              color: "white",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {voucher.discount}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  {voucher.minOrder}
                </div>
              </div>
              <GiftOutlined style={{ fontSize: 32, opacity: 0.3 }} />
            </div>
          </div>

          {/* Voucher Body */}
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#333",
                marginBottom: 8,
              }}
            >
              {voucher.title}
            </div>

            {voucher.description && (
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 12,
                }}
              >
                {voucher.description}
              </div>
            )}

            {/* Voucher Code */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#FFF5F5",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#C92127",
                  fontSize: 14,
                }}
              >
                {voucher.code}
              </span>
              <Button
                type="link"
                icon={<CopyOutlined />}
                size="small"
                onClick={() => handleCopyCode(voucher.code)}
                style={{ color: "#C92127" }}
                disabled={isExpired || isUsed}
              >
                Copy
              </Button>
            </div>

            {/* Expiry Date */}
            <div
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
              }}
            >
              HSD: {voucher.expiryDate}
            </div>

            {/* Status Badge */}
            {(isExpired || isUsed) && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: isExpired ? "#ff4d4f" : "#52c41a",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {isExpired ? "Hết hạn" : "Đã dùng"}
              </div>
            )}
          </div>
        </Card>
      </Col>
    );
  };

  const tabItems = [
    {
      key: "available",
      label: (
        <span>
          Có thể sử dụng
          <Badge
            count={getVouchersByStatus("available").length}
            style={{
              marginLeft: 8,
              backgroundColor: "#C92127",
            }}
          />
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {getVouchersByStatus("available").length > 0 ? (
            getVouchersByStatus("available").map(renderVoucherCard)
          ) : (
            <Col span={24}>
              <Empty
                description="Không có voucher khả dụng"
                style={{ padding: "40px 0" }}
              />
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: "used",
      label: "Đã sử dụng",
      children: (
        <Row gutter={[16, 16]}>
          {getVouchersByStatus("used").length > 0 ? (
            getVouchersByStatus("used").map(renderVoucherCard)
          ) : (
            <Col span={24}>
              <Empty
                description="Chưa có voucher đã sử dụng"
                style={{ padding: "40px 0" }}
              />
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: "expired",
      label: "Hết hạn",
      children: (
        <Row gutter={[16, 16]}>
          {getVouchersByStatus("expired").length > 0 ? (
            getVouchersByStatus("expired").map(renderVoucherCard)
          ) : (
            <Col span={24}>
              <Empty
                description="Không có voucher hết hạn"
                style={{ padding: "40px 0" }}
              />
            </Col>
          )}
        </Row>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <GiftOutlined style={{ marginRight: 8, color: "#C92127" }} />
          Ví Voucher
        </div>
      }
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginTop: -8 }}
      />
    </Card>
  );
};

export default VoucherPage;

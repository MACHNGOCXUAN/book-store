import { GiftOutlined, HeartOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Col,
  Empty,
  Modal,
  Row,
  Spin,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  exchangeVoucher,
  fetchExchangeableVouchers,
  fetchLoyaltyInfo,
} from "../../services/loyaltyService";
import type { ExchangeableVoucher, LoyaltyInfo } from "../../types/Loyalty";

// Tier thresholds and colors
const TIER_THRESHOLDS = {
  NEW_USER: { min: 0, color: "#A0A0A0", name: "Khách hàng mới" },
  REGULAR: { min: 100, color: "#FF9800", name: "Thành viên thường xuyên" },
  VIP: { min: 500, color: "#4CAF50", name: "Thành viên VIP" },
  DIAMOND: { min: 2000, color: "#2196F3", name: "Thành viên Diamond" },
};

const TIER_ORDER = ["NEW_USER", "REGULAR", "VIP", "DIAMOND"];

const ExchangeVoucherPage = () => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [vouchers, setVouchers] = useState<ExchangeableVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [selectedVoucher, setSelectedVoucher] =
    useState<ExchangeableVoucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("access_token") || "";

  // Load dữ liệu khi component mount
  useEffect(() => {
    console.log("Token available:", !!token);
    if (token) {
      loadData();
    } else {
      message.warning("Vui lòng đăng nhập để xem voucher");
    }
  }, [token]);

  const loadData = async () => {
    if (!token) {
      message.error("Vui lòng đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const [loyaltyData, vouchersData] = await Promise.all([
        fetchLoyaltyInfo(token),
        fetchExchangeableVouchers(token),
      ]);
      console.log("Loyalty Data:", loyaltyData);
      console.log("Vouchers Data:", vouchersData);
      setLoyaltyInfo(loyaltyData);
      setVouchers(vouchersData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      message.error(error.message || "Lỗi khi tải dữ liệu");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = (voucher: ExchangeableVoucher) => {
    if (!loyaltyInfo) {
      message.error("Không thể lấy thông tin tài khoản");
      return;
    }

    // Kiểm tra điều kiện
    if (loyaltyInfo.currentPoints < voucher.redeemCost) {
      message.error(
        `Bạn cần ít nhất ${voucher.redeemCost} điểm để đổi voucher này`
      );
      return;
    }

    if (
      voucher.minTierRequired &&
      voucher.minTierRequired !== "NEW_USER" &&
      voucher.minTierRequired !== null
    ) {
      // Kiểm tra tier dựa trên điểm hiện tại (không dùng currentTier từ backend)
      const tierHierarchy: { [key: string]: number } = {
        NEW_USER: 0,
        REGULAR: 1,
        VIP: 2,
        DIAMOND: 3,
      };
      const calculatedTier = calculateTierFromPoints(loyaltyInfo.currentPoints);
      const currentTierLevel = tierHierarchy[calculatedTier] || 0;
      const requiredTierLevel = tierHierarchy[voucher.minTierRequired] || 0;

      if (currentTierLevel < requiredTierLevel) {
        message.error(
          `Bạn phải đạt tier ${voucher.minTierRequired} để đổi voucher này`
        );
        return;
      }
    }

    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const confirmExchange = async () => {
    if (!selectedVoucher) return;

    setExchanging(true);
    try {
      console.log(
        "Confirming exchange for voucher:",
        selectedVoucher.voucherId
      );
      console.log("Request payload:", {
        voucherId: selectedVoucher.voucherId,
        pointsToSpend: selectedVoucher.redeemCost,
      });

      const response = await exchangeVoucher(token, {
        voucherId: selectedVoucher.voucherId,
        pointsToSpend: selectedVoucher.redeemCost,
      });

      console.log("Exchange response:", response);
      message.success(`Đổi thành công!`);
      setIsModalOpen(false);
      setSelectedVoucher(null);

      // Reload dữ liệu
      loadData();
    } catch (error: any) {
      console.error("Exchange error details:", error);
      message.error(error.message || "Lỗi khi đổi voucher. Vui lòng thử lại.");
    } finally {
      setExchanging(false);
    }
  };

  // Calculate tier based on current points (ignore backend currentTier)
  const calculateTierFromPoints = (currentPoints: number): string => {
    for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
      const tier = TIER_ORDER[i];
      const threshold = TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS].min;
      if (currentPoints >= threshold) {
        return tier;
      }
    }
    return "NEW_USER";
  };

  const getTierInfo = () => {
    const tier = calculateTierFromPoints(loyaltyInfo?.currentPoints || 0);
    return {
      tier,
      color: TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS]?.color || "#A0A0A0",
      tierName: TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS]?.name || "Khách hàng mới",
    };
  };

  const getPointsToNextTier = (currentPoints: number): { nextTier: string; pointsNeeded: number } => {
    for (const tier of TIER_ORDER) {
      const threshold = TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS].min;
      if (currentPoints < threshold) {
        return {
          nextTier: TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS].name,
          pointsNeeded: threshold - currentPoints,
        };
      }
    }
    return { nextTier: "Diamond", pointsNeeded: 0 };
  };

  const currentTierInfo = getPointsToNextTier(loyaltyInfo?.currentPoints || 0);

  const renderVoucherCard = (voucher: ExchangeableVoucher) => {
    // Determine eligibility purely from client-visible rules (points + tier),
    // calculated from current points, not the backend isExchangeable flag.
    const tierHierarchy: { [key: string]: number } = {
      NEW_USER: 0,
      REGULAR: 1,
      VIP: 2,
      DIAMOND: 3,
    };
    const calculatedTier = calculateTierFromPoints(loyaltyInfo?.currentPoints || 0);
    const currentTierLevel = tierHierarchy[calculatedTier] || 0;
    const requiredTierLevel = tierHierarchy[voucher.minTierRequired || "NEW_USER"] || 0;
    const meetsTier = currentTierLevel >= requiredTierLevel;
    const hasPoints = (loyaltyInfo?.currentPoints || 0) >= voucher.redeemCost;
    const canExchange = meetsTier && hasPoints;

    const minTierName =
      voucher.minTierRequired === "NEW_USER" || !voucher.minTierRequired
        ? "Không giới hạn"
        : voucher.minTierRequired;

    return (
      <Col xs={24} sm={12} lg={8} key={voucher.voucherId}>
        <Card
          hoverable={canExchange}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid #f0f0f0",
            opacity: canExchange ? 1 : 0.6,
            position: "relative",
          }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Header với thông tin discount */}
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
                  {voucher.discountPercent}%
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  Giảm {voucher.discountPercent}%
                </div>
              </div>
              <GiftOutlined style={{ fontSize: 32, opacity: 0.3 }} />
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#333",
                marginBottom: 8,
              }}
            >
              {voucher.voucherName}
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

            {/* Chi phí đổi */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                background: "#FFF5F5",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#999" }}>Chi phí đổi</div>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#C92127" }}
                >
                  {voucher.redeemCost}{" "}
                  <span style={{ fontSize: 12 }}>điểm</span>
                </div>
              </div>
              <HeartOutlined
                style={{ fontSize: 24, color: "#C92127", opacity: 0.5 }}
              />
            </div>

            {/* Min Price */}
            {voucher.minPriceToApply > 0 && (
              <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                📦 Đơn tối thiểu:{" "}
                {voucher.minPriceToApply.toLocaleString("vi-VN")}₫
              </div>
            )}

            {/* Tier requirement */}
            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 12,
                padding: "8px 12px",
                background: "#F5F5F5",
                borderRadius: 6,
              }}
            >
              👑 Yêu cầu tier: <strong>{minTierName}</strong>
            </div>

            {/* Remaining Points */}
            {loyaltyInfo && (
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 12,
                  padding: "8px 12px",
                  background:
                    loyaltyInfo.currentPoints >= voucher.redeemCost
                      ? "#F0F5FF"
                      : "#FFE6E6",
                  borderRadius: 6,
                  border: `1px solid ${loyaltyInfo.currentPoints >= voucher.redeemCost
                    ? "#D0D9FF"
                    : "#FFD9D9"
                    }`,
                }}
              >
                Điểm còn lại: <strong>{loyaltyInfo.currentPoints}</strong>
              </div>
            )}

            {/* Action Button */}
            <Button
              type={canExchange ? "primary" : "default"}
              danger={canExchange || false}
              block
              disabled={!canExchange}
              onClick={() => handleExchange(voucher)}
              style={{
                borderRadius: 6,
                background: canExchange ? "#C92127" : undefined,
                borderColor: canExchange ? "#C92127" : undefined,
              }}
            >
              {canExchange ? "Đổi ngay" : (hasPoints ? "Không đủ tier" : "Không đủ điểm")}
            </Button>
          </div>

          {/* Status Badge */}
          {!canExchange && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "#ff4d4f",
                color: "white",
                padding: "4px 12px",
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              🔒 {hasPoints ? "Yêu cầu tier" : "Thiếu điểm"}
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            fontWeight: 600,
            justifyContent: "space-between",
          }}
        >
          <span>
            <GiftOutlined style={{ marginRight: 8, color: "#C92127" }} />
            Đổi Voucher bằng Loyalty Points
          </span>
          {loyaltyInfo && (
            <Badge
              count={
                <span
                  style={{
                    background: getTierInfo().color,
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {loyaltyInfo.currentPoints} ❤️
                </span>
              }
            />
          )}
        </div>
      }
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Spin spinning={loading}>
        {/* Loyalty Info */}
        {loyaltyInfo && (
          <Card
            style={{
              marginBottom: 24,
              background: getTierInfo().color,
              border: `2px solid ${getTierInfo().color}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "24px",
              }}
            >
              {/* Left: Current Points */}
              <div style={{ flex: 1, minWidth: "120px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  {loyaltyInfo.currentPoints}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  Điểm hiện tại
                </div>
              </div>

              {/* Center: Rank Badge */}
              <div style={{ flex: 1, minWidth: "150px", textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.95)",
                    color: getTierInfo().color,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {getTierInfo().tierName}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  Hạng thành viên
                </div>
              </div>

              {/* Right: Points to Next Tier */}
              <div style={{ flex: 1, minWidth: "150px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  {currentTierInfo.pointsNeeded === 0 ? "🏆" : currentTierInfo.pointsNeeded}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {currentTierInfo.pointsNeeded === 0
                    ? "Rank cao nhất"
                    : `Điểm cần để đến ${currentTierInfo.nextTier}`}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tier Hierarchy */}
        {loyaltyInfo && (
          <Collapse
            style={{
              marginBottom: 24,
              borderRadius: 8,
            }}
            items={[
              {
                key: "1",
                label: (
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    📊 Hệ thống rank
                  </div>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {TIER_ORDER.map((tier) => {
                      const tierInfo = TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS];
                      const calculatedTier = calculateTierFromPoints(loyaltyInfo.currentPoints || 0);
                      const isCurrentTier = calculatedTier === tier;
                      const isReached = (loyaltyInfo.currentPoints || 0) >= tierInfo.min;
                      const pointsInThisTier = Math.max(0, (loyaltyInfo.currentPoints || 0) - tierInfo.min);

                      // Find next tier threshold
                      const tierIndex = TIER_ORDER.indexOf(tier);
                      const nextTierThreshold = tierIndex < TIER_ORDER.length - 1
                        ? TIER_THRESHOLDS[TIER_ORDER[tierIndex + 1] as keyof typeof TIER_THRESHOLDS].min
                        : null;
                      const pointsToNextInThisRank = nextTierThreshold ? nextTierThreshold - tierInfo.min : null;

                      return (
                        <Col xs={24} sm={12} key={tier}>
                          <Card
                            style={{
                              borderRadius: 8,
                              border: isCurrentTier ? `2px solid ${tierInfo.color}` : "1px solid #E8E8E8",
                              background: isCurrentTier ? `${tierInfo.color}08` : "#FFFFFF",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <div
                                style={{
                                  display: "inline-block",
                                  padding: "6px 12px",
                                  background: tierInfo.color,
                                  color: "white",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {tierInfo.name}
                              </div>
                              {isCurrentTier && (
                                <span style={{ color: tierInfo.color, fontWeight: 600, fontSize: 12 }}>
                                  ✓ Hiện tại
                                </span>
                              )}
                              {isReached && !isCurrentTier && (
                                <span style={{ color: tierInfo.color, fontWeight: 600, fontSize: 12 }}>
                                  ✓ Đã đạt
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                padding: "12px",
                                background: "#F5F5F5",
                                borderRadius: 6,
                                marginBottom: 12,
                              }}
                            >
                              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                                Yêu cầu: <strong>{tierInfo.min} điểm</strong>
                              </div>
                              {pointsToNextInThisRank && nextTierThreshold && (
                                <div style={{ fontSize: 12, color: "#666" }}>
                                  Khoảng: {tierInfo.min} - {nextTierThreshold - 1} điểm
                                </div>
                              )}
                            </div>

                            {isCurrentTier && pointsToNextInThisRank && (
                              <div
                                style={{
                                  padding: "12px",
                                  background: `${tierInfo.color}15`,
                                  borderRadius: 6,
                                  border: `1px solid ${tierInfo.color}40`,
                                }}
                              >
                                <div style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>
                                  Tiến độ: <strong>{pointsInThisTier} / {pointsToNextInThisRank} điểm</strong>
                                </div>
                                <div
                                  style={{
                                    width: "100%",
                                    height: 8,
                                    background: "#E0E0E0",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${(pointsInThisTier / pointsToNextInThisRank) * 100}%`,
                                      height: "100%",
                                      background: tierInfo.color,
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                ),
              },
            ]}
          />
        )}

        {/* Voucher List */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Voucher có thể đổi
          </h3>
          {vouchers.length > 0 ? (
            <Row gutter={[16, 16]}>{vouchers.map(renderVoucherCard)}</Row>
          ) : (
            <Empty
              description="Không có voucher khả dụng"
              style={{ padding: "40px 0" }}
            />
          )}
        </div>
      </Spin>

      {/* Confirm Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <GiftOutlined style={{ marginRight: 8, color: "#C92127" }} />
            Xác nhận đổi voucher
          </div>
        }
        open={isModalOpen}
        onOk={confirmExchange}
        onCancel={() => setIsModalOpen(false)}
        loading={exchanging}
        okText="Đồng ý đổi"
        cancelText="Huỷ bỏ"
        okButtonProps={{
          danger: true,
          style: { background: "#C92127", borderColor: "#C92127" },
        }}
      >
        {selectedVoucher && loyaltyInfo && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p>
                <strong>Voucher:</strong> {selectedVoucher.voucherName}
              </p>
              <p>
                <strong>Giảm giá:</strong> {selectedVoucher.discountPercent}%
              </p>
              <p>
                <strong>Chi phí:</strong>{" "}
                <span style={{ color: "#C92127", fontWeight: 700 }}>
                  {selectedVoucher.redeemCost} điểm ❤️
                </span>
              </p>
            </div>

            <div
              style={{
                padding: "12px",
                background: "#F5F5F5",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 12, margin: "0 0 8px 0" }}>
                Điểm hiện tại của bạn:
              </p>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#C92127",
                  margin: 0,
                }}
              >
                {loyaltyInfo.currentPoints} ❤️
              </p>
              <p style={{ fontSize: 12, margin: "8px 0 0 0", color: "#666" }}>
                Sau khi đổi:{" "}
                {loyaltyInfo.currentPoints - selectedVoucher.redeemCost} ❤️
              </p>
            </div>

            <p style={{ color: "#FF9800", fontSize: 12 }}>
              ⚠️ Hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước
              khi đồng ý.
            </p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ExchangeVoucherPage;

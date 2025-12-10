import { CopyOutlined, GiftOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  message,
  Row,
  Spin,
  Tabs,
} from "antd";
import React, { useEffect, useState } from "react";
import API from "../../config/api";
import { useAppSelector } from "../../store/hooks";
import type { WalletVoucher } from "../../types/Loyalty";

const VoucherPage = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const [activeTab, setActiveTab] = useState("available");
  const [walletVouchers, setWalletVouchers] = useState<WalletVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE: string =
    (typeof API === "object" && (API as { API_BASE?: string }).API_BASE) ||
    (import.meta.env &&
      (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL) ||
    "http://DESKTOP-GL3I116:8080/api";
  const buildApiUrl = (path: string) => {
    const base = API_BASE.replace(/\/$/, "");
    return base.endsWith("/api") ? `${base}${path}` : `${base}/api${path}`;
  };

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token") || "";

        if (!token) {
          throw new Error("No token found");
        }
        // Lấy tất cả voucher theo khách hàng hiện tại (context CUSTOMER)
        const resp = await fetch(buildApiUrl(`/discounts/wallet`), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${t || "Không thể tải ví"}`);
        }
        const data = await resp.json();
        console.log("📱 Loaded wallet vouchers:", data);
        console.log(
          "📱 Raw data type:",
          typeof data,
          "Is array:",
          Array.isArray(data)
        );

        // Log chi tiết từng voucher từ backend
        if (Array.isArray(data)) {
          data.forEach((item: Record<string, unknown>, index: number) => {
            console.log(`\n📦 === Voucher ${index} ===`);
            console.log("walletVoucherId:", item.walletVoucherId);
            console.log("discountCodeId:", item.discountCodeId);
            console.log("name:", item.name);
            console.log("percent:", item.percent);
            console.log("minPriceToApply:", item.minPriceToApply);
            console.log("description:", item.description);
            console.log("endDate:", item.endDate);
            console.log("used:", item.used, "Type:", typeof item.used);
            console.log(
              "remainingUses:",
              item.remainingUses,
              "Type:",
              typeof item.remainingUses
            );
            console.log("source:", item.source);
            console.log("All keys:", Object.keys(item));
          });
        }

        // data là mảng map DTO trả từ backend
        const normalized = (Array.isArray(data) ? data : []).map(
          (m: Record<string, unknown>) => {
            console.log("📱 Normalizing voucher:", {
              discountCodeId: m.discountCodeId,
              endDate: m.endDate,
              used: m.used,
              remainingUses: m.remainingUses,
              allKeys: Object.keys(m),
            });
            return {
              walletVoucherId: String(
                m.walletVoucherId ?? m.discountCodeId ?? ""
              ),
              discountCodeId: String(m.discountCodeId ?? ""),
              name: String(m.name ?? ""),
              percent: Number(m.percent ?? 0),
              minPriceToApply: Number(m.minPriceToApply ?? 0),
              description: String(m.description ?? ""),
              startDate: String(m.startDate ?? new Date().toISOString()),
              endDate: String(m.endDate ?? new Date().toISOString()),
              createdDate: new Date().toISOString(),
              used: Boolean(m.used),
              remainingUses: Number(m.remainingUses ?? 0),
              isPublic: Boolean(m.isPublic ?? true),
              redeemable: Boolean(m.redeemable ?? false),
              discountType: (m.discountType === "ONE_TIME"
                ? "ONE_TIME"
                : "MANY_TIME") as "ONE_TIME" | "MANY_TIME",
              maxQuantityCanUse: Number(m.maxQuantityCanUse ?? 1),
            };
          }
        ) as WalletVoucher[];
        console.log(
          "📊 Normalized vouchers:",
          normalized.map((v) => ({
            discountCodeId: v.discountCodeId,
            used: v.used,
            remainingUses: v.remainingUses,
          }))
        );
        setWalletVouchers(normalized as WalletVoucher[]);
      } catch (error) {
        console.error("Error loading vouchers:", error);
        if (!(error instanceof Error && error.message === "No token found")) {
          message.error("Không thể tải danh sách voucher");
        }
      } finally {
        setLoading(false);
      }
    };
    loadVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.userId]);
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("access_token") || "";
      if (!token) {
        message.error("Vui lòng đăng nhập!");
        return;
      }
      const resp = await fetch(buildApiUrl(`/discounts/wallet`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        message.error(`Không thể làm mới (HTTP ${resp.status})`);
        return;
      }
      const data = await resp.json();
      const normalized = (Array.isArray(data) ? data : []).map(
        (m: Record<string, unknown>) => ({
          walletVoucherId: String(m.walletVoucherId ?? m.discountCodeId ?? ""),
          discountCodeId: String(m.discountCodeId ?? ""),
          name: String(m.name ?? ""),
          percent: Number(m.percent ?? 0),
          minPriceToApply: Number(m.minPriceToApply ?? 0),
          description: String(m.description ?? ""),
          startDate: String(m.startDate ?? new Date().toISOString()),
          endDate: String(m.endDate ?? new Date().toISOString()),
          createdDate: new Date().toISOString(),
          used: Boolean(m.used),
          remainingUses: Number(m.remainingUses ?? 0),
          isPublic: Boolean(m.isPublic ?? true),
          redeemable: Boolean(m.redeemable ?? false),
          discountType: (m.discountType === "ONE_TIME"
            ? "ONE_TIME"
            : "MANY_TIME") as "ONE_TIME" | "MANY_TIME",
          maxQuantityCanUse: Number(m.maxQuantityCanUse ?? 1),
        })
      ) as WalletVoucher[];
      setWalletVouchers(normalized as WalletVoucher[]);
      message.success("Đã làm mới danh sách voucher");
    } catch {
      message.error("Không thể làm mới danh sách voucher");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("Đã copy mã voucher!");
  };

  const getVouchersByStatus = (status: string): WalletVoucher[] => {
    const filtered = walletVouchers.filter((v) => {
      const isExpired = new Date(v.endDate) < new Date();
      const isUsed = Boolean(v.used);
      const hasRemainingUses = v.remainingUses > 0;

      console.log(
        `🔍 Filter check ${v.discountCodeId}: status=${status}, isUsed=${isUsed}, isExpired=${isExpired}, remainingUses=${v.remainingUses}, hasRemaining=${hasRemainingUses}`
      );

      if (status === "EXPIRED") return isExpired;
      if (status === "USED") return isUsed && !isExpired;
      if (status === "AVAILABLE") {
        const result = !isUsed && !isExpired && hasRemainingUses;
        if (result) {
          console.log(`✅ ${v.discountCodeId} PASSED AVAILABLE filter`);
        }
        return result;
      }
      return false;
    });
    console.log(
      `📊 Status ${status}: ${filtered.length} vouchers =>`,
      filtered.map((v) => v.discountCodeId)
    );
    return filtered;
  };

  const renderVoucherCard = (voucher: WalletVoucher) => {
    const isExpired = new Date(voucher.endDate) < new Date();
    const isUsed = Boolean(voucher.used);
    const discount = `${voucher.percent}%`;
    const minOrder = voucher.minPriceToApply
      ? `Đơn hàng từ ${voucher.minPriceToApply.toLocaleString()}đ`
      : undefined;
    const expiryDate = new Date(voucher.endDate).toLocaleDateString("vi-VN");

    return (
      <Col xs={24} sm={12} lg={8} key={voucher.walletVoucherId}>
        <div style={{ position: "relative" }}>
          <Card
            hoverable={!isExpired && !isUsed}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "2px solid #f0f0f0",
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
                    {discount}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{minOrder}</div>
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
                {voucher.name}
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
                  {voucher.discountCodeId}
                </span>
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => handleCopyCode(voucher.discountCodeId)}
                  style={{ color: "#C92127" }}
                  disabled={isExpired || isUsed}
                >
                  Copy
                </Button>
              </div>

              {/* Expiry Date & Remaining Uses */}
              <div
                style={{
                  fontSize: 12,
                  color: "#999",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>HSD: {expiryDate}</span>
              </div>
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
                  zIndex: 10,
                }}
              >
                {isExpired ? "Hết hạn" : "Đã dùng"}
              </div>
            )}
          </Card>
        </div>
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
            count={getVouchersByStatus("AVAILABLE").length}
            style={{
              marginLeft: 8,
              backgroundColor: "#C92127",
            }}
          />
        </span>
      ),
      children: (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <Button onClick={handleRefresh} loading={refreshing} size="small">
              Làm mới
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {getVouchersByStatus("AVAILABLE").length > 0 ? (
              getVouchersByStatus("AVAILABLE").map((voucher) => (
                <React.Fragment key={voucher.walletVoucherId}>
                  {renderVoucherCard(voucher)}
                </React.Fragment>
              ))
            ) : (
              <Col span={24}>
                <Empty
                  description="Không có voucher khả dụng"
                  style={{ padding: "40px 0" }}
                />
              </Col>
            )}
          </Row>
        </>
      ),
    },
    {
      key: "used",
      label: (
        <span>
          Đã sử dụng
          <Badge
            count={getVouchersByStatus("USED").length}
            style={{
              marginLeft: 8,
              backgroundColor: "#C92127",
            }}
          />
        </span>
      ),
      children: (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <Button onClick={handleRefresh} loading={refreshing} size="small">
              Làm mới
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {getVouchersByStatus("USED").length > 0 ? (
              getVouchersByStatus("USED").map((voucher) => (
                <React.Fragment key={voucher.walletVoucherId}>
                  {renderVoucherCard(voucher)}
                </React.Fragment>
              ))
            ) : (
              <Col span={24}>
                <Empty
                  description="Chưa có voucher đã sử dụng"
                  style={{ padding: "40px 0" }}
                />
              </Col>
            )}
          </Row>
        </>
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
      variant="borderless"
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <Spin />
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginTop: -8 }}
        />
      )}
    </Card>
  );
};

export default VoucherPage;

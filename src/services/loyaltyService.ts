import { API_BASE } from "../config/api";
import type {
  ApplyVoucherResponse,
  AvailableVoucher,
  ExchangeableVoucher,
  ExchangeRewardRequest,
  ExchangeRewardResponse,
  LoyaltyInfo,
  WalletVoucherStats,
} from "../types/Loyalty";

const API_URL = `${API_BASE}`;

/**
 * Lấy thông tin loyalty của customer hiện tại
 */
export const fetchLoyaltyInfo = async (token: string): Promise<LoyaltyInfo> => {
  const response = await fetch(`${API_URL}/loyalty/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch loyalty info");
  }

  return response.json();
};

/**
 * Lấy danh sách voucher có thể đổi bằng điểm
 */
export const fetchExchangeableVouchers = async (
  token: string
): Promise<ExchangeableVoucher[]> => {
  try {
    const response = await fetch(`${API_URL}/rewards/exchangeable-vouchers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "fetchExchangeableVouchers response status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      throw new Error(
        `Failed to fetch exchangeable vouchers: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("fetchExchangeableVouchers success:", data);
    return data || [];
  } catch (error: any) {
    console.error("fetchExchangeableVouchers error:", error);
    throw error;
  }
};

/**
 * Đổi loyalty points lấy voucher
 */
export const exchangeVoucher = async (
  token: string,
  request: ExchangeRewardRequest
): Promise<ExchangeRewardResponse> => {
  try {
    const requestBody = {
      voucherId: request.voucherId,
      pointsToSpend: request.pointsToSpend,
    };

    console.log("=== EXCHANGE VOUCHER REQUEST ===");
    console.log("URL: /rewards/exchange");
    console.log("Token:", token ? "✓ Available" : "✗ Missing");
    console.log("Request Body:", requestBody);
    console.log("Body Type:", typeof requestBody);
    console.log("============================");

    const response = await fetch(`${API_URL}/rewards/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("=== EXCHANGE RESPONSE ===");
    console.log("Status:", response.status, response.statusText);
    console.log("Content-Type:", response.headers.get("content-type"));

    const responseText = await response.text();
    console.log("Response Body:", responseText);

    if (!response.ok) {
      console.error("❌ Exchange failed with status:", response.status);

      let errorMessage = "Failed to exchange voucher";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || responseText;
      } catch {
        errorMessage =
          responseText || `HTTP ${response.status}: ${response.statusText}`;
      }

      console.error("Error Message:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Exchange success:", data);
    console.log("=======================");
    return data;
  } catch (error: any) {
    console.error("❌ exchangeVoucher error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách voucher có thể áp dụng trong giỏ hàng
 */
export const fetchAvailableVouchers = async (
  token: string,
  cartTotal: number
): Promise<AvailableVoucher[]> => {
  const response = await fetch(
    `${API_URL}/discounts/available?cartTotal=${cartTotal}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available vouchers");
  }

  return response.json();
};

/**
 * Áp dụng voucher vào đơn hàng
 */
export const applyVoucher = async (
  token: string,
  voucherId: string,
  cartTotal: number
): Promise<ApplyVoucherResponse> => {
  const response = await fetch(
    `${API_URL}/discounts/apply?voucherId=${voucherId}&cartTotal=${cartTotal}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to apply voucher");
  }

  return response.json();
};

/**
 * Admin: Cộng điểm cho customer (chỉ cho testing)
 */
export const addLoyaltyPoints = async (
  token: string,
  customerId: string,
  points: number
): Promise<any> => {
  const response = await fetch(
    `${API_URL}/loyalty/add-points/${customerId}?points=${points}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add loyalty points");
  }

  return response.json();
};

/**
 * Lấy danh sách voucher trong ví của customer
 * Tạm thời dùng /api/discounts thay vì /api/wallet/vouchers (chưa implement)
 *
 * Bộ lọc:
 * - Lấy tất cả public discounts (isPublic=true)
 * - Chưa hết hạn (endDate > now)
 */
export const fetchWalletVouchers = async (token: string): Promise<any[]> => {
  try {
    const now = new Date();

    // Sử dụng endpoint filterDiscountCodes từ /api/discounts
    const response = await fetch(`${API_URL}/discounts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("fetchWalletVouchers response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      throw new Error(
        `Failed to fetch wallet vouchers: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("fetchWalletVouchers raw data:", data);

    // Transform DiscountCode to WalletVoucher format
    // Lấy tất cả vouchers (cả đã dùng), để component tự filter
    const walletVouchers = (data.data || data || [])
      .filter((discount: any) => {
        // Skip nếu không có dữ liệu cơ bản
        if (!discount.discountCodeId || !discount.name) {
          console.warn("⚠️ Skipping invalid discount:", discount);
          return false;
        }

        // Filter: Chỉ lấy chưa hết hạn
        const endDate = new Date(discount.endDate);
        const isExpired = endDate < now;

        if (isExpired) {
          console.log(`⏰ Discount expired: ${discount.discountCodeId}`);
          return false;
        }

        return true;
      })
      .map((discount: any) => {
        // Check nếu order list có dữ liệu (backend có @JsonIgnore nên luôn null/undefined)
        const hasOrders =
          discount.order &&
          Array.isArray(discount.order) &&
          discount.order.length > 0;
        const isUsed = discount.discountType === "ONE_TIME" && hasOrders;

        if (isUsed) {
          console.log(
            `🔴 ONE_TIME discount already used: ${discount.discountCodeId}`
          );
        } else if (discount.discountType === "ONE_TIME") {
          console.log(
            `✅ ONE_TIME discount available: ${discount.discountCodeId}`
          );
        }

        return {
          walletVoucherId: discount.discountCodeId,
          discountCodeId: discount.discountCodeId,
          name: discount.name,
          percent: discount.percent,
          minPriceToApply: discount.minPriceToApply || 0,
          description: discount.description || "",
          expiryDate: discount.endDate,
          createdDate: new Date().toISOString(),
          used: isUsed,
          source: discount.isPublic ? "PUBLIC" : "EXCLUSIVE",
        };
      });

    console.log(
      `📊 Total vouchers fetched: ${walletVouchers.length}`,
      walletVouchers
    );
    return walletVouchers;
  } catch (error: any) {
    console.error("fetchWalletVouchers error:", error);
    throw error;
  }
};

/**
 * Lấy thống kê voucher trong ví
 * Tạm thời fallback: compute từ danh sách discount codes
 */
export const fetchWalletVoucherStats = async (
  token: string
): Promise<WalletVoucherStats> => {
  try {
    // Thử gọi API stats trước
    try {
      const response = await fetch(`${API_URL}/wallet/vouchers/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      // Fallback nếu endpoint không tồn tại
    }

    // Fallback: Lấy từ discount list và compute stats
    const vouchers = await fetchWalletVouchers(token);
    const now = new Date();
    const expiringDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    const stats: WalletVoucherStats = {
      totalVouchers: vouchers.length,
      availableVouchers: vouchers.filter(
        (v) => !v.used && new Date(v.endDate) > now && v.remainingUses > 0
      ).length,
      usedVouchers: vouchers.filter((v) => v.used).length,
      exchangedVouchers: vouchers.filter((v) => v.source === "EXCHANGE").length,
      publicVouchers: vouchers.filter((v) => v.source === "PUBLIC").length,
      expiringCount: vouchers.filter(
        (v) =>
          !v.used &&
          new Date(v.endDate) > now &&
          new Date(v.endDate) < expiringDate &&
          v.remainingUses > 0
      ).length,
    };

    return stats;
  } catch (error: any) {
    console.error("fetchWalletVoucherStats error:", error);
    // Return default stats nếu lỗi
    return {
      totalVouchers: 0,
      availableVouchers: 0,
      usedVouchers: 0,
      exchangedVouchers: 0,
      publicVouchers: 0,
      expiringCount: 0,
    };
  }
};

/**
 * Sử dụng voucher từ ví
 */
export const useWalletVoucher = async (
  token: string,
  walletVoucherId: string,
  orderId: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/wallet/vouchers/use`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ walletVoucherId, orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to use voucher");
    }

    return response.json();
  } catch (error: any) {
    console.error("useWalletVoucher error:", error);
    throw error;
  }
};

/**
 * Áp dụng discount code (mã giảm giá văn bản)
 * Endpoint: POST /api/discounts/apply-code
 */
export const applyDiscountCode = async (
  token: string,
  discountCode: string,
  cartTotal: number
): Promise<ApplyVoucherResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/discounts/apply-code?code=${encodeURIComponent(
        discountCode
      )}&cartTotal=${cartTotal}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error ||
          `Mã giảm giá không hợp lệ: ${error.message || response.statusText}`
      );
    }

    return response.json();
  } catch (error: any) {
    console.error("applyDiscountCode error:", error);
    throw error;
  }
};

/**
 * Xóa voucher từ ví (xóa expired voucher)
 */
export const deleteWalletVoucher = async (
  token: string,
  walletVoucherId: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_URL}/wallet/vouchers/${walletVoucherId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete wallet voucher");
    }

    return response.json();
  } catch (error: any) {
    console.error("deleteWalletVoucher error:", error);
    throw error;
  }
};

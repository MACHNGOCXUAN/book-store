/**
 * Loyalty & Voucher Types
 */

// ========== Enums & Constants ==========

export const CustomerTierEnum = {
  NEW_USER: "NEW_USER",
  REGULAR: "REGULAR",
  VIP: "VIP",
  DIAMOND: "DIAMOND",
} as const;

export type CustomerTier =
  (typeof CustomerTierEnum)[keyof typeof CustomerTierEnum];

// ========== DTO Interfaces ==========

/**
 * Loyalty Info DTO - Response từ GET /api/loyalty/info
 */
export interface LoyaltyInfo {
  currentPoints: number;
  currentTier: CustomerTier;
  pointsToNextTier: number;
  tierName: string;
  tierDescription: string;
}

/**
 * Exchangeable Voucher DTO
 * Response từ GET /api/rewards/exchangeable-vouchers
 */
export interface ExchangeableVoucher {
  voucherId: string;
  voucherName: string;
  description: string;
  discountPercent: number;
  minPriceToApply: number;
  redeemCost: number;
  minTierRequired: string | null;
  isExchangeable: boolean;
  lockReason?: string;
  remainingPoints?: number;
}

/**
 * DiscountCode DTO từ Backend
 * Response từ GET /api/discounts
 */
export interface DiscountCode {
  discountCodeId: string;
  name: string;
  percent: number;
  startDate: string | Date;
  endDate: string | Date;
  description: string;
  quantity: number;
  minPriceToApply: number;
  discountType: "ONE_TIME" | "MANY_TIME";
  maxQuantityCanUse: number;

  // Loyalty + Tier System
  isPublic: boolean;
  redeemable: boolean;
  redeemCost?: number | null;
  minTierRequired?: CustomerTier;
}

/**
 * Exchange Reward Request DTO
 * Body cho POST /api/rewards/exchange
 */
export interface ExchangeRewardRequest {
  voucherId: string;
  pointsToSpend: number;
}

/**
 * Exchange Reward Response DTO
 * Response từ POST /api/rewards/exchange
 */
export interface ExchangeRewardResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Available Voucher DTO
 * Response từ GET /api/discounts/available
 */
export interface AvailableVoucher {
  voucherId: string;
  voucherName: string;
  discountPercent: number;
  minPriceToApply: number;
  description: string;
  isPublic: boolean;
  isFromWallet: boolean;
  isExclusive: boolean;
  voucherTag?: string;
  applicable: boolean;
}

/**
 * Apply Voucher Response DTO
 */
export interface ApplyVoucherResponse {
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

/**
 * Wallet Voucher DTO - Customer's vouchers
 * Combining backend DiscountCode + usage status
 */
export interface WalletVoucher {
  walletVoucherId: string;
  discountCodeId: string; // PK của DiscountCode
  name: string;
  percent: number;
  minPriceToApply: number;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  createdDate: string | Date;
  remainingUses: number; // Lượt dùng còn lại
  used: boolean; // true nếu đã dùng hết (remainingUses = 0)

  // Loyalty + Tier System
  isPublic: boolean;
  redeemable: boolean;
  redeemCost?: number | null;
  minTierRequired?: CustomerTier;
  discountType: "ONE_TIME" | "MANY_TIME";
  maxQuantityCanUse: number;
}

/**
 * Wallet Voucher Stats DTO
 */
export interface WalletVoucherStats {
  totalVouchers: number;
  availableVouchers: number;
  usedVouchers: number;
  exchangedVouchers: number;
  publicVouchers: number;
  expiringCount: number;
}

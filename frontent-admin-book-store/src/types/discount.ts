// src/types/discount.ts

/**
 * Discount/Voucher response type for admin
 * Maps to backend DiscountCodeDTO and related responses
 */
export interface DiscountCode {
  id: string;
  code: string;
  name: string;
  description: string;
  discountPercent: number;
  minPrice: number;
  maxDiscount: number;
  quantity: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  redeemable: boolean;
  redeemCost?: number;
  minTierRequired?: "NEW_USER" | "REGULAR" | "VIP" | "DIAMOND";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/editing discount codes
 */
export interface DiscountFormData {
  name: string;
  description: string;
  discountPercent: number;
  minPrice: number;
  maxDiscount: number;
  quantity: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  redeemable: boolean;
  redeemCost: number;
  minTierRequired?: "NEW_USER" | "REGULAR" | "VIP" | "DIAMOND";
}

/**
 * Discount statistics for dashboard
 */
export interface DiscountStatistics {
  totalIssued: number;
  totalUsed: number;
  usageRate: number;
  estimatedSavings: number;
}

/**
 * Customer tier enum
 */
export enum CustomerTier {
  NEW_USER = "NEW_USER",
  REGULAR = "REGULAR",
  VIP = "VIP",
  DIAMOND = "DIAMOND",
}

/**
 * Discount type indicators
 */
export interface DiscountType {
  isPublic: boolean;
  redeemable: boolean;
  minTierRequired?: CustomerTier;
  type: "public" | "redeemable" | "tier-exclusive";
}

/**
 * Pagination and list response
 */
export interface DiscountListResponse {
  content: DiscountCode[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Filter options for discount list
 */
export interface DiscountFilters {
  status?: "active" | "expired" | "all";
  type?: "public" | "redeemable" | "tier-exclusive";
  sortBy?: "name" | "discount" | "createdAt" | "usageRate";
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
}

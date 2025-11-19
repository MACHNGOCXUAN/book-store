// src/services/discountService.ts

import { API_URL } from "@/config";

export interface CreateDiscountRequest {
  name: string;
  description: string;
  discountPercent: number;
  minPrice?: number;
  maxDiscount?: number;
  quantity: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  redeemable: boolean;
  redeemCost?: number;
  minTierRequired?: string;
}

export interface UpdateDiscountRequest extends CreateDiscountRequest {
  id: string;
}

export interface DiscountResponse {
  id: string;
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
  minTierRequired?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all discount codes with pagination and filtering
 * GET /api/discounts?page=0&size=10&status=active
 */
export const getDiscounts = async (
  token: string,
  page: number = 0,
  size: number = 10,
  status?: "active" | "expired" | "all"
): Promise<{ content: DiscountResponse[]; totalElements: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (status && status !== "all") {
    params.append("status", status);
  }

  const response = await fetch(`${API_URL}/admin/discounts?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Lỗi khi tải danh sách mã giảm giá (${response.status})`
    );
  }

  return response.json();
};

/**
 * Get single discount by ID
 * GET /api/discounts/{id}
 */
export const getDiscountById = async (
  token: string,
  id: string
): Promise<DiscountResponse> => {
  const response = await fetch(`${API_URL}/admin/discounts/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Không thể tải mã giảm giá (${response.status})`);
  }

  return response.json();
};

/**
 * Create new discount code
 * POST /api/admin/discounts
 */
export const createDiscount = async (
  token: string,
  request: CreateDiscountRequest
): Promise<DiscountResponse> => {
  const response = await fetch(`${API_URL}/admin/discounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Lỗi khi tạo mã giảm giá (${response.status})`
    );
  }

  return response.json();
};

/**
 * Update existing discount code
 * PUT /api/admin/discounts/{id}
 */
export const updateDiscount = async (
  token: string,
  id: string,
  request: CreateDiscountRequest
): Promise<DiscountResponse> => {
  const response = await fetch(`${API_URL}/admin/discounts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Lỗi khi cập nhật mã giảm giá (${response.status})`
    );
  }

  return response.json();
};

/**
 * Delete discount code
 * DELETE /api/admin/discounts/{id}
 */
export const deleteDiscount = async (
  token: string,
  id: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/discounts/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi xóa mã giảm giá (${response.status})`);
  }
};

/**
 * Get discount usage statistics
 * GET /api/admin/discounts/{id}/statistics
 */
export const getDiscountStatistics = async (
  token: string,
  id: string
): Promise<{
  totalIssued: number;
  totalUsed: number;
  usageRate: number;
  estimatedSavings: number;
}> => {
  const response = await fetch(`${API_URL}/admin/discounts/${id}/statistics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi tải thống kê (${response.status})`);
  }

  return response.json();
};

/**
 * Duplicate discount code
 * POST /api/admin/discounts/{id}/duplicate
 */
export const duplicateDiscount = async (
  token: string,
  id: string
): Promise<DiscountResponse> => {
  const response = await fetch(`${API_URL}/admin/discounts/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi sao chép mã giảm giá (${response.status})`);
  }

  return response.json();
};

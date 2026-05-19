// src/components/loyalty/VoucherCard.tsx

import React from "react";
import { AvailableVoucher } from "@/types/loyalty";

interface VoucherCardProps {
  voucher: AvailableVoucher;
  onSelect?: (voucherId: string) => void;
  isSelected?: boolean;
  showLockStatus?: boolean;
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onSelect,
  isSelected = false,
  showLockStatus = true,
}) => {
  const getTagColor = (tag: string) => {
    if (tag.includes("⭐")) return "bg-blue-100 text-blue-700";
    if (tag.includes("💎")) return "bg-yellow-100 text-yellow-700";
    if (tag.includes("🎉")) return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  const isLocked = !voucher.applicable;

  return (
    <div
      onClick={() => !isLocked && onSelect?.(voucher.voucherId)}
      className={`rounded-lg border-2 p-4 transition-all cursor-pointer ${
        isLocked
          ? "border-gray-300 bg-gray-50 opacity-60"
          : isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
      }`}
    >
      {/* Header with Discount */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            {voucher.voucherName}
          </h3>
          <p className="text-2xl font-bold text-red-500">
            {voucher.discountPercent}%
            <span className="text-sm text-gray-600 ml-1">OFF</span>
          </p>
        </div>
        {voucher.voucherTag && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${getTagColor(
              voucher.voucherTag
            )}`}
          >
            {voucher.voucherTag}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{voucher.description}</p>

      {/* Min Price Requirement */}
      {voucher.minPriceToApply > 0 && (
        <div className="flex items-center gap-2 text-sm mb-3 text-gray-700">
          <span>📦</span>
          <span>
            Đơn tối thiểu{" "}
            <strong>{voucher.minPriceToApply.toLocaleString("vi-VN")}₫</strong>
          </span>
        </div>
      )}

      {/* Lock Status */}
      {showLockStatus && isLocked && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
          <p className="text-xs text-red-600 font-medium">🔒 Không khả dụng</p>
          {voucher.description && (
            <p className="text-xs text-red-500 mt-1">{voucher.description}</p>
          )}
        </div>
      )}

      {/* Action Button / Selected Indicator */}
      {!isLocked && (
        <button
          className={`w-full py-2 rounded font-medium transition-all text-sm ${
            isSelected
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(voucher.voucherId);
          }}
        >
          {isSelected ? "✓ Đã chọn" : "Chọn voucher"}
        </button>
      )}
      {isLocked && (
        <button className="w-full py-2 rounded font-medium text-sm bg-gray-200 text-gray-500 cursor-not-allowed">
          Không khả dụng
        </button>
      )}
    </div>
  );
};

export default VoucherCard;

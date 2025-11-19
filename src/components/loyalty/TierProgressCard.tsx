// src/components/loyalty/TierProgressCard.tsx

import React from "react";
import { CustomerTier } from "../../types/loyalty";

interface TierProgressCardProps {
  currentTier: CustomerTier;
  currentPoints: number;
  pointsToNextTier: number;
}

const TierProgressCard: React.FC<TierProgressCardProps> = ({
  currentTier,
  currentPoints,
  pointsToNextTier,
}) => {
  const tierConfig = {
    NEW_USER: {
      name: "Người mới",
      color: "bg-gray-100",
      badgeColor: "text-gray-600",
      icon: "🌟",
      benefits: ["Mua sắm thoải mái", "Được tích điểm cơ bản"],
    },
    REGULAR: {
      name: "Thường xuyên",
      color: "bg-blue-100",
      badgeColor: "text-blue-600",
      icon: "💙",
      benefits: ["Tích điểm nhanh hơn", "Nhận voucher độc quyền"],
    },
    VIP: {
      name: "VIP",
      color: "bg-purple-100",
      badgeColor: "text-purple-600",
      icon: "👑",
      benefits: ["Ưu đãi cao cấp", "Hỗ trợ ưu tiên", "Giảm giá đặc biệt"],
    },
    DIAMOND: {
      name: "Diamond",
      color: "bg-yellow-100",
      badgeColor: "text-yellow-600",
      icon: "💎",
      benefits: ["Lợi ích tối cao", "Quà tặng độc quyền", "Dịch vụ VIP 24/7"],
    },
  };

  const config = tierConfig[currentTier];
  const progressPercentage = Math.min(
    (currentPoints / (currentPoints + pointsToNextTier)) * 100,
    100
  );

  const getTierThreshold = (
    tier: CustomerTier
  ): { min: number; max: number } => {
    switch (tier) {
      case "NEW_USER":
        return { min: 0, max: 99 };
      case "REGULAR":
        return { min: 100, max: 499 };
      case "VIP":
        return { min: 500, max: 1999 };
      case "DIAMOND":
        return { min: 2000, max: 999999 };
    }
  };

  const threshold = getTierThreshold(currentTier);

  return (
    <div className={`rounded-lg p-6 shadow-md ${config.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className={`text-xl font-bold ${config.badgeColor}`}>
              {config.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentPoints} / {threshold.max}+ điểm
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tiến độ nâng cấp
          </span>
          <span className="text-sm font-medium text-gray-700">
            {pointsToNextTier > 0
              ? `${pointsToNextTier} điểm nữa`
              : "Đã đạt cấp tối đa"}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentTier === "NEW_USER"
                ? "bg-blue-500"
                : currentTier === "REGULAR"
                ? "bg-purple-500"
                : currentTier === "VIP"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Benefits */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
          Lợi ích tiers:
        </p>
        <ul className="space-y-1">
          {config.benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="text-green-600">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TierProgressCard;

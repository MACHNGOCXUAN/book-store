// src/components/cart/VoucherSelector.tsx

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadAvailableVouchers,
  setAppliedVoucher,
} from "@/features/loyalty/loyaltySlice";
import { applyDiscount, clearDiscount } from "@/features/cart/discountSlice";
import VoucherCard from "@/components/loyalty/VoucherCard";

interface VoucherSelectorProps {
  cartTotal: number;
  onVoucherApplied?: (discountAmount: number) => void;
}

const VoucherSelector: React.FC<VoucherSelectorProps> = ({
  cartTotal,
  onVoucherApplied,
}) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null
  );

  const { availableVouchers, loading } = useAppSelector(
    (state) => state.loyalty
  );
  const { appliedVoucher, discountAmount, isApplying, error } = useAppSelector(
    (state) => state.discount
  );

  const token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    if (token && isModalOpen) {
      dispatch(loadAvailableVouchers({ token, cartTotal }));
    }
  }, [dispatch, token, isModalOpen, cartTotal]);

  const handleApplyVoucher = async () => {
    if (!selectedVoucherId || !token) return;

    dispatch(
      applyDiscount({ token, voucherId: selectedVoucherId, cartTotal })
    ).then(() => {
      setIsModalOpen(false);
      onVoucherApplied?.(discountAmount);
    });
  };

  const handleRemoveVoucher = () => {
    dispatch(clearDiscount());
    dispatch(setAppliedVoucher(null));
    setSelectedVoucherId(null);
  };

  return (
    <div>
      {/* Display Applied Voucher */}
      {appliedVoucher ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-green-700">✓ Voucher đã áp dụng</h4>
              <p className="text-sm text-green-600 mt-1">
                {appliedVoucher?.voucherName} - Giảm{" "}
                <strong>{discountAmount?.toLocaleString("vi-VN")}₫</strong>
              </p>
            </div>
            <button
              onClick={handleRemoveVoucher}
              className="text-green-700 font-bold hover:text-green-900 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-all mb-4 flex items-center justify-center gap-2"
        >
          <span>🎟️</span>
          Chọn mã giảm giá
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Chọn mã giảm giá
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : availableVouchers.length > 0 ? (
                <div className="space-y-3">
                  {availableVouchers.map((voucher) => (
                    <div
                      key={voucher.voucherId}
                      onClick={() =>
                        voucher.applicable &&
                        setSelectedVoucherId(voucher.voucherId)
                      }
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        !voucher.applicable
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : selectedVoucherId === voucher.voucherId
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">
                            {voucher.voucherName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {voucher.description}
                          </p>
                          {voucher.minPriceToApply > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Đơn tối thiểu:{" "}
                              {voucher.minPriceToApply.toLocaleString("vi-VN")}₫
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-2xl font-bold text-red-500">
                            {voucher.discountPercent}%
                          </span>
                          {selectedVoucherId === voucher.voucherId && (
                            <div className="text-blue-600 font-bold text-sm mt-1">
                              ✓ Được chọn
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  Không có mã giảm giá nào khả dụng cho đơn hàng này
                </p>
              )}

              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyVoucher}
                disabled={!selectedVoucherId || isApplying}
                className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-all ${
                  selectedVoucherId && !isApplying
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isApplying ? "Đang xử lý..." : "Áp dụng voucher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;

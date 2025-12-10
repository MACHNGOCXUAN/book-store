"use client";
import { useMyNotification } from "@/hooks/notification";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  createDiscount,
  getDiscountsFilter,
  resetDiscount,
  resetMessage,
  updateDiscount,
} from "@/stores/slices/discount.slice";
import {
  discountNameValidationRules,
  discountPercentValidationRules,
  discountQuantityValidationRules,
  minPriceValidationRules,
} from "@/utils/validation";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect } from "react";

const { Option } = Select;
const { TextArea } = Input;

// Bạn nên chuyển interface này ra file /types
interface DiscountDataType {
  discountCodeId?: string;
  name: string;
  percent: number;
  startDate: any; // Dayjs object khi sử dụng DatePicker
  endDate: any;
  description: string;
  quantity: number;
  minPriceToApply: number;
  discountType: "ONE_TIME" | "MANY_TIME";
  maxQuantityCanUse: number;
  isPublic: boolean;
  redeemable: boolean;
  redeemCost?: number | null;
  minTierRequired?: "NEW_USER" | "REGULAR" | "VIP" | "DIAMOND" | null;
}

const ModalAddDiscount = ({ isModalOpen, setIsModalOpen }: any) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<DiscountDataType>();
  const [isPublic, setIsPublic] = React.useState(true);
  const [redeemable, setRedeemable] = React.useState(false);
  const [discountType, setDiscountType] = React.useState<
    "ONE_TIME" | "MANY_TIME"
  >("ONE_TIME");
  const { loading, message, discount } = useAppSelector(
    (state) => state.discount
  );
  const { openNotification, contextHolder } = useMyNotification();

  // GỌI API KHI SUBMIT
  const onFinish = (values: DiscountDataType) => {
    let payload: any = {
      ...values,
      // Chuyển đổi ngày về String ISO
      startDate: dayjs(values.startDate).toISOString(),
      endDate: dayjs(values.endDate).toISOString(),
      // Ensure boolean values are correct
      isPublic: values.isPublic === true,
      redeemable: values.redeemable === true,
      redeemCost: values.redeemable ? values.redeemCost : null,
      minTierRequired:
        values.minTierRequired === null ? null : values.minTierRequired,
    };

    // Xử lý quantity và maxQuantityCanUse dựa trên discountType
    if (values.discountType === "ONE_TIME" && isPublic) {
      // ONE_TIME + Public: gửi quantity, set maxQuantityCanUse = 1
      payload.quantity = values.quantity;
      payload.maxQuantityCanUse = 1;
    } else if (values.discountType === "ONE_TIME" && !isPublic) {
      // ONE_TIME + Private: gửi cả quantity và maxQuantityCanUse
      payload.quantity = values.quantity;
      payload.maxQuantityCanUse = values.maxQuantityCanUse;
    } else if (values.discountType === "MANY_TIME") {
      // MANY_TIME: gửi cả quantity và maxQuantityCanUse
      payload.quantity = values.quantity;
      payload.maxQuantityCanUse = values.maxQuantityCanUse;
    }

    if (discount?.discountCodeId) {
      // Logic Cập nhật
      dispatch(
        updateDiscount({
          id: discount.discountCodeId,
          data: payload,
        })
      );
    } else {
      // Logic Tạo mới
      dispatch(createDiscount(payload));
    }
  };

  // XỬ LÝ THAY ĐỔI "CÓ THỂ ĐỔI BẰNG ĐIỂM?"
  const handleRedeemableChange = (value: boolean) => {
    setRedeemable(value);
    // Xóa giá trị nếu chọn "Không"
    if (!value) {
      form.setFieldValue("redeemCost", undefined);
      form.setFieldValue("minTierRequired", null);
    } else {
      // Khi chuyển sang redeemable, đảm bảo isPublic=false
      form.setFieldValue("isPublic", false);
      setIsPublic(false);
    }
  };

  // XỬ LÝ KHI THAY ĐỔI LOẠI VOUCHER (PUBLIC/PRIVATE)
  const handleIsPublicChange = (value: boolean) => {
    setIsPublic(value);
    if (value) {
      // Public: không thể redeemable, xóa maxQuantityCanUse vì sẽ mặc định = 1
      setRedeemable(false);
      form.setFieldValue("redeemable", false);
      form.setFieldValue("redeemCost", undefined);
      form.setFieldValue("minTierRequired", null);
      form.setFieldValue("maxQuantityCanUse", undefined);
    } else {
      // Private: thêm giá trị mặc định cho maxQuantityCanUse nếu chưa có
      if (!form.getFieldValue("maxQuantityCanUse")) {
        form.setFieldValue("maxQuantityCanUse", 1);
      }
    }
  };

  // NÚT HỦY
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setIsPublic(true);
    setRedeemable(false);
    dispatch(resetDiscount()); // Reset discount state khi đóng modal
  };

  // XỬ LÝ KHI THÊM/SỬA THÀNH CÔNG
  useEffect(() => {
    if (message && message?.type === "success") {
      // Hiển thị thông báo thành công
      if (discount?.discountCodeId) {
        openNotification(
          "success",
          "Cập nhật thành công",
          "Mã giảm giá đã được cập nhật thành công"
        );
      } else {
        openNotification(
          "success",
          "Thêm thành công",
          "Mã giảm giá mới đã được tạo thành công"
        );
      }

      dispatch(getDiscountsFilter({})); // Load lại table
      setIsModalOpen(false); // Đóng modal
      form.resetFields();
      dispatch(resetDiscount()); // Reset discount state để form trống khi mở lần tiếp theo
    }
    // Chỉ reset message khi có message (tránh việc modal khác reset)
    if (message) {
      dispatch(resetMessage());
    }
  }, [
    dispatch,
    message,
    setIsModalOpen,
    openNotification,
    discount?.discountCodeId,
  ]);

  // ĐIỀN DỮ LIỆU KHI MỞ MODAL (SỬA)
  useEffect(() => {
    if (isModalOpen) {
      if (discount) {
        // Chế độ Sửa: điền đầy đủ data
        const isPublicValue = discount.isPublic !== false;
        const redeemableValue = discount.redeemable === true;

        setIsPublic(isPublicValue);
        setRedeemable(redeemableValue);
        setDiscountType(discount.discountType || "ONE_TIME");

        form.setFieldsValue({
          ...discount,
          startDate: dayjs(discount.startDate),
          endDate: dayjs(discount.endDate),
          isPublic: isPublicValue,
          redeemable: redeemableValue,
          redeemCost: discount.redeemCost || undefined,
          minTierRequired: discount.minTierRequired || null,
        });
      } else {
        // Chế độ Thêm: dọn form
        form.resetFields();
        setIsPublic(true);
        setRedeemable(false);
        setDiscountType("ONE_TIME");
        // Set default values for new discount
        form.setFieldsValue({
          isPublic: true,
          redeemable: false,
          discountType: "ONE_TIME",
        });
      }
    }
  }, [discount, form, isModalOpen]);

  return (
    <Modal
      title={
        <h3 className="font-semibold text-lg">
          {discount ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá mới"}
        </h3>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={900}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 10 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên mã"
              name="name"
              rules={discountNameValidationRules}
            >
              <Input placeholder="Nhập tên mã (ví dụ: SALE10)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Loại giảm giá"
              name="discountType"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select
                placeholder="Chọn loại giảm giá"
                onChange={(value) => setDiscountType(value)}
              >
                <Option value="ONE_TIME">Một lần</Option>
                <Option value="MANY_TIME">Nhiều lần</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Giá trị giảm (%)"
              name="percent"
              rules={discountPercentValidationRules}
            >
              <InputNumber
                min={1}
                max={100}
                placeholder="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={discountQuantityValidationRules}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* Hiển thị maxQuantityCanUse chỉ khi không phải ONE_TIME + Public */}
            {!(discountType === "ONE_TIME" && isPublic) ? (
              <Form.Item
                label="Lượt dùng tối đa/khách"
                name="maxQuantityCanUse"
                rules={[{ required: true, message: "Bắt buộc" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            ) : null}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Giá tối thiểu để áp dụng (VNĐ)"
              name="minPriceToApply"
              rules={minPriceValidationRules}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={
                  ((value: string | undefined) =>
                    value ? value.replace(/\$\s?|(,*)/g, "") : "") as any
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ngày bắt đầu"
              name="startDate"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc"
              name="endDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue("startDate")) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue("startDate"))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Ngày kết thúc phải sau ngày bắt đầu")
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Mô tả" name="description">
              <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
            </Form.Item>
          </Col>
        </Row>

        {/* ========== LOYALTY + TIER SYSTEM FIELDS ========== */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h4 className="font-semibold text-base mb-4">
            Cấu hình Phân Phối & Trao Đổi
          </h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại Voucher"
                name="isPublic"
                rules={[{ required: true, message: "Vui lòng chọn" }]}
              >
                <Select
                  placeholder="Chọn loại voucher"
                  onChange={handleIsPublicChange}
                >
                  <Option value={true}>🎁 Công khai (Tất cả khách hàng)</Option>
                  <Option value={false}>🔒 Riêng tư (Cấp phát cá nhân)</Option>
                </Select>
              </Form.Item>
            </Col>

            {!isPublic && (
              <Col span={12}>
                <Form.Item
                  label="Có thể đổi bằng Loyalty Points?"
                  name="redeemable"
                >
                  <Select placeholder="Chọn" onChange={handleRedeemableChange}>
                    <Option value={false}>
                      ❌ Không - Voucher cá nhân thường
                    </Option>
                    <Option value={true}>
                      💳 Có - Trao đổi bằng Loyalty Points
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          {!isPublic && redeemable && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Chi phí đổi (Loyalty Points)"
                  name="redeemCost"
                  rules={[
                    {
                      required: redeemable,
                      message: "Vui lòng nhập chi phí đổi",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    placeholder="Nhập số điểm"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tier tối thiểu để đổi"
                  name="minTierRequired"
                  rules={[{ required: false }]}
                >
                  <Select placeholder="Chọn tier (không bắt buộc)" allowClear>
                    <Option value={null}>Không ràng buộc</Option>
                    <Option value="NEW_USER">
                      🆕 NEW_USER - Người dùng mới
                    </Option>
                    <Option value="REGULAR">
                      ⭐ REGULAR - Thành viên thường
                    </Option>
                    <Option value="VIP">✨ VIP - Thành viên VIP</Option>
                    <Option value="DIAMOND">
                      💎 DIAMOND - Thành viên Diamond
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {!isPublic && !redeemable && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tier tối thiểu yêu cầu"
                  name="minTierRequired"
                  rules={[{ required: false }]}
                >
                  <Select placeholder="Chọn tier (không bắt buộc)" allowClear>
                    <Option value={null}>Không ràng buộc</Option>
                    <Option value="NEW_USER">
                      🆕 NEW_USER - Người dùng mới
                    </Option>
                    <Option value="REGULAR">
                      ⭐ REGULAR - Thành viên thường
                    </Option>
                    <Option value="VIP">✨ VIP - Thành viên VIP</Option>
                    <Option value="DIAMOND">
                      💎 DIAMOND - Thành viên Diamond
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Hướng dẫn cho admin */}
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-sm">
            <p className="font-semibold text-blue-900 mb-2">📌 Hướng dẫn:</p>
            {isPublic && (
              <ul className="list-disc list-inside text-blue-800">
                <li>
                  ✅ Tạo mã công khai cho <strong>tất cả khách hàng</strong>
                </li>
                <li>
                  📊 Nhập <strong>Số lượng</strong> = tổng lượt dùng cho tất cả
                  khách
                </li>
                <li>
                  🔄 Mỗi khách được dùng tối đa{" "}
                  <strong>Lượt dùng tối đa</strong> lần
                </li>
              </ul>
            )}
            {!isPublic && !redeemable && (
              <ul className="list-disc list-inside text-blue-800">
                <li>
                  ✅ Cấp phát <strong>tự động</strong> cho khách hàng phù hợp
                  Tier
                </li>
                <li>
                  📊 Mỗi khách nhận <strong>Lượt dùng tối đa</strong> lần dùng
                </li>
                <li>🔄 Hệ thống sẽ tạo wallet cho từng khách</li>
              </ul>
            )}
            {!isPublic && redeemable && (
              <ul className="list-disc list-inside text-blue-800">
                <li>❌ KHÔNG cấp phát tự động</li>
                <li>💳 Khách tự trao đổi bằng Loyalty Points</li>
                <li>
                  📊 Chi phí: {form.getFieldValue("redeemCost") || "---"} điểm
                </li>
                <li>
                  🔄 Sau đổi, khách được <strong>Lượt dùng tối đa</strong> lần
                  dùng
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {discount ? "Cập nhật" : "Lưu mã"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalAddDiscount;

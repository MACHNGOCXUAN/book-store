"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  DatePicker,
  InputNumber,
} from "antd";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  createDiscount,
  getDiscountsFilter,
  resetMessage,
  resetDiscount,
  updateDiscount,
} from "@/stores/slices/discount.slice";
import dayjs from "dayjs"; // Cần cài 'dayjs'

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
  maxQuantityCanUse?: number;
  isPublic?: boolean;
  redeemable?: boolean;
  redeemCost?: number | null;
  minTierRequired?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | null;
}

const ModalAddDiscount = ({ isModalOpen, setIsModalOpen }: any) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<DiscountDataType>();
  const [redeemable, setRedeemable] = React.useState(false);
  const { loading, message, discount } = useAppSelector(
    (state) => state.discount
  );

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
      // Luôn set maxQuantityCanUse = quantity (cho cả create và update)
      maxQuantityCanUse: values.quantity,
    };

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
    }
  };

  // NÚT HỦY
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setRedeemable(false);
    dispatch(resetDiscount()); // Reset discount state khi đóng modal
  };

  // XỬ LÝ KHI THÊM/SỬA THÀNH CÔNG
  useEffect(() => {
    if (message && message?.type === "success") {
      dispatch(getDiscountsFilter({})); // Load lại table
      setIsModalOpen(false); // Đóng modal
      form.resetFields();
      dispatch(resetDiscount()); // Reset discount state để form trống khi mở lần tiếp theo
    }
    // Chỉ reset message khi có message (tránh việc modal khác reset)
    if (message) {
      dispatch(resetMessage());
    }
  }, [dispatch, message, setIsModalOpen]);

  // ĐIỀN DỮ LIỆU KHI MỞ MODAL (SỬA)
  useEffect(() => {
    if (isModalOpen) {
      if (discount) {
        // Chế độ Sửa: điền đầy đủ data
        form.setFieldsValue({
          ...discount,
          startDate: dayjs(discount.startDate),
          endDate: dayjs(discount.endDate),
          isPublic: discount.isPublic !== false,
          redeemable: discount.redeemable === true,
          redeemCost: discount.redeemCost || undefined,
          minTierRequired: discount.minTierRequired || null,
        });
        setRedeemable(discount.redeemable === true);
      } else {
        // Chế độ Thêm: dọn form
        form.resetFields();
        setRedeemable(false);
        // Set default values for new discount
        form.setFieldsValue({
          isPublic: true,
          redeemable: false,
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
              rules={[{ required: true, message: "Vui lòng nhập tên mã" }]}
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
              <Select placeholder="Chọn loại giảm giá">
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
              rules={[{ required: true, message: "Vui lòng nhập" }]}
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
              rules={[{ required: true, message: "Vui lòng nhập" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Giá tối thiểu để áp dụng (VNĐ)"
              name="minPriceToApply"
              rules={[{ required: true, message: "Vui lòng nhập" }]}
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
            Cấu hình Loyalty & Tier
          </h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại voucher"
                name="isPublic"
                rules={[{ required: true, message: "Vui lòng chọn" }]}
              >
                <Select placeholder="Chọn loại voucher">
                  <Option value={true}>Công khai (Tất cả khách hàng)</Option>
                  <Option value={false}>Riêng tư (Cấp phát cá nhân)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Có thể đổi bằng điểm?" name="redeemable">
                <Select placeholder="Chọn" onChange={handleRedeemableChange}>
                  <Option value={true}>
                    Có - Có thể đổi bằng loyaltyPoints
                  </Option>
                  <Option value={false}>Không - Chỉ là voucher thường</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              {redeemable && (
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
              )}
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tier tối thiểu yêu cầu"
                name="minTierRequired"
                rules={[{ required: false }]}
              >
                <Select placeholder="Chọn tier (không bắt buộc)" allowClear>
                  <Option value={null}>Không ràng buộc</Option>
                  <Option value="NEW_USER">NEW_USER - Người dùng mới</Option>
                  <Option value="REGULAR">REGULAR - Thành viên thường</Option>
                  <Option value="VIP">VIP - Thành viên VIP</Option>
                  <Option value="DIAMOND">DIAMOND - Thành viên Diamond</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
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

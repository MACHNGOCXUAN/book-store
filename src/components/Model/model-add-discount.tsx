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
  updateDiscount,
} from "@/stores/slices/discount.slice";
import dayjs from "dayjs"; // Cần cài 'dayjs'

const { Option } = Select;
const { TextArea } = Input;

// Bạn nên chuyển interface này ra file /types
interface DiscountDataType {
  discountCodeId: string;
  name: string;
  percent: number;
  startDate: string;
  endDate: string;
  description: string;
  quantity: number;
  minPriceToApply: number;
  discountType: "ONE_TIME" | "MANY_TIME";
  maxQuantityCanUse: number;
}

const ModalAddDiscount = ({ isModalOpen, setIsModalOpen }: any) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<DiscountDataType>();
  const { loading, message, discount } = useAppSelector(
    (state) => state.discount
  );

  // GỌI API KHI SUBMIT
  const onFinish = (values: DiscountDataType) => {
    let payload = {
      ...values,
      // Chuyển đổi ngày về String ISO
      startDate: dayjs(values.startDate).toISOString(),
      endDate: dayjs(values.endDate).toISOString(),
    };

    if (discount?.discountCodeId) {
  // Logic Cập nhật
      dispatch(
        updateDiscount({
          id: discount.discountCodeId, // ✅ dùng đúng tên BE
          data: payload,
        })
      );
    } else {
      dispatch(createDiscount(payload));
    }
  };

  // NÚT HỦY
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // XỬ LÝ KHI THÊM/SỬA THÀNH CÔNG
  useEffect(() => {
    if (message && message?.type === "success") {
      dispatch(getDiscountsFilter({})); // Load lại table
      setIsModalOpen(false); // Đóng modal
      form.resetFields();
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
        // Chế độ Sửa: điền data
        form.setFieldsValue({
          ...discount,
          startDate: dayjs(discount.startDate),
          endDate: dayjs(discount.endDate),
        });
      } else {
        // Chế độ Thêm: dọn form
        form.resetFields();
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
                parser={((value: string | undefined) =>
                  value ? value.replace(/\$\s?|(,*)/g, "") : "") as any}
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
              <TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 mt-5">
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
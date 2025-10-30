"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

interface ModelAddCategoryProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onSubmit?: (values: { name: string; description?: string }) => void;
  mode?: "create" | "edit";
  initialValues?: { categoryId: string; categoryName: string; };
}

export default function ModelAddCategory({
  isModalOpen,
  setIsModalOpen,
  onSubmit,
  mode,
  initialValues,
}: ModelAddCategoryProps) {
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = (values: any) => {
    if (onSubmit) onSubmit(values);
  };

  useEffect(() => {
  if (isModalOpen) {
    if (mode === "edit" && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }
}, [isModalOpen, initialValues, form]);

  return (
    <Modal
      title={mode === "edit" ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Tên danh mục"
          name="categoryName"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        {/* <Form.Item label="Mô tả" name="description">
          <Input.TextArea
            placeholder="Nhập mô tả (tùy chọn)"
            rows={3}
            maxLength={200}
          />
        </Form.Item> */}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {mode === "edit" ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

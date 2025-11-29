"use client";

import React from "react";
import { Button, Card, Form, Input, Switch, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import http from "@/lib/utils/api";
import { useAppSelector } from "@/stores/hooks";

export default function CreateArticlePage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const { user } = useAppSelector((state) => state.auth); // ⭐ lấy user từ Redux

  const handleSubmit = async (values: any) => {
    try {
      await http.post("/articles", {
        ...values,
        createdById: user.userId, // ⭐ gửi cho backend
        updatedById: user.userId, // ⭐ backend cần
      });

      message.success("Thêm bài viết thành công!");
      router.back();
    } catch (error: any) {
      message.error(error.message || "Lỗi tạo bài viết!");
    }
  };

  return (
    <div className="boxpage">
      <div className="boxItemPage">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại
        </Button>

        <Card title="Thêm bài viết mới" className="mt-4">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Nội dung"
              name="content"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item
              label="Thumbnail URL"
              name="thumbnailUrl"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Hiển thị bài viết"
              name="isVisible"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Thêm bài viết
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

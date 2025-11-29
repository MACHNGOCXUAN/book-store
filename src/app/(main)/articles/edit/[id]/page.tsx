"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Switch, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import http from "@/lib/utils/api";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const res = await http.get(`/articles/${articleId}`);

      form.setFieldsValue({
        title: res.title,
        content: res.content,
        thumbnailUrl: res.thumbnailUrl,
        isVisible: res.isVisible,
      });
    } catch {
      message.error("Không thể tải bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) loadArticle();
  }, [articleId]);

  const handleSubmit = async (values: any) => {
    try {
      await http.put(`/articles/${articleId}`, values);
      message.success("Cập nhật bài viết thành công!");
      router.back();
    } catch (error: any) {
      message.error(error.message || "Lỗi cập nhật!");
    }
  };

  return (
    <div className="boxpage">
      <div className="boxItemPage">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại
        </Button>

        <Card title="Chỉnh sửa bài viết" loading={loading} className="mt-4">
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
            >
              <Switch />
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

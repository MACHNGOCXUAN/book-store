"use client";

import { Form, Input, Select, Button, Space } from "antd";

export default function ArticleFilter({ onSearch }: any) {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSearch(values);
  };

  return (
    <Form layout="inline" form={form} onFinish={handleFinish}>

      {/* Tìm theo tiêu đề */}
      <Form.Item name="title">
        <Input placeholder="Tìm theo tiêu đề..." allowClear />
      </Form.Item>

      {/* Lọc hiển thị */}
      <Form.Item name="isVisible">
        <Select
          placeholder="Hiển thị"
          allowClear
          style={{ width: 150 }}
          options={[
            { label: "Hiển thị", value: true },
            { label: "Ẩn", value: false },
          ]}
        />
      </Form.Item>

      {/* Nút lọc + clear */}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>

          <Button
            onClick={() => {
              form.resetFields();
              onSearch({});
            }}
          >
            Xóa lọc
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

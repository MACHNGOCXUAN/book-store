// File: components/products/ProductFilter.tsx
import React from "react";
import { Button, Col, Collapse, CollapseProps, Form, Input, Row } from "antd";

interface ProductFilterProps {
  onSearch: (values: any) => void;
}

export default function ProductFilter({ onSearch }: ProductFilterProps) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    onSearch(values);
  };

  const onReset = () => {
    form.resetFields();
    onSearch({});
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h5 className="font-bold text-sm">Bộ lọc</h5>,
      children: (
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{
            minPrice: "",
            maxPrice: "",
            title: "",
            author: "",
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Tiêu đề" name="title">
                <Input placeholder="Nhập tiêu đề sách" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tác giả" name="author">
                <Input placeholder="Nhập tên tác giả" allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Giá tối thiểu" name="minPrice">
                <Input type="number" placeholder="Từ" min={0} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Giá tối đa" name="maxPrice">
                <Input type="number" placeholder="Đến" min={0} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item>
                <div className="flex gap-3 mt-6">
                  <Button type="primary" htmlType="submit">
                    Tìm kiếm
                  </Button>
                  <Button onClick={onReset}>Đặt lại</Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
  ];

  return <Collapse defaultActiveKey={["1"]} ghost items={items} />;
}
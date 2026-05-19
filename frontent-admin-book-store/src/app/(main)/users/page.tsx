"use client";
import {
  Button,
  Col,
  Collapse,
  CollapseProps,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];

export default function UserPage() {
  const [form] = Form.useForm();
  const [clientReady, setClientReady] = useState<boolean>(false);

  // To disable submit button at the beginning.
  useEffect(() => {
    setClientReady(true);
  }, []);

  const onFinish = (values: any) => {
    console.log("Finish:", values);
  };

  const onReset = () => {
    form.resetFields();
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h5 className="font-bold text-sm">Bộ lọc</h5>,
      children: (
        <Form form={form} onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tên người dùng"
                name="tenNguoiDung"
                rules={[{ required: false }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Trạng thái" name="trangThai">
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  defaultValue={"tat_ca"}
                >
                  <Select.Option value="tat_ca">Tất cả</Select.Option>
                  <Select.Option value="hoat_dong">Hoạt động</Select.Option>
                  <Select.Option value="khong_hoat_dong">
                    Không hoạt động
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item>
                <div className="flex gap-5">
                  <Button type="primary" htmlType="submit">
                    Tìm kiếm
                  </Button>
                  <Button type="default" onClick={onReset}>
                    Đặt lại
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
  ];

  return (
    <div className="boxpage">
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý người dùng</h5>
        <div>
          <Button type="primary" size="middle">
            Thêm người dùng mới
          </Button>
        </div>
      </div>
      <div className="boxItemPage">
        <Collapse defaultActiveKey={["1"]} ghost items={items} />
      </div>
      <div className="boxItemPage">
        <Table<DataType> columns={columns} dataSource={data}/>
      </div>
    </div>
  );
}

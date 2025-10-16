// File: components/products/ProductForm.tsx
import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { ProductDataType, ProductFormValues } from "@/types/product";

const { TextArea } = Input;

interface ProductFormProps {
  mode: "create" | "edit";
  initialValues: ProductDataType | null;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

export default function ProductForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        author: initialValues.author,
        price: initialValues.price,
        stock: initialValues.stock,
        description: initialValues.description,
        publisher: initialValues.publisher,
        publishDate: initialValues.publishDate
      });

      if (initialValues.coverImage) {
        setFileList([
          {
            uid: "-1",
            name: "cover-image.jpg",
            status: "done",
            url: initialValues.coverImage,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [mode, initialValues, form]);

  const handleFinish = (values: any) => {
    const formData: ProductFormValues = {
      ...values,
      coverImage: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : "",
    };
    onSubmit(formData);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file hình ảnh!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Hình ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return false;
  };

  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tiêu đề sách"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề sách" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Tác giả"
            name="author"
            rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
          >
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              placeholder="Nhập giá sách"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Số lượng tồn kho"
            name="stock"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Nhập số lượng"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Nhà xuất bản" name="publisher">
            <Input placeholder="Nhập nhà xuất bản" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Năm xuất bản" name="publishDate">
            <InputNumber
              style={{ width: "100%" }}
              min={1900}
              max={new Date().getFullYear()}
              placeholder="Nhập năm xuất bản"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Hình ảnh bìa" name="coverImage">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
            </Upload>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Mô tả" name="description">
            <TextArea
              rows={4}
              placeholder="Nhập mô tả về sách"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {mode === "create" ? "Thêm mới" : "Cập nhật"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
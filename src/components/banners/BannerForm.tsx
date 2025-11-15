"use client";
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Row, Col, Upload, Switch, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

export interface BannerFormValues {
  bannerId?: string;
  title: string;
  imageUrl?: string; // base64 or url
  displayOrder?: number;
  visible?: boolean;
  url?: string;
}

interface BannerFormProps {
  mode: "create" | "edit";
  initialValues: BannerFormValues | null;
  onSubmit: (values: BannerFormValues) => void;
  onCancel: () => void;
}

export default function BannerForm({ mode, initialValues, onSubmit, onCancel }: BannerFormProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  // useEffect(() => {
  //   if (mode === "edit" && initialValues) {
  //     form.setFieldsValue({
  //       title: initialValues.title,
  //       displayOrder: initialValues.displayOrder,
  //       isVisible: initialValues.isVisible,
  //       url: initialValues.url,
  //     });

  //     if (initialValues.imageUrl) {
  //       setFileList([
  //         {
  //           uid: "-1",
  //           name: "banner.jpg",
  //           status: "done",
  //           url: initialValues.imageUrl,
  //         },
  //       ]);
  //     }
  //   } else {
  //     form.setFieldsValue({
  //       title: "",
  //       displayOrder: 0,
  //       isVisible: true, // ⭐️ Đặt mặc định là "Hiển thị" ở đây
  //       url: "",
  //     });
  //     setFileList([]);
  //   }
  // }, [mode, initialValues, form]);

  useEffect(() => {
    if (mode === "create") {
      // 1. CHẾ ĐỘ TẠO MỚI
      form.setFieldsValue({
        title: "",
        displayOrder: 0,
        isVisible: true, // Mặc định là 'true'
        url: "",
      });
      setFileList([]);

    } else if (mode === "edit") {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title,
          displayOrder: initialValues.displayOrder,
          visible: initialValues.visible, // Lấy giá trị 'true' hoặc 'false' từ data
          url: initialValues.url,
        });

        // Xử lý ảnh
        if (initialValues.imageUrl) {
          setFileList([
            {
              uid: "-1",
              name: "banner.jpg",
              status: "done",
              url: initialValues.imageUrl,
            },
          ]);
        } else {
          setFileList([]);
        }

      } else {
        form.resetFields(); 
        setFileList([]);
      }
    }
  }, [mode, initialValues, form]);

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file hình ảnh!");
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Hình ảnh phải nhỏ hơn 5MB!");
      return false;
    }

    return false;
  };

  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const handleFinish = (values: any) => {
    const data: BannerFormValues = {
      ...values,
      imageUrl: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : "",
    };
    console.log("Dữ liệu Banner gửi đi:", data);
    onSubmit(data);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
            <Input placeholder="Nhập tiêu đề banner" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Thứ tự hiển thị" name="displayOrder">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Hiển thị" name="visible" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>

        <Col span={16}>
          <Form.Item label="Liên kết (URL)" name="url">
            <Input placeholder="https://..." />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Hình ảnh" name="imageUrl">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Col>

        <Col span={24}>
          <div className="flex justify-end gap-3">
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {mode === "create" ? "Thêm banner" : "Cập nhật"}
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

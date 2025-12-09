// File: components/products/ProductForm.tsx
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getAllCategories } from "@/stores/slices/category.slice";
import { ProductDataType, ProductFormValues } from "@/types/product";
import {
  authorValidationRules,
  categoryValidationRules,
  descriptionValidationRules,
  importPriceValidationRules,
  priceValidationRules,
  publishDateValidationRules,
  publisherValidationRules,
  stockValidationRules,
  titleValidationRules,
} from "@/utils/validation";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Upload,
  DatePicker,
} from "antd";
import React, { useEffect } from "react";
import dayjs from "dayjs";

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
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.category);

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
          ? dayjs(initialValues.publishDate)
          : null,
        category_id: initialValues.category?.categoryId || "",
        importPrice: initialValues.importPrice,
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
    console.log("Form values:", values);
    console.log(
      "Publish date:",
      values.publishDate,
      "Type:",
      typeof values.publishDate
    );
    const formData: ProductFormValues = {
      ...values,
      publishDate: values.publishDate
        ? values.publishDate.format("YYYY-MM-DD")
        : null,
      coverImage:
        fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : "",
    };
    console.log("Form data to submit:", formData);
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

  const handleChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

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
            rules={titleValidationRules}
          >
            <Input placeholder="Nhập tiêu đề sách" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Tác giả"
            name="author"
            rules={authorValidationRules}
          >
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={priceValidationRules}
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
            label="Giá nhập (VNĐ)"
            name="importPrice"
            rules={importPriceValidationRules}
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
          <Form.Item label="Giảm giá(%)" name="discountPercent">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={100}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              placeholder="Nhập giảm giá"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Số lượng tồn kho"
            name="stock"
            rules={stockValidationRules}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Nhập số lượng"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Nhà xuất bản"
            name="publisher"
            rules={publisherValidationRules}
          >
            <Input placeholder="Nhập nhà xuất bản" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Ngày xuất bản"
            name="publishDate"
            rules={publishDateValidationRules}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Chọn ngày xuất bản"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Loại sách"
            name="category_id"
            rules={categoryValidationRules}
          >
            <Select placeholder="Chọn loại sách" allowClear>
              {categories.map((category: any) => (
                <Select.Option key={category.id} value={category.categoryId}>
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
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
          <Form.Item
            label="Mô tả"
            name="description"
            rules={descriptionValidationRules}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả về sách"
              showCount
              maxLength={2000}
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

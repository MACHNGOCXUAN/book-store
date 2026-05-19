"use client";
import React, { useEffect } from "react";
import { Button, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import ProductForm from "@/components/products/ProductForm";
import { ProductFormValues } from "@/types/product";
import {
  createProduct,
  getFilterProduct,
  resetMessage,
} from "@/stores/slices/product.slice";
import { useMyNotification } from "@/hooks/notification";

export default function CreateProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = useAppSelector((state) => state.product);

  const { openNotification, contextHolder } = useMyNotification();

  const handleSubmit = (values: ProductFormValues) => {
    dispatch(createProduct(values));
  };

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
    if (message) {
      openNotification(message.type, message?.message);

      if (message.type === "success") {
        dispatch(getFilterProduct({}));
        setTimeout(() => {
          router.back();
        }, 500);
      }
    }
    return () => {
      dispatch(resetMessage());
    };
  }, [message, dispatch, router, openNotification]);

  return (
    <div className="boxpage">
      {contextHolder}
      <div className="boxItemPage">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          className="mb-4"
        >
          Quay lại
        </Button>
        <Card title="Thêm sản phẩm mới" bordered={false}>
          <ProductForm
            mode="create"
            initialValues={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    </div>
  );
}

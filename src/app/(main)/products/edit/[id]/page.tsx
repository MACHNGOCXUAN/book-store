// File: app/(main)/products/edit/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import ProductForm from "@/components/products/ProductForm";
import { ProductFormValues, ProductDataType } from "@/types/product";
import { getFilterProduct, getProductId, resetMessage, updateProduct } from "@/stores/slices/product.slice";
import { useMyNotification } from "@/hooks/notification";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { loading, product } = useAppSelector(state => state.product)
  const { message } = useAppSelector((state) => state.product);
  const { openNotification, contextHolder } = useMyNotification();

  const productId = params.id as string;

  useEffect(() => {
    dispatch(getProductId(productId))
  }, [dispatch])

  const handleSubmit = (values: ProductFormValues) => {
    dispatch(updateProduct({...values, bookId: productId}))
  };

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
    if (message) {
      openNotification(message.type, message?.message);

      if (message.type === "success") {
        router.back();
        dispatch(getFilterProduct({}));
      }
    }
    dispatch(resetMessage());
  }, [message]);

  if (loading) {
    return (
      <div className="boxpage">
        <div className="boxItemPage flex justify-center items-center" style={{ minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

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
        <Card title="Chỉnh sửa sản phẩm" bordered={false}>
          <ProductForm
            mode="edit"
            initialValues={product}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    </div>
  );
}
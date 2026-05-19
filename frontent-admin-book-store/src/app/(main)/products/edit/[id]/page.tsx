// File: app/(main)/products/edit/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import ProductForm from "@/components/products/ProductForm";
import { ProductFormValues, ProductDataType } from "@/types/product";
import {
  getFilterProduct,
  getProductId,
  resetMessage,
  updateProduct,
} from "@/stores/slices/product.slice";
import { useMyNotification } from "@/hooks/notification";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { loading, product } = useAppSelector((state) => state.product);
  const { message: messageState } = useAppSelector((state) => state.product);
  const { openNotification, contextHolder } = useMyNotification();

  const productId = params.id as string;

  useEffect(() => {
    dispatch(getProductId(productId));
  }, [dispatch, productId]);

  const handleSubmit = (values: ProductFormValues) => {
    dispatch(updateProduct({ ...values, bookId: productId }));
  };

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
    if (messageState) {
      console.log("messageState:", messageState);
      openNotification(messageState.type, messageState.message);

      if (messageState.type === "success") {
        dispatch(getFilterProduct({}));
        setTimeout(() => {
          router.back();
        }, 500);
      }
    }
    return () => {
      dispatch(resetMessage());
    };
  }, [messageState, dispatch, router, openNotification]);

  if (loading) {
    return (
      <div className="boxpage">
        <div
          className="boxItemPage flex justify-center items-center"
          style={{ minHeight: "400px" }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="boxpage">
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
    </>
  );
}

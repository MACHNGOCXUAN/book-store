"use client";
import React, { useEffect } from "react";
import { Button, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import BannerForm from "@/components/banners/BannerForm";
import { createBanner, getFilterBanner, resetMessage } from "@/stores/slices/banner.slice";
import { useMyNotification } from "@/hooks/notification";

export default function CreateBannerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = useAppSelector((state) => state.banner);
  const { openNotification, contextHolder } = useMyNotification();

  const handleSubmit = (values: any) => {
    dispatch(createBanner(values));
  };

  const handleCancel = () => router.back();

  useEffect(() => {
    if (message) {
      openNotification(message.type, message?.message);
      if (message.type === "success") {
        router.back();
        dispatch(getFilterBanner({}));
      }
    }
    dispatch(resetMessage());
  }, [message]);

  return (
    <div className="boxpage">
      {contextHolder}
      <div className="boxItemPage">
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel} className="mb-4">Quay lại</Button>
        <Card title="Thêm banner mới" bordered={false}>
          <BannerForm mode="create" initialValues={null} onSubmit={handleSubmit} onCancel={handleCancel} />
        </Card>
      </div>
    </div>
  );
}

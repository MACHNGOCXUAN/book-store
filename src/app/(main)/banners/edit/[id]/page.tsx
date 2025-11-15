"use client";
import React, { useEffect } from "react";
import { Button, Card, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import BannerForm from "@/components/banners/BannerForm";
import { getBannerId, getFilterBanner, resetMessage, updateBanner } from "@/stores/slices/banner.slice";
import { useMyNotification } from "@/hooks/notification";

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { loading, banner, message } = useAppSelector((state) => state.banner);
  const { openNotification, contextHolder } = useMyNotification();

  const bannerId = params.id as string;

  useEffect(() => {
    if (bannerId) dispatch(getBannerId(bannerId));
  }, [dispatch]);

  const handleSubmit = (values: any) => {
    dispatch(updateBanner({ ...values, bannerId }));
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
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel} className="mb-4">Quay lại</Button>
        <Card title="Chỉnh sửa banner" bordered={false}>
          <BannerForm mode="edit" initialValues={banner} onSubmit={handleSubmit} onCancel={handleCancel} />
        </Card>
      </div>
    </div>
  );
}

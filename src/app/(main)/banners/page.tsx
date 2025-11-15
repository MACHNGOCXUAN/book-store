"use client";
import React, { useEffect, useState } from "react";
import { Button, Space, Image, Modal } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getFilterBanner, resetMessage, createBanner, getBannerId, updateBanner } from "@/stores/slices/banner.slice";
import BannerForm from "@/components/banners/BannerForm";
import { useMyNotification } from "@/hooks/notification";
import { Table } from "@/components/table/table";

export default function BannerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { listBanner, loading, pagination, message, banner } = useAppSelector((state) => state.banner);
  const { openNotification, contextHolder } = useMyNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getFilterBanner({}));
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      openNotification(message?.type, message?.message);
      if (message?.type === "success") {
        dispatch(getFilterBanner({}));
        if (isModalOpen) setIsModalOpen(false);
      }
    }
    dispatch(resetMessage());
  }, [message, dispatch, openNotification, isModalOpen]);

  const handleCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setIsModalOpen(true);
  };
  const handleEdit = (id: string) => {
    setModalMode("edit");
    setEditingId(id);
    dispatch(getBannerId(id));
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (values: any) => {
    dispatch(createBanner(values));
  };

  const handleEditSubmit = (values: any) => {
    const id = editingId || values.bannerId || banner?.bannerId;
    if (!id) return;
    dispatch(updateBanner({ ...values, bannerId: id }));
  };

  const handleCancelModal = () => setIsModalOpen(false);

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Ảnh", dataIndex: "imageUrl", key: "imageUrl", render: (src: string) => (<Image src={src} width={140} height={80} />) },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 100 },
    { title: "Hiển thị", dataIndex: "isVisible", key: "isVisible", width: 100, render: (v: boolean) => (v ? "Có" : "Ẩn") },
    { title: "Hành động", key: "action", width: 120, render: (_: any, record: any) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => handleEdit(record.bannerId)} />
      </Space>
    ) }
  ];

  return (
    <div className="boxpage">
      {contextHolder}

      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý banner</h5>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Thêm banner mới</Button>
      </div>

      <div className="boxItemPage">
        <Table
          columns={columns}
          data={listBanner}
          loading={loading}
          rowKey="bannerId"
          pagination={{
            current: pagination?.curPage || 1,
            pageSize: pagination?.limitPage || 10,
            total: pagination?.totalRows || 0,
            showSizeChanger: true,
            onChange: (page: number, pageSize: number) => dispatch(getFilterBanner({ page, limit: pageSize }))
          }}
        />
      </div>
      <Modal
        title={modalMode === "create" ? "Thêm banner mới" : "Chỉnh sửa banner"}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
      >
        <BannerForm
          mode={modalMode}
          initialValues={modalMode === "edit" ? banner : null}
          onSubmit={modalMode === "create" ? handleCreateSubmit : handleEditSubmit}
          onCancel={handleCancelModal}
        />
      </Modal>
    </div>
  );
}

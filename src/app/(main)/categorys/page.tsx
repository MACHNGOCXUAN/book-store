"use client";
import { Table } from "@/components/table/table";
import { Button, Col, Input, Row, Space, TableProps } from "antd";
import React, { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  addCategory,
  getAllCategories,
  getCategoryDetail,
  resetMessage,
  updateCategory,
} from "@/stores/slices/category.slice";
import ModelAddCategory from "@/components/Model/model-category";
import { useMyNotification } from "@/hooks/notification";

type CategoryDataType = {
  categoryId: string;
  categoryName: string;
};

export default function CategoryPage() {
  const dispatch = useAppDispatch();
  const { categories, loading, message, categoryDetail } = useAppSelector(
    (state) => state.category
  );
  const { openNotification, contextHolder } = useMyNotification();

  useEffect(() => {
    dispatch(getAllCategories(""));
  }, [dispatch]);

  const handleEditCategory = (id: string) => {
    dispatch(getCategoryDetail(id));
    setMode("edit");
    setIsModalOpen(true);
  };

  const columns: TableProps<CategoryDataType>["columns"] = [
    {
      title: "Mã loại sách",
      dataIndex: "categoryId",
      key: "categoryId",
    },
    {
      title: "Tên loại sách",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record.categoryId)}
            title="Chỉnh sửa danh mục"
          />
        </Space>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchText, setSearchText] = useState("");
  const handleCreateCategory = () => {
    setMode("create");
    setIsModalOpen(true);
  };

  const submitForm = (values: any) => {
    if (mode === "create") {
      dispatch(addCategory({ categoryName: values.categoryName }));
    } else if (mode === "edit" && categoryDetail?.categoryId) {
      dispatch(
        updateCategory({
          id: categoryDetail.categoryId,
          categoryName: values.categoryName,
        })
      );
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (message) {
      openNotification(message?.type, message?.message);
    }
    if (message?.type === "success") {
      dispatch(getAllCategories(""));
    }
    dispatch(resetMessage());
  }, [message, openNotification]);

  const handleApplyFilter = () => {
    dispatch(getAllCategories(searchText));
  };

  const handleResetFilter = () => {
    setSearchText("");
    dispatch(getAllCategories(""));
  };

  return (
    <div className="boxpage">
      {contextHolder}
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý danh mục sách</h5>
        <Button
          type="dashed"
          size="middle"
          icon={<PlusOutlined />}
          onClick={handleCreateCategory}
        >
          Thêm danh mục mới
        </Button>
      </div>
      <div className="boxItemPage flex flex-col gap-4">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          Tìm kiếm danh mục
        </label>
        <div className="flex flex-row gap-2">
          <Input
            placeholder="Nhập tên danh mục..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="rounded-lg"
            style={{ width: 400 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleApplyFilter}
            className="h-10 px-6 rounded-lg"
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetFilter}
            className="h-10 px-6 rounded-lg"
          >
            Xóa lọc
          </Button>
        </div>
      </div>

      <div className="boxItemPage">
        <Table<CategoryDataType>
          columns={columns}
          data={categories}
          rowKey="categoryId"
          loading={loading}
        />
      </div>
      <ModelAddCategory
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSubmit={submitForm}
        mode={mode}
        initialValues={categoryDetail}
      />
    </div>
  );
}

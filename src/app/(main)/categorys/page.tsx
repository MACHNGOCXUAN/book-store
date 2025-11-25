"use client";
import { Table } from "@/components/table/table";
import { Button, Col, Input, Row, Space, TableProps } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import {
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
  const {
    categories = [],
    loading,
    message,
    categoryDetail,
  } = useAppSelector((state) => state.category);
  const { openNotification, contextHolder } = useMyNotification();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    dispatch(getAllCategories(""));
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    if (!appliedSearch) return categories;
    return categories.filter((item) =>
      item.categoryName?.toLowerCase().includes(appliedSearch.toLowerCase())
    );
  }, [categories, appliedSearch]);

  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(filteredCategories.length / pageSize)
    );
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredCategories.length, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredCategories.slice(startIndex, endIndex);

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
      if (message?.type === "success") {
        dispatch(getAllCategories(""));
      }
      dispatch(resetMessage());
    }
  }, [message, openNotification, dispatch]);

  const handleApplyFilter = () => {
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSearchInput("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
          data={paginatedData}
          rowKey="categoryId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredCategories.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, size) => handlePageChange(page, size),
          }}
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

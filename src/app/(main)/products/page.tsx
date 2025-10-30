"use client";
import React, { useEffect, useState } from "react";
import { Button, Space, Image, TableProps } from "antd";
import { BiShowAlt } from "react-icons/bi";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { deleteProduct, getFilterProduct, getProductId, resetMessage } from "@/stores/slices/product.slice";
import { useMyNotification } from "@/hooks/notification";
import { Table } from "@/components/table/table";
import ProductFilter from "@/components/products/ProductFilter";
import { ProductDataType } from "@/types/product";
import ProductViewModal from "@/components/products/ProductModal";

export default function ProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { listProduct, loading, pagination, message, product } = useAppSelector(
    (state) => state.product
  );
  const { openNotification, contextHolder } = useMyNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getFilterProduct({}));
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      openNotification(message?.type, message?.message);
      if (message?.type === "success") {
        dispatch(getFilterProduct({}));
      }
    }
    dispatch(resetMessage());
  }, [message, dispatch, openNotification]);

  const handleSearch = (values: any) => {
    dispatch(getFilterProduct(values));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(getFilterProduct({ page, limit: pageSize }));
  };

  const handleDeleteProduct = (id: string) => {
    dispatch(deleteProduct(id));
  };

  const handleCreateProduct = () => {
    router.push("/products/create");
  };

  const handleEditProduct = (id: string) => {
    router.push(`/products/edit/${id}`);
  };

  const handleViewProduct = (id: string) => {
    dispatch(getProductId(id))
    setIsModalOpen(true);
  };

  const columns: TableProps<ProductDataType>["columns"] = [
    {
      title: "ID",
      dataIndex: "bookId",
      key: "bookId",
      width: 80,
    },
    {
      title: "Tiêu đề sách",
      dataIndex: "title",
      key: "title",
      width: 300,
    },
    {
      title: "Hình ảnh",
      dataIndex: "coverImage",
      key: "coverImage",
      render: (image) => (
        <Image alt="product" src={image} width={80} height={80} />
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => `${price?.toLocaleString('vi-VN')} đ`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<BiShowAlt />} 
            title="Xem chi tiết"
            onClick={() => handleViewProduct(record.bookId)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record.bookId)}
            title="Chỉnh sửa"
          />
          {/* <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProduct(record.bookId)}
            title="Xóa"
          /> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="boxpage">
      {contextHolder}
      
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý sản phẩm</h5>
        <Button 
          type="primary" 
          size="middle" 
          icon={<PlusOutlined />}
          onClick={handleCreateProduct}
        >
          Thêm sản phẩm mới
        </Button>
      </div>

      <div className="boxItemPage">
        <ProductFilter onSearch={handleSearch} />
      </div>

      <div className="boxItemPage">
        <Table<ProductDataType>
          columns={columns}
          data={listProduct}
          loading={loading}
          rowKey="bookId"
          pagination={{
            showQuickJumper: false,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            current: pagination?.curPage || 1,
            pageSize: pagination?.limitPage || 10,
            total: pagination?.totalRows || 0,
            onChange: handlePageChange
          }}
        />
      </div>

      <ProductViewModal product={product} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
}
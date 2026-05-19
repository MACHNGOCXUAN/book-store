"use client";

import React, { useEffect, useState } from "react";
import { Button, Space, Image, Table, Switch, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { BiShowAlt } from "react-icons/bi";
import { useRouter } from "next/navigation";
import http from "@/lib/utils/api";
import ArticleFilter from "@/components/articles/ArticleFilter";

export default function ArticlePage() {
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [curPage, setCurPage] = useState(1);
  const [limitPage, setLimitPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // ======================
  // Load danh sách bài viết
  // ======================
  const loadArticles = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await http.get(`/articles?page=${page}&limit=${limit}`);

      setArticles(res.data || res);
      setTotalRows(res.total || 0);
    } catch (error: any) {
      message.error(error.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(curPage, limitPage);
  }, []);

  // ======================
  // Filter
  // ======================
  const handleSearch = async (values: any) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (values.title) params.append("title", values.title);
      if (values.isVisible !== undefined)
        params.append("isVisible", values.isVisible);

      const res = await http.get(`/articles?${params.toString()}`);

      setArticles(res.data || res);
      setTotalRows(res.total || 0);
    } catch {
      message.error("Lỗi lọc dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // Pagination
  // ======================
  const handlePageChange = (page: number, size: number) => {
    setCurPage(page);
    setLimitPage(size);
    loadArticles(page, size);
  };

  // ======================
  // Navigation
  // ======================
  const handleCreate = () => router.push("/articles/create");
  const handleEdit = (id: string) => router.push(`/articles/edit/${id}`);
  const handleView = (id: string) => router.push(`/articles/view/${id}`);

  // ======================
  // Columns table
  // ======================
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_: any, __: any, index: number) =>
        (curPage - 1) * limitPage + index + 1,
    },
    {
      title: "Mã bài viết",
      dataIndex: "articleId",
      width: 150,
      render: (id: string) => `ART-${id.substring(0, 6).toUpperCase()}`,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      width: 300,
    },
    {
      title: "Ảnh",
      dataIndex: "thumbnailUrl",
      render: (img: string) => <Image src={img} width={80} />,
    },
    {
      title: "Hiển thị",
      dataIndex: "isVisible",
      width: 120,
      render: (value: boolean, record: any) => (
        <Switch
          checked={value}
          checkedChildren="Hiển thị"
          unCheckedChildren="Ẩn"
          onChange={async (checked) => {
            try {
              await http.put(`/articles/${record.articleId}`, {
                title: record.title,
                content: record.content,
                thumbnailUrl: record.thumbnailUrl,
                isVisible: checked,
                updatedById: record.createdById || record.userId || null,
              });

              message.success("Cập nhật hiển thị thành công!");
              loadArticles(curPage, limitPage);
            } catch {
              message.error("Lỗi cập nhật hiển thị!");
            }
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<BiShowAlt />}
            onClick={() => handleView(record.articleId)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.articleId)}
          />
        </Space>
      ),
    },
  ];

  // ======================
  // JSX RENDER
  // ======================
  return (
    <div className="boxpage">
      {/* HEADER */}
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý bài viết</h5>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm bài viết mới
        </Button>
      </div>

      {/* FILTER */}
      <div className="boxItemPage">
        <ArticleFilter onSearch={handleSearch} />
      </div>

      {/* TABLE */}
      <div className="boxItemPage">
        <Table
          columns={columns}
          dataSource={articles}
          loading={loading}
          rowKey="articleId"
          pagination={{
            current: curPage,
            pageSize: limitPage,
            total: totalRows,
            showSizeChanger: true,
            onChange: handlePageChange,
          }}
        />
      </div>
    </div>
  );
}

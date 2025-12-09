"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Space,
  Image,
  Modal,
  Tooltip,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  getFilterBanner,
  resetMessage,
  createBanner,
  getBannerId,
  updateBanner,
  toggleBannerVisibility,
} from "@/stores/slices/banner.slice";
import BannerForm from "@/components/banners/BannerForm";
import { useMyNotification } from "@/hooks/notification";
import { Table } from "@/components/table/table";

export default function BannerPage() {
  const dispatch = useAppDispatch();
  const { listBanner, loading, pagination, message, banner } = useAppSelector(
    (state) => state.banner
  );
  const { openNotification, contextHolder } = useMyNotification();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter states
  const [searchTitle, setSearchTitle] = useState("");
  const [filterVisible, setFilterVisible] = useState<string>("true");

  // Initialize data on mount
  useEffect(() => {
    dispatch(getFilterBanner({ isVisible: true }));
  }, [dispatch]);

  // Handle API responses
  useEffect(() => {
    if (message) {
      openNotification(message?.type, message?.message);
      if (message?.type === "success") {
        dispatch(getFilterBanner({}));
        setIsModalOpen(false);
      }
      dispatch(resetMessage());
    }
  }, [message, dispatch, openNotification]);

  // Modal handlers
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

  const handleCancelModal = () => setIsModalOpen(false);

  // Form submission handlers
  const handleCreateSubmit = (values: any) => {
    dispatch(createBanner(values));
  };

  const handleEditSubmit = (values: any) => {
    const id = editingId || values.bannerId || banner?.bannerId;
    if (!id) return;
    dispatch(updateBanner({ ...values, bannerId: id }));
  };

  // Search and filter handlers
  const handleSearch = () => {
    dispatch(
      getFilterBanner({
        title: searchTitle || undefined,
        isVisible: filterVisible ? filterVisible === "true" : undefined,
      })
    );
  };

  const handleFilterVisibleChange = (value: string) => {
    setFilterVisible(value);
    dispatch(
      getFilterBanner({
        title: searchTitle || undefined,
        isVisible: value ? value === "true" : undefined,
      })
    );
  };

  const handleReset = () => {
    setSearchTitle("");
    setFilterVisible("true");
    dispatch(getFilterBanner({ isVisible: true }));
  };

  const handleToggleVisibility = (id: string, currentStatus: any) => {
    const isVisible =
      String(currentStatus) === "true" ||
      currentStatus === 1 ||
      currentStatus === true;
    dispatch(toggleBannerVisibility({ id, isVisible }));
  };

  // Helper function to check visibility status
  const getVisibilityStatus = (value: any) => {
    return String(value) === "true" || value === 1 || value === true;
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (src: string) => (
        <Image src={src} width={140} height={80} alt="Banner" />
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 100,
    },
    {
      title: "Hiển thị",
      dataIndex: "visible",
      key: "visible",
      width: 120,
      render: (v: any, record: any) => {
        const isVisible = getVisibilityStatus(v);
        return (
          <Tooltip title={isVisible ? "Ẩn banner" : "Hiển thị banner"}>
            <Button
              icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => handleToggleVisibility(record.bannerId, v)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.bannerId)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="boxpage">
      {contextHolder}

      {/* Header */}
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý banner</h5>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm banner mới
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="boxItemPage">
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Trạng thái hiển thị"
              value={filterVisible}
              onChange={handleFilterVisibleChange}
              allowClear
              options={[
                { label: "Hiển thị", value: "true" },
                { label: "Ẩn", value: "false" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Đặt lại</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Table Section */}
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
            onChange: (page: number, pageSize: number) =>
              dispatch(getFilterBanner({ page, limit: pageSize })),
          }}
        />
      </div>

      {/* Modal */}
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
          onSubmit={
            modalMode === "create" ? handleCreateSubmit : handleEditSubmit
          }
          onCancel={handleCancelModal}
        />
      </Modal>
    </div>
  );
}

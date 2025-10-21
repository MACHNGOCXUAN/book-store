import React, { useState } from "react";
import { Card, Rate, Button, Space, Modal, Form, Input, message } from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Comment } from "../types";

/* ===================== CommentItem Props ===================== */
interface CommentItemProps {
  comment: Comment;
  primaryColor: string;
  isCurrentUserComment?: boolean;
  onEdit?: (reviewId: string | number, rating: number, content: string) => Promise<void>;
  onDelete?: (reviewId: string | number) => Promise<void>;
}

const CONTENT_PREVIEW_LENGTH = 200; // Ký tự hiển thị trước

const ReviewItem: React.FC<CommentItemProps> = ({ 
  comment, 
  primaryColor,
  isCurrentUserComment,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  
  const isLongContent = comment.content && comment.content.length > CONTENT_PREVIEW_LENGTH;
  const displayContent = isExpanded || !isLongContent 
    ? comment.content 
    : `${comment.content.substring(0, CONTENT_PREVIEW_LENGTH)}...`;

  const handleEditClick = () => {
    editForm.setFieldsValue({
      rating: comment.rating,
      content: comment.content,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!onEdit) return;
    try {
      setEditLoading(true);
      await onEdit(comment.review_id, values.rating, values.content);
      editForm.resetFields();
      setIsEditModalOpen(false);
      message.success("Cập nhật bình luận thành công ✅");
    } catch (error: any) {
      message.error("Lỗi khi cập nhật bình luận 😢");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    try {
      await onDelete(comment.review_id);
      message.success("Xóa bình luận thành công ✅");
    } catch (error: any) {
      message.error("Lỗi khi xóa bình luận 😢");
    }
  };

  return (
    <>
      <Card
        style={{
          backgroundColor: "#fafafa",
          border: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          {/* User Avatar */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ fontSize: "24px", color: "#fff" }} />
          </div>

          {/* Comment Content */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "8px",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#000" }}>
                  {comment.customer_name || 
                   comment.customer_full_name || 
                   comment.customerName || 
                   comment.customerFullName || 
                   comment.customer?.fullName || 
                   "Khách hàng"}
                </p>
                <Rate disabled value={comment.rating} style={{ fontSize: "14px", marginTop: "4px" }} />
              </div>
              <span style={{ fontSize: "12px", color: "#999" }}>
                {comment.rating_date || comment.ratingDate || new Date().toISOString().split("T")[0]}
              </span>
            </div>

            {/* Comment Text */}
            <p style={{ margin: "12px 0 0 0", color: "#333", lineHeight: "1.6" }}>
              {displayContent}
            </p>

            {/* Xem thêm/Thu gọn button */}
            {isLongContent && (
              <Button
                type="link"
                size="small"
                style={{ padding: "4px 0", color: primaryColor, fontWeight: "500" }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </Button>
            )}

            {/* Edit & Delete buttons */}
            {isCurrentUserComment && (onEdit || onDelete) && (
              <div style={{ marginTop: "12px" }}>
                <Space size="small">
                  {onEdit && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={handleEditClick}
                      style={{ color: "#1890ff", padding: "4px 8px" }}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteClick}
                      style={{ color: "#ff4d4f", padding: "4px 8px" }}
                    >
                      Xóa
                    </Button>
                  )}
                </Space>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa bình luận"
        open={isEditModalOpen}
        onCancel={() => {
          editForm.resetFields();
          setIsEditModalOpen(false);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={editLoading}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: "Vui lòng chọn đánh giá" }]}
          >
            <Rate style={{ fontSize: "24px" }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="Bình luận"
            rules={[{ required: true, message: "Vui lòng nhập bình luận" }]}
          >
            <Input.TextArea
              placeholder="Mời bạn tham gia thảo luận!"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReviewItem;
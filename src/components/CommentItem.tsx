import React from "react";
import { Card, Rate } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Comment } from "../types";

/* ===================== CommentItem Props ===================== */
interface CommentItemProps {
  comment: Comment;
  primaryColor: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, primaryColor }) => (
    <Card
        key={comment.review_id}
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
                    backgroundColor: primaryColor, // Sử dụng primaryColor từ props
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
                            {comment.customer_name}
                        </p>
                        <Rate disabled value={comment.rating} style={{ fontSize: "14px", marginTop: "4px" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#999" }}>{comment.rating_date}</span>
                </div>
                <p style={{ margin: "12px 0 0 0", color: "#333", lineHeight: "1.6" }}>{comment.content}</p>
            </div>
        </div>
    </Card>
);

export default CommentItem;
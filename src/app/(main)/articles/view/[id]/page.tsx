"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Descriptions, Image, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import http from "@/lib/utils/api";

export default function ViewArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<any>(null);

  const loadArticle = async () => {
    try {
      const res = await http.get(`/articles/${articleId}`);
      setArticle(res);
    } catch {
      message.error("Không thể tải bài viết!");
    }
  };

  useEffect(() => {
    if (articleId) loadArticle();
  }, [articleId]);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleString("vi-VN") : "—";

  return (
    <div className="boxpage">
      <div className="boxItemPage">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại
        </Button>

        <Card title="Chi tiết bài viết" className="mt-4">
          {article && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã bài viết">
                ART-{article.articleId.substring(0, 6).toUpperCase()}
              </Descriptions.Item>

              <Descriptions.Item label="Tiêu đề">
                {article.title}
              </Descriptions.Item>

              <Descriptions.Item label="Thumbnail">
                <Image src={article.thumbnailUrl} width={200} />
              </Descriptions.Item>

              <Descriptions.Item label="Nội dung">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </Descriptions.Item>

              <Descriptions.Item label="Hiển thị">
                {article.isVisible ? "Hiển thị" : "Ẩn"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {formatDate(article.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(article.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </div>
    </div>
  );
}

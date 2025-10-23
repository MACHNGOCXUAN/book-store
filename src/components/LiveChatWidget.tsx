"use client";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Flex,
  FloatButton,
  Input,
  Popover,
  Spin,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import chatIcon from "../assets/icon_chat.png";
import chatIcon1 from "../assets/icon_chat_1.jpg";

const { Text } = Typography;
const { TextArea } = Input;
const PRIMARY_RED = "#d70018";

// Định nghĩa kiểu tin nhắn
interface Message {
  role: "user" | "bot";
  text: string;
}

const ChatPopoverWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Xin chào 👋! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // --- Cuộn xuống cuối khi có tin nhắn mới ---
  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // --- Gửi tin nhắn đến Spring Boot ---
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const replyText = await res.text();

      const botMsg: Message = { role: "bot", text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ Lỗi khi gọi API:", err);

      let errorText = "⚠️ Xin lỗi, hệ thống đang bận.";

      if (err instanceof TypeError) {
        errorText = "⚠️ Không thể kết nối đến server. Vui lòng kiểm tra backend có chạy không.";
      } else if (err instanceof Error && err.name === 'AbortError') {
        errorText = "⚠️ Yêu cầu timeout. Vui lòng thử lại.";
      }

      setMessages((prev) => [...prev, { role: "bot", text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  // --- Giao diện cửa sổ Chat ---
  const ChatWindow = (
    <div style={{ width: 340, maxHeight: "70vh", height: 500 }}>
      <Flex vertical justify="space-between" style={{ height: "100%" }}>
        {/* 1. Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <Flex align="center" justify="space-between">
            <Text strong style={{ fontSize: 18 }}>
              Trợ lý AI
            </Text>
            <Button
              type="text"
              shape="circle"
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
            />
          </Flex>
        </div>

        {/* 2. Body */}
        <div
          ref={chatBodyRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            background: "#fff",
          }}
        >
          <Flex vertical gap="small">
            {messages.map((msg, i) =>
              msg.role === "bot" ? (
                <Flex key={i} gap="small" align="flex-start">
                  <Avatar src={chatIcon1} size={32} />
                  <div
                    style={{
                      background: "#f0f2f5",
                      padding: "8px 12px",
                      borderRadius: 16,
                      maxWidth: 240,
                    }}
                  >
                    <Text style={{ whiteSpace: "pre-line" }}>
                      {msg.text
                        .split(/(?=\d+\.\s)/)
                        .map((part, index) => (
                          <span key={index}>
                            {part.trim()}
                            <br />
                          </span>
                        ))}
                    </Text>
                  </div>
                </Flex>
              ) : (
                <Flex key={i} justify="flex-end" align="flex-start" gap="small">
                  <div
                    style={{
                      background: PRIMARY_RED,
                      padding: "8px 12px",
                      borderRadius: 16,
                      color: "white",
                      maxWidth: 240,
                    }}
                  >
                    <Text style={{ color: "white" }}>{msg.text}</Text>
                  </div>
                </Flex>
              )
            )}
            {loading && (
              <Flex gap="small" align="center">
                <Avatar src={chatIcon1} size={32} />
                <Spin size="small" />
                <Text>Đang soạn phản hồi...</Text>
              </Flex>
            )}
          </Flex>
        </div>

        {/* 3. Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <Flex gap="small">
            <TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              style={{ backgroundColor: PRIMARY_RED }}
              onClick={sendMessage}
              loading={loading}
            />
          </Flex>
        </div>
      </Flex>
    </div>
  );

  return (
    <Popover
      content={ChatWindow}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="topLeft"
      overlayStyle={{ paddingTop: 16 }}
      overlayInnerStyle={{
        padding: 0,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <FloatButton
        icon={
          <img
            src={chatIcon}
            alt="Chat Icon"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        }
        style={{
          right: 32,
          bottom: 32,
          width: 58,
          height: 58,
        }}
        tooltip="Trò chuyện với AI"
      />
    </Popover>
  );
};

export default ChatPopoverWidget;

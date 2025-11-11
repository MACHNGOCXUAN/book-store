"use client";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import {
    Avatar,
    Button,
    Flex,
    Input,
    Spin,
    Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import chatIcon1 from "../assets/iconchatnv.jpg";
import chatIcon from "../assets/iconmessage.png";

const { Text } = Typography;
const { TextArea } = Input;
const PRIMARY_RED = "#d70018";

// --- Kiểu dữ liệu ChatMessage (từ ContactPage) ---
interface ChatMessage {
    messageId: string;
    sender: {
        userId: string;
        fullName: string;
        email?: string;
    };
    receiver: {
        userId: string;
        fullName: string;
        email?: string;
    };
    content: string;
    timestamp: Date;
    messageType: "TEXT" | "IMAGE" | "VIDEO" | "FILE";
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    isRead: boolean;
    chatSessionId?: string;
}

const ChatPopoverWidget = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            messageId: "1",
            sender: {
                userId: "staff-1",
                fullName: "Nhân viên hỗ trợ",
                email: "support@bookstore.vn",
            },
            receiver: {
                userId: "customer-1",
                fullName: "Bạn",
                email: "",
            },
            content: "Xin chào! 👋 Tôi có thể giúp gì cho bạn?",
            timestamp: new Date(),
            messageType: "TEXT",
            isRead: true,
            chatSessionId: "session-1",
        },
    ]);

    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement | null>(null);

    // --- Cuộn xuống cuối khi có tin nhắn mới ---
    useEffect(() => {
        chatBodyRef.current?.scrollTo({
            top: chatBodyRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, loading]);

    // --- Gửi tin nhắn từ khách hàng ---
    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const currentUserId = "customer-1";
        const staffId = "staff-1";

        const newMsg: ChatMessage = {
            messageId: String(messages.length + 1),
            sender: { userId: currentUserId, fullName: "Bạn" },
            receiver: {
                userId: staffId,
                fullName: "Nhân viên hỗ trợ",
                email: "support@bookstore.vn",
            },
            content: inputMessage,
            timestamp: new Date(),
            messageType: "TEXT",
            isRead: false,
            chatSessionId: "session-1",
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputMessage("");
        setLoading(true);

        // Giả lập phản hồi của nhân viên sau 1s
        setTimeout(() => {
            const staffReply: ChatMessage = {
                messageId: String(messages.length + 2),
                sender: {
                    userId: staffId,
                    fullName: "Nhân viên hỗ trợ",
                    email: "support@bookstore.vn",
                },
                receiver: {
                    userId: currentUserId,
                    fullName: "Bạn",
                    email: "",
                },
                content:
                    "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.",
                timestamp: new Date(),
                messageType: "TEXT",
                isRead: false,
                chatSessionId: "session-1",
            };
            setMessages((prev) => [...prev, staffReply]);
            setLoading(false);
        }, 1000);
    };

    // --- Giao diện cửa sổ Chat ---
    const ChatWindow = (
        <div style={{ width: 340, maxHeight: "70vh", height: 500 }}>
            <Flex vertical justify="space-between" style={{ height: "100%" }}>
                {/* Header */}
                <div
                    style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <Flex align="center" justify="space-between">
                        <Text strong style={{ fontSize: 18 }}>
                            Chat với nhân viên
                        </Text>
                        <Button
                            type="text"
                            shape="circle"
                            icon={<CloseOutlined />}
                            onClick={() => setOpen(false)}
                        />
                    </Flex>
                </div>

                {/* Body */}
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
                        {messages.map((msg, i) => {
                            const isCustomer = msg.sender.userId === "customer-1";
                            return isCustomer ? (
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
                                        <Text style={{ color: "white" }}>{msg.content}</Text>
                                    </div>
                                </Flex>
                            ) : (
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
                                        <Text style={{ whiteSpace: "pre-line" }}>{msg.content}</Text>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                marginTop: 4,
                                                opacity: 0.7,
                                            }}
                                        >
                                            {msg.timestamp.toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                </Flex>
                            );
                        })}
                        {loading && (
                            <Flex gap="small" align="center">
                                <Avatar src={chatIcon1} size={32} />
                                <Spin size="small" />
                                <Text>Nhân viên đang phản hồi...</Text>
                            </Flex>
                        )}
                    </Flex>
                </div>

                {/* Footer */}
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
                            value={inputMessage}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                            onPressEnter={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            style={{ backgroundColor: PRIMARY_RED }}
                            onClick={handleSendMessage}
                            loading={loading}
                        />
                    </Flex>
                </div>
            </Flex>
        </div>
    );

    return (
        <div style={{ position: 'fixed', right: 32, bottom: 150, zIndex: 999 }}>
            {/* Chat Window Popover */}
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        right: 80,
                        bottom: 0,
                        background: 'white',
                        borderRadius: 12,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        width: 340,
                        maxHeight: '70vh',
                        height: 500,
                    }}
                >
                    {ChatWindow}
                </div>
            )}

            {/* Chat Button */}
            <button
                onClick={() => setOpen(!open)}
                title="Chat với nhân viên"
                style={{
                    position: 'relative',
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    background: 'white',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                }}
            >
                <img
                    src={chatIcon}
                    alt="Chat Icon"
                    style={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'cover',
                    }}
                />
            </button>
        </div>
    );
};

export default ChatPopoverWidget;

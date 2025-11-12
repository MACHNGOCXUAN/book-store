"use client";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Input, Spin, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import chatIcon1 from "../assets/iconchatnv.jpg";
import chatIcon from "../assets/iconmessage.png";
import "../styles/chatAnimation.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getChatSessionByCustomerId,
  getMessagesBySession,
} from "../features/session/session.slice";
import { useStompClient } from "../hooks/useStompClient";

const { Text } = Typography;
const { TextArea } = Input;
const PRIMARY_RED = "#d70018";

interface ChatMessage {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  timestamp: string;
  sessionId: string;
  read: boolean;
}

const ChatPopoverWidget = () => {
  const { openEmployee, setOpenEmployee } = useChat();
  const authUser = useAppSelector((s) => s.auth.user);
  const userId = authUser?.userId;

  const { client: stompClient, connected } = useStompClient(userId || "");

  const {
    messages: dataMessage,
    chatSession,
    loading: loadingMessages,
  } = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const sessionId = chatSession?.sessionId;
  const receiverId = chatSession?.staff?.userId;

  useEffect(() => {
    if (authUser?.userId) {
      dispatch(getChatSessionByCustomerId(authUser.userId));
    }
  }, [dispatch, authUser?.userId]);

  useEffect(() => {
    if (openEmployee && sessionId) {
      dispatch(getMessagesBySession(sessionId));
    }
  }, [dispatch, sessionId, openEmployee]);

  useEffect(() => {
    if (!stompClient || !connected || !userId) {
      return;
    }

    const subscription = stompClient.subscribe(
      `/topic/messages/${userId}`,
      (message) => {
        const newMsg = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMsg]);
      }
    );

    return () => subscription.unsubscribe();
  }, [stompClient, connected, userId]);

  const [messages, setMessages] = useState<ChatMessage[]>(dataMessage || []);

  useEffect(() => {
    if (dataMessage) {
      setMessages(dataMessage);
    }
  }, [dataMessage]);

  if (!loadingMessages) {
    console.log("Loading check: ", messages);
  }

  const [inputMessage, setInputMessage] = useState("");
  const [loading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMsg = {
      senderId: userId,
      receiverId: receiverId,
      content: inputMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sessionId: sessionId || null,
      files: null,
    };

    stompClient?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(newMsg),
    });

    setInputMessage("");
  };

  const ChatWindow = (
    <div style={{ width: 340, maxHeight: "70vh", height: 500 }}>
      <Flex vertical justify="space-between" style={{ height: "100%" }}>
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
              onClick={() => setOpenEmployee(false)}
            />
          </Flex>
        </div>

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
              const isCustomer = msg.senderId === userId;
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
                    <Text style={{ whiteSpace: "pre-line" }}>
                      {msg.content}
                    </Text>
                    <div
                      style={{
                        fontSize: 11,
                        marginTop: 4,
                        opacity: 0.7,
                      }}
                    >
                      {msg.timestamp}
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputMessage(e.target.value)
              }
              onPressEnter={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                e.preventDefault();
                handleSend();
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              style={{ backgroundColor: PRIMARY_RED }}
              onClick={handleSend}
              loading={loading}
            />
          </Flex>
        </div>
      </Flex>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {openEmployee && (
        <div
          className="chat-modal-enter"
          style={{
            position: "absolute",
            right: 80,
            bottom: -10,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            overflow: "hidden",
            width: 340,
            maxHeight: "70vh",
            height: 500,
            transformOrigin: "bottom right",
            zIndex: 1000,
          }}
        >
          {ChatWindow}
        </div>
      )}
      <button
        onClick={() => setOpenEmployee(!openEmployee)}
        title="Chat với nhân viên"
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: "white",
          transition: "transform 0.2s",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className={openEmployee ? "chat-button-active" : ""}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1)";
        }}
      >
        <img
          src={chatIcon}
          alt="Chat Icon"
          style={{
            width: "80%",
            height: "80%",
            objectFit: "cover",
          }}
        />
      </button>
    </div>
  );
};

export default ChatPopoverWidget;

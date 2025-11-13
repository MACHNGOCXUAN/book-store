"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Image, Empty } from "antd";
import MessageSidebar from "@/components/messages/MessageSidebar";
import ChatBox from "@/components/messages/ChatBox";
import { MessageResponse } from "@/types/message.types";
import type { UploadFile } from "antd";
import "@/styles/message.css";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  getCustomerMessageStaff,
  getMessagesBySession,
  getStaffMessageCustomer,
  updateSessionHasStaff,
  updateSessionLastMessage,
} from "@/stores/slices/session.slice";
import { useStompClient } from "@/hooks/useStompClient";
import { searchUserByPhone } from "@/stores/slices/user.slice";
import { ChatSessionType } from "@/types/chat-session.type";

export default function MessagePage() {
  const dispatch = useAppDispatch();
  const {
    listCustomer,
    loading,
    messages: dataMessage,
  } = useAppSelector((state) => state.session);
  const { user } = useAppSelector((state) => state.auth);

  const userId = user?.userId || "";
  const userRole = user?.role;
  const { client: stompClient, connected } = useStompClient(userId);

  const [selectedId, setSelectedId] = useState("");
  const [input, setInput] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  const selectedCustomer = useMemo(
    () => listCustomer?.find((c) => c.sessionId === selectedId),
    [listCustomer, selectedId]
  );

  const hasCustomers = listCustomer && listCustomer.length > 0;

  useEffect(() => {
    if (userRole === "CUSTOMER") {
      dispatch(getStaffMessageCustomer());
    } else if (userRole) {
      dispatch(getCustomerMessageStaff());
    }
  }, [dispatch, userRole]);

  useEffect(() => {
    if (hasCustomers && !selectedId) {
      setSelectedId(listCustomer[0].sessionId);
    }
  }, [hasCustomers, listCustomer, selectedId]);

  useEffect(() => {
    if (selectedId) {
      dispatch(getMessagesBySession(selectedId));
    }
  }, [dispatch, selectedId]);

  useEffect(() => {
    if (!stompClient || !connected || !userId) {
      return;
    }

    const subscription = stompClient.subscribe(
      `/topic/messages/${userId}`,
      (message) => {
        const newMsg = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMsg]);

        dispatch(
          updateSessionLastMessage({
            sessionId: newMsg.sessionId,
            lastMessageTime: newMsg.timestamp || new Date().toISOString(),
            lastMessage: newMsg.content || newMsg.message || "",
          })
        );

        if (userRole === "STAFF" && newMsg.senderId === userId) {
          const session = listCustomer?.find(
            (c) => c.sessionId === newMsg.sessionId
          );
          if (session && !session.customer.hasStaff) {
            dispatch(
              updateSessionHasStaff({
                sessionId: newMsg.sessionId,
                hasStaff: true,
              })
            );
          }
        }

        if (userRole === "CUSTOMER" && newMsg.senderRole === "STAFF") {
          const session = listCustomer?.find(
            (c) => c.sessionId === newMsg.sessionId
          );
          if (session && !session.customer.hasStaff) {
            dispatch(
              updateSessionHasStaff({
                sessionId: newMsg.sessionId,
                hasStaff: true,
              })
            );
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [stompClient, connected, userId]);

  useEffect(() => {
    setMessages(dataMessage || []);
  }, [dataMessage]);

  useEffect(() => {
    setFileList([]);
    setInput("");
  }, [selectedId]);

  const handleSend = useCallback(
    (newMessage: any) => {
      stompClient?.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(newMessage),
      });
    },
    [stompClient]
  );

  const handlePreview = useCallback((url: string) => {
    setPreviewImage(url);
    setPreviewOpen(true);
  }, []);

  const handleSearch = useCallback(
    (phone: string) => {
      dispatch(searchUserByPhone(phone));
    },
    [dispatch]
  );

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const handleRefreshList = () => {
    dispatch(getCustomerMessageStaff());
  };

  if (!hasCustomers && !loading) {
    return (
      <div className="message-page-container">
        <Empty
          description="Bạn chưa có tin nhắn nào"
          style={{ marginTop: "20%" }}
        />
      </div>
    );
  }

  return (
    <div className="message-page-container">
      <div className="message-page-content">
        <MessageSidebar
          customers={listCustomer}
          selectedId={selectedId}
          onSelectCustomer={setSelectedId}
          onSearchPhone={handleSearch}
          onRefreshList={handleRefreshList}
        />

        <ChatBox
          selectedCustomer={selectedCustomer ?? listCustomer[0]}
          messages={messages}
          input={input}
          setInput={setInput}
          fileList={fileList}
          setFileList={setFileList}
          onSend={handleSend}
          onPreview={handlePreview}
        />
      </div>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={handleClosePreview}
        width="80%"
        centered
      >
        <Image
          alt="preview"
          style={{ width: "100%" }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
}

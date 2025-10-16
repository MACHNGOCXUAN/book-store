"use client";
import React, { useState, useEffect, useContext, use } from "react";
import { Modal, Image } from "antd";
import MessageSidebar from "@/components/messages/MessageSidebar";
import ChatBox from "@/components/messages/ChatBox";
import { customers } from "@/data/mockCustomers";
import { Message, MessageResponse } from "@/types/message.types";
import type { UploadFile } from "antd";
import "@/styles/message.css";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  getCustomerMessageStaff,
  getMessagesBySession,
  getStaffMessageCustomer,
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
  const { user: dataUser } = useAppSelector(state => state.user)
  const userId = user?.userId || "";
  const { client: stompClient, connected } = useStompClient(userId);

  const [searchResult, setSearchResult] = useState<ChatSessionType | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [input, setInput] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [messages, setMessages] = useState<MessageResponse[]>(
    dataMessage || []
  );

  const selectedCustomer = listCustomer.find((c) => c.sessionId === selectedId);

  // danh sach khach hang nhan tin cho nhan vien
  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      console.log("khach hang");
      dispatch(getStaffMessageCustomer());
    } else {
      console.log("nhan vien");
      dispatch(getCustomerMessageStaff());
    }
  }, []);

  // mac dinh se hien thi tin nhan nguoi nhan tin cuoi cung
  useEffect(() => {
    if (listCustomer.length > 0) {
      setSelectedId(listCustomer[0].sessionId);
    }
  }, [listCustomer]);

  // lay danh sach tin nhan cua 1 session
  useEffect(() => {
    if (selectedId) {
      dispatch(getMessagesBySession(selectedId));
    }
  }, [selectedId]);

  // xac nhan tin nhan khi gui va hien thi len giao dien
  useEffect(() => {
    if (!stompClient || !connected || !userId) {
      return;
    }

    // const subscription = stompClient.subscribe(
    //   `/user/${userId}/queue/messages`,
    //   (message) => {

    //     console.log("message send: ", message);

    //     const newMsg = JSON.parse(message.body);

    //     setMessages((prev) => [...prev, newMsg]);
    //   }
    // );

    const subscription = stompClient.subscribe(
      `/topic/messages/${userId}`, // topic riêng cho user
      (message) => {
        const newMsg = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMsg]);
      }
    );

    return () => subscription.unsubscribe();
  }, [stompClient, connected, userId]);

  // set lai input va message khi chon mot khach hang khang nhan tin
  useEffect(() => {
    setMessages(dataMessage || []);
    setFileList([]);
    setInput("");
  }, [selectedId, dataMessage]);

  const handleSend = (newMessage: any) => {
    // setMessages((prev) => [...prev, newMessage]);
    stompClient?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(newMessage),
    });
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewOpen(true);
  };

  const handleSearch = (phone: string) => {
    dispatch(searchUserByPhone(phone))
  }

  return (
    <div className="message-page-container">
      <div className="message-page-content">
        <MessageSidebar
          customers={listCustomer}
          selectedId={selectedId}
          onSelectCustomer={setSelectedId}
          onSearchPhone={handleSearch}
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
        onCancel={() => setPreviewOpen(false)}
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

// File: components/messages/ChatBox.tsx
import React, { useRef, useEffect } from "react";
import type { UploadFile } from "antd";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import FilePreviewArea from "./FilePreviewArea";
import ChatInput from "./ChatInput";
import {
  Customer,
  Message,
  MessageFile,
  MessageResponse,
} from "@/types/message.types";
import { getFileType, formatFileSize } from "@/lib/utils/fileUtils";
import { ChatSessionType } from "@/types/chat-session.type";
import { useAppSelector } from "@/stores/hooks";

interface ChatBoxProps {
  selectedCustomer: ChatSessionType;
  messages: MessageResponse[];
  input: string;
  setInput: (value: string) => void;
  fileList: UploadFile[];
  setFileList: (files: UploadFile[]) => void;
  onSend: (message: Message) => void;
  onPreview: (url: string) => void;
}

export default function ChatBox({
  selectedCustomer,
  messages,
  input,
  setInput,
  fileList,
  setFileList,
  onSend,
  onPreview,
}: ChatBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  console.log("xuanjojno: ", user?.role);
  
  const userId = user?.userId || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  console.log("njnkjnkjnkjn: ", messages);
  console.log("jnjk: ", selectedCustomer);
  console.log("Is admin?:", user?.role === "ADMIN");

  const handleSend = () => {
    if (!input.trim() && fileList.length === 0) return;

    const messageFiles: MessageFile[] = fileList.map((file) => ({
      uid: file.uid,
      name: file.name,
      url: file.thumbUrl || URL.createObjectURL(file.originFileObj as Blob),
      type: getFileType(file),
      size: formatFileSize(file.size),
      thumbUrl: file.thumbUrl,
    }));

    let receiverId = selectedCustomer.customer.userId;
    if (receiverId == userId) {
      receiverId = selectedCustomer.staff.userId;
    }

    const newMsg: any = {
      senderId: userId,
      receiverId: receiverId,
      content: input.trim() || undefined,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sessionId: selectedCustomer.sessionId,
      files: messageFiles.length > 0 ? messageFiles : undefined,
    };

    onSend(newMsg);
    setInput("");
    setFileList([]);
  };

  const removeFile = (uid: string) => {
    setFileList(fileList.filter((f) => f.uid !== uid));
  };

  return (
    <div className="chat-box">
      <ChatHeader customer={selectedCustomer} />

      <MessageList
        messages={messages}
        customerAvatar={
          "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_5_24_638205649868370260_frame-218.png"
        }
        onPreview={onPreview}
        messagesEndRef={messagesEndRef}
      />

      {fileList.length > 0 && (
        <FilePreviewArea fileList={fileList} onRemove={removeFile} />
      )}

      {user?.role !== "ADMIN" && (
        <ChatInput
          input={input}
          setInput={setInput}
          fileList={fileList}
          setFileList={setFileList}
          onSend={handleSend}
          hasContent={!!input.trim() || fileList.length > 0}
        />
      )}
    </div>
  );
}

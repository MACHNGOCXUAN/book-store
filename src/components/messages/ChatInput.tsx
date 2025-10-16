import React from "react";
import { Input, Button, Upload, message as antMessage } from "antd";
import { SendOutlined, PaperClipOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  fileList: UploadFile[];
  setFileList: (files: UploadFile[]) => void;
  onSend: () => void;
  hasContent: boolean;
}

export default function ChatInput({
  input,
  setInput,
  fileList,
  setFileList,
  onSend,
  hasContent,
}: ChatInputProps) {
  const beforeUpload = (file: File) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      antMessage.error('File phải nhỏ hơn 10MB!');
      return false;
    }
    return false;
  };

  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  return (
    <div className="chat-input">
      <Upload
        fileList={[]}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        multiple
        showUploadList={false}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
      >
        <Button 
          type="text" 
          icon={<PaperClipOutlined />}
          className="attach-button"
        />
      </Upload>
      
      <Input
        className="message-input"
        placeholder="Nhập tin nhắn..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={onSend}
        size="large"
        autoFocus
      />
      
      <Button
        type="primary"
        icon={<SendOutlined />}
        className="send-button"
        onClick={onSend}
        size="large"
        disabled={!hasContent}
      >
        Gửi
      </Button>
    </div>
  );
}
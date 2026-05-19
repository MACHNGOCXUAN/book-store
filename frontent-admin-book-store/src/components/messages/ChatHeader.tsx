import React from "react";
import { Avatar, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Customer } from "@/types/message.types";
import { ChatSessionType } from "@/types/chat-session.type";

interface ChatHeaderProps {
  customer: any;
}

export default function ChatHeader({ customer }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        {/* <Badge dot={customer.online} status={customer.online ? "success" : "default"}>
          <Avatar src={customer.avatar} size={44} icon={<UserOutlined />} />
        </Badge> */}
        <div>
          <div className="chat-header-name">{customer?.customer.fullName}</div>
          {/* <div className={`chat-header-status ${customer.online ? 'online' : 'offline'}`}>
            {customer.online ? "● Đang trực tuyến" : "○ Ngoại tuyến"}
          </div> */}
        </div>
      </div>
      <span className="chat-header-badge">Chat hỗ trợ</span>
    </div>
  );
}
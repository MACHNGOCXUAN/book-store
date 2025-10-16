// import React from "react";
// import { Avatar, Badge } from "antd";
// import { UserOutlined } from "@ant-design/icons";
// import { Customer } from "@/types/message.types";

// interface MessageSidebarProps {
//   customers: Customer[];
//   selectedId: number;
//   onSelectCustomer: (id: number) => void;
// }

// export default function MessageSidebar({
//   customers,
//   selectedId,
//   onSelectCustomer,
// }: MessageSidebarProps) {
//   return (
//     <div className="message-sidebar">
//       <div className="message-sidebar-header">
//         Khách hàng cần tư vấn
//       </div>
//       <div className="message-sidebar-list">
//         {customers.map((customer) => (
//           <div
//             key={customer.id}
//             className={`customer-item ${selectedId === customer.id ? "active" : ""}`}
//             onClick={() => onSelectCustomer(customer.id)}
//           >
//             <Badge dot={customer.online} status={customer.online ? "success" : "default"}>
//               <Avatar src={customer.avatar} size={48} icon={<UserOutlined />} />
//             </Badge>
//             <div className="customer-info">
//               <div className="customer-name">{customer.name}</div>
//               <div className="customer-last-message">
//                 {customer.messages[customer.messages.length - 1]?.text || 'Đã gửi file'}
//               </div>
//             </div>
//             <div className="customer-time">
//               {customer.messages[customer.messages.length - 1]?.time}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { Avatar, Badge, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ChatSessionType } from "@/types/chat-session.type";

interface MessageSidebarProps {
  customers: ChatSessionType[];
  selectedId: string;
  onSelectCustomer: (id: string) => void;
  onSearchPhone: (phone: string) => void;
}

export default function MessageSidebar({
  customers,
  selectedId,
  onSelectCustomer,
  onSearchPhone
}: MessageSidebarProps) {

  const [search, setSearch] = useState("")

  const handleSearch = (value: string) => {
    setSearch(value)

    if (value.length === 10) {
      onSearchPhone(value);
    }
  }

  return (
    <div className="message-sidebar">
      <div className="message-sidebar-header">
        Khách hàng cần tư vấn
      </div>
      <div className="message-sidebar-list">
        <Input
          placeholder="Tìm theo số điện thoại và Enter để tạo session"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 8 }}
        />

        {customers.map((session) => (
          <div
            key={session.sessionId}
            className={`customer-item ${selectedId === session.sessionId ? "active" : ""}`}
            onClick={() => onSelectCustomer(session.sessionId)}
          >
            <Badge dot={session.customer.status} status={session.customer.status ? "success" : "default"}>
              <Avatar size={48} icon={<UserOutlined />} />
            </Badge>
            <div className="customer-info">
              <div className="customer-name">{session.customer.userName}</div>
              <div className="customer-last-message">
                {/* Có thể show lastMessage nếu có */}
                {session.lastMessageTime ? "Tin nhắn mới" : "Chưa có tin nhắn"}
              </div>
            </div>
            <div className="customer-time">
              {session.lastMessageTime ? new Date(session.lastMessageTime).toLocaleTimeString() : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

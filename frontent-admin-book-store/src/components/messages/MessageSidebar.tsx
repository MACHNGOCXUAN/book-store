import React, { useState, useMemo, useEffect } from "react";
import { Avatar, Badge, Input, Tabs } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { ChatSessionType } from "@/types/chat-session.type";
import { formatTime } from "@/lib/utils/format";
import { useStompClient } from "@/hooks/useStompClient";
import { useAppSelector } from "@/stores/hooks";

interface MessageSidebarProps {
  customers: ChatSessionType[];
  selectedId: string;
  onSelectCustomer: (id: string) => void;
  onSearchPhone: (phone: string) => void;
  onRefreshList: () => void;
}

export default function MessageSidebar({
  customers,
  selectedId,
  onSelectCustomer,
  onSearchPhone,
  onRefreshList
}: MessageSidebarProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAppSelector((state) => state.auth);

  const userId = user?.userId || "";
  const { client: stompClient, connected } = useStompClient(userId);

  const handleSearch = (value: string) => {
    setSearch(value);

    if (value.length === 10) {
      onSearchPhone(value);
    }
  };

  const categorizedCustomers = useMemo(() => {
    return {
      all: customers,
      pending: customers.filter((session) => !session.customer.hasStaff),
      responded: customers.filter((session) => session.customer.hasStaff),
    };
  }, [customers]);

  useEffect(() => {
  if (!stompClient || !connected) {
    return;
  }

  const subscription = stompClient.subscribe(
    "/topic/session-refresh",
    (message) => {
      console.log("🔄 Nhận session-refresh, cập nhật danh sách...");
      onRefreshList();
    }
  );

  return () => subscription.unsubscribe();
}, [stompClient, connected, onRefreshList]);


  const displayCustomers =
    categorizedCustomers[activeTab as keyof typeof categorizedCustomers];

  const renderCustomerItem = (session: ChatSessionType) => {
    const hasStaff = session.customer.hasStaff;
    return (
      <div
        key={session.sessionId}
        className={`customer-item ${
          selectedId === session.sessionId ? "active" : ""
        } ${!hasStaff ? "pending" : ""}`}
        onClick={() => onSelectCustomer(session.sessionId)}
      >
        <Badge
          dot={session.customer.status}
          status={session.customer.status ? "success" : "default"}
        >
          <Avatar size={48} icon={<UserOutlined />} />
        </Badge>

        <div className="customer-info">
          <div className="customer-name-wrapper">
            <div className="customer-name">{session.customer.fullName}</div>
          </div>
          <div className="customer-last-message">
            {session.lastMessageTime ? session.lastMessage : "Chưa có tin nhắn"}
          </div>
        </div>

        <div className="customer-meta">
          {!hasStaff && <div className="priority-indicator">!</div>}
          <div className="customer-time">
            {formatTime(session.lastMessageTime) ||
              session.lastMessageTime ||
              ""}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="message-sidebar">
      <div className="message-sidebar-header">
        <h3>Khách hàng cần tư vấn</h3>
        <Input
          placeholder="Tìm số điện thoại..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      <Tabs
        style={{ marginLeft: 10 }}
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "all",
            label: `Tất cả (${categorizedCustomers.all.length})`,
          },
          {
            key: "pending",
            label: (
              <span className="tab-with-badge">
                Chờ phản hồi
                {categorizedCustomers.pending.length > 0 && (
                  <Badge
                    count={categorizedCustomers.pending.length}
                    style={{ marginLeft: 8, backgroundColor: "#ff4d4f" }}
                  />
                )}
              </span>
            ),
          },
          {
            key: "responded",
            label: `Đã phản hồi (${categorizedCustomers.responded.length})`,
          },
        ]}
      />

      <div className="message-sidebar-list">
        {displayCustomers.length > 0 ? (
          displayCustomers.map(renderCustomerItem)
        ) : (
          <div className="empty-state">
            <p>Không có khách hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

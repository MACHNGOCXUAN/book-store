// src/components/ChatPopoverWidget.tsx

"use client";

import React, { useState } from 'react';
import chatIcon from '../assets/icon_chat.png'; 
import chatIcon1 from '../assets/icon_chat_1.jpg'; 

import { FloatButton, Popover, Input, Button, Flex, Avatar, Typography } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons'; 

const { Text } = Typography;
const { TextArea } = Input;

const PRIMARY_RED = "#d70018";

const ChatPopoverWidget = () => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  // --- Nội dung cửa sổ Chat ---
  const ChatWindow = (
    <div style={{ width: 340, maxHeight: '70vh', height: 500 }}>
      <Flex vertical justify="space-between" style={{ height: '100%' }}>
        
        {/* 1. Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Flex align="center" justify="space-between">
            <Text strong style={{ fontSize: 18 }}>Hỗ trợ trực tuyến</Text>
            <Button 
              type="text" 
              shape="circle" 
              icon={<CloseOutlined />} 
              onClick={() => setOpen(false)} 
            />
          </Flex>
        </div>

        {/* 2. Body (Khu vực tin nhắn có thể cuộn) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <Flex vertical gap="middle">
            {/* Tin nhắn từ bot */}
            <Flex gap="small" align="flex-start">
              {/* Sửa lại src để hiển thị ảnh */}
              <Avatar src={chatIcon1} style={{ width: 32, height: 32 }} /> 
              <div style={{ background: '#f0f2f5', padding: '8px 12px', borderRadius: '16px' }}>
                <Text>Xin chào! Chúng tôi có thể giúp gì cho bạn?</Text>
              </div>
            </Flex>

            {/* Tin nhắn từ người dùng */}
            <Flex gap="small" align="flex-start" justify="flex-end">
              <div style={{ background: PRIMARY_RED, padding: '8px 12px', borderRadius: '16px' }}>
                <Text style={{ color: "white" }}>Tôi cần tư vấn về sản phẩm.</Text>
              </div>
            </Flex>
            {/* Thêm tin nhắn giả để test scroll */}
            <Flex gap="small" align="flex-start">
              <Avatar src={chatIcon1} style={{ width: 32, height: 32 }} /> 
              <div style={{ background: '#f0f2f5', padding: '8px 12px', borderRadius: '16px' }}>
                <Text>Dạ, bạn vui lòng cho tôi biết bạn đang quan tâm sản phẩm nào ạ?</Text>
              </div>
            </Flex>
             <Flex gap="small" align="flex-start" justify="flex-end">
              <div style={{ background: PRIMARY_RED, padding: '8px 12px', borderRadius: '16px' }}>
                <Text style={{ color: "white" }}>Tôi muốn hỏi về sách "Nhà Giả Kim".</Text>
              </div>
            </Flex>
          </Flex>
        </div>

        {/* 3. Footer (Khu vực nhập liệu) */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          <Flex gap="small">
            <TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder="Nhập tin nhắn..."
              style={{ resize: "none" }}
            />
            <Button type="primary" icon={<SendOutlined />} style={{ backgroundColor: PRIMARY_RED }} /> 
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
      onOpenChange={handleOpenChange}
      placement="topLeft"
      overlayStyle={{ paddingTop: '16px' }}
      // Bỏ title và innerStyle để content tự quản lý hoàn toàn
      overlayInnerStyle={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}
    >
      <FloatButton
        icon={
          <img
            src={chatIcon} // <-- Sửa lại src để hiển thị ảnh
            alt="Chat Icon"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover', // Dùng 'cover' để ảnh lấp đầy nút tròn
              borderRadius: '50%'
            }}
          />
        }
        style={{ 
          right: 32, 
          bottom: 32, 
          width: 58, 
          height: 58,
          // Bỏ màu nền để ảnh nền tự hiển thị
        }}
        tooltip="Trò chuyện với chúng tôi"
      />
    </Popover>
  );
};

export default ChatPopoverWidget;
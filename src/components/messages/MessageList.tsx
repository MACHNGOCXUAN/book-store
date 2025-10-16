import React, { useEffect } from "react";
import { Avatar } from "antd";
import { Message, MessageResponse } from "@/types/message.types";
import MessageBubble from "./MessageBubble";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser } from "@/stores/slices/auth.slice";

const managerAvatar = "https://randomuser.me/api/portraits/men/99.jpg";

interface MessageListProps {
  messages: MessageResponse[];
  customerAvatar: string;
  onPreview: (url: string) => void;
  messagesEndRef: any;
}

export default function MessageList({
  messages,
  customerAvatar,
  onPreview,
  messagesEndRef,
}: MessageListProps) {

  const { user } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  //  useEffect(() => {
  //     dispatch(getProfileUser());
  //   }, [dispatch]);

  return (
    <div className="message-list">
      {messages.map((msg) => {

        let sendType = "customer"
        if(user?.userId === msg.senderId) {
          sendType = "manager"
        }
        return (
          <div
          key={msg.messageId}
          className={`message-wrapper ${sendType === "manager" ? "manager" : "customer"}`}
        >
          {sendType === "customer" && (
            <Avatar 
              src={customerAvatar} 
              size={32} 
              className="message-avatar"
            />
          )}
          
          <MessageBubble
            message={msg}
            onPreview={onPreview}
            sendType={sendType}
          />

          {sendType === "manager" && (
            <Avatar 
              src={managerAvatar} 
              size={32} 
              className="message-avatar"
            />
          )}
        </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
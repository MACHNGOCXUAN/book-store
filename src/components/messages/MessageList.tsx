import React, { useEffect } from "react";
import { Avatar } from "antd";
import { Message, MessageResponse } from "@/types/message.types";
import MessageBubble from "./MessageBubble";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser } from "@/stores/slices/auth.slice";
import { getUserById } from "@/stores/slices/user.slice";

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
  const { user } = useAppSelector((state) => state.auth);
  const { userDetail } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [userMap, setUserMap] = React.useState<{ [key: string]: any }>({});

  //  useEffect(() => {
  //     dispatch(getProfileUser());
  //   }, [dispatch]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (!userMap[msg.senderId]) {
        dispatch(getUserById(msg.senderId)).then((res: any) => {
          setUserMap((prev) => ({ ...prev, [msg.senderId]: res.payload }));
        });
      }
    });
  }, [messages, userMap, dispatch]);

  return (
    <div className="message-list">
      {messages.map((msg) => {
        let sendType = "customer";
        const senderInfo = userMap[msg.senderId];
        let staffName: string | null = null;

        console.log("hjihjhij: ", senderInfo);

        if (senderInfo?.data?.role === "STAFF" && user?.userId !== msg.senderId) {
          sendType = "manager";
          staffName = senderInfo?.data?.fullName
        } else if (user?.userId === msg.senderId) {
          sendType = "manager";
          staffName = null
        }

        return (
          <div
            key={msg.messageId}
            className={`message-wrapper ${
              sendType === "manager" ? "manager" : "customer"
            }`}
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
              staffInfo={staffName}
            />

            {sendType === "manager" && (
              <Avatar
                src={managerAvatar}
                size={32}
                className="message-avatar"
              />
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

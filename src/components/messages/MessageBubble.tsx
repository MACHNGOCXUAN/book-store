import React from "react";
import { Message, MessageResponse } from "@/types/message.types";
import MessageFileItem from "./MessageFileItem";

interface MessageBubbleProps {
  message: MessageResponse;
  onPreview: (url: string) => void;
  sendType: string,
  staffInfo: string | null
}

export default function MessageBubble({ message, onPreview, sendType, staffInfo }: MessageBubbleProps) {
  return (
    <div className="message-bubble-container">
      {staffInfo && (
        <div className={`staff-name ${sendType}`}>
          {staffInfo}
        </div>
      )}
      {message.content && (
        <div className={`message-bubble ${sendType}`}>
          <div className="message-text">{message.content}</div>
        </div>
      )}
      {/* {message.files && message.files.map(file => (
        <MessageFileItem
          key={file.uid}
          file={file}
          onPreview={onPreview}
        />
      ))} */}
      <div className={`message-time ${sendType}`}>
        {message.timestamp}
      </div>
    </div>
  );
}
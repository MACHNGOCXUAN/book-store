import React from "react";
import { Message, MessageResponse } from "@/types/message.types";
import MessageFileItem from "./MessageFileItem";

interface MessageBubbleProps {
  message: MessageResponse;
  onPreview: (url: string) => void;
  sendType: string
}

export default function MessageBubble({ message, onPreview, sendType }: MessageBubbleProps) {
  return (
    <div className="message-bubble-container">
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
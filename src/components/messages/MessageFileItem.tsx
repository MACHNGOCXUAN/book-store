import React from "react";
import { FileOutlined, DownloadOutlined } from "@ant-design/icons";
import { MessageFile } from "@/types/message.types";

interface MessageFileItemProps {
  file: MessageFile;
  onPreview: (url: string) => void;
}

export default function MessageFileItem({ file, onPreview }: MessageFileItemProps) {
  if (file.type === 'image') {
    return (
      <div 
        className="message-file-image"
        onClick={() => onPreview(file.url)}
      >
        <img src={file.url} alt={file.name} />
      </div>
    );
  }

  if (file.type === 'video') {
    return (
      <div className="message-file-video">
        <video src={file.url} controls />
      </div>
    );
  }

  return (
    <div className="message-file-document">
      <FileOutlined className="file-icon" />
      <div className="file-info">
        <div className="file-name">{file.name}</div>
        <div className="file-size">{file.size}</div>
      </div>
      <DownloadOutlined 
        className="file-download"
        onClick={() => window.open(file.url, '_blank')}
      />
    </div>
  );
}
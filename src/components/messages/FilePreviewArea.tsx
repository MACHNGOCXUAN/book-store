import React from "react";
import type { UploadFile } from "antd";
import { CloseOutlined, PlayCircleOutlined, FileOutlined } from "@ant-design/icons";
import { getFileType } from "@/lib/utils/fileUtils";

interface FilePreviewAreaProps {
  fileList: UploadFile[];
  onRemove: (uid: string) => void;
}

export default function FilePreviewArea({ fileList, onRemove }: FilePreviewAreaProps) {
  const renderFilePreview = (file: UploadFile) => {
    const type = getFileType(file);
    const previewUrl = file.thumbUrl || URL.createObjectURL(file.originFileObj as Blob);

    if (type === 'image') {
      return (
        <div key={file.uid} className="file-preview-item image">
          <img src={previewUrl} alt={file.name} />
          <CloseOutlined 
            onClick={() => onRemove(file.uid)}
            className="remove-icon"
          />
        </div>
      );
    }

    if (type === 'video') {
      return (
        <div key={file.uid} className="file-preview-item video">
          <PlayCircleOutlined className="play-icon" />
          <CloseOutlined 
            onClick={() => onRemove(file.uid)}
            className="remove-icon"
          />
        </div>
      );
    }

    return (
      <div key={file.uid} className="file-preview-item document">
        <FileOutlined className="file-type-icon" />
        <div className="file-name-preview">{file.name}</div>
        <CloseOutlined 
          onClick={() => onRemove(file.uid)}
          className="remove-icon"
        />
      </div>
    );
  };

  return (
    <div className="file-preview-area">
      {fileList.map(file => renderFilePreview(file))}
    </div>
  );
}
// File: utils/fileUtils.ts
import type { UploadFile } from "antd";

export const getFileType = (file: UploadFile): 'image' | 'video' | 'file' => {
  const fileType = file.type || '';
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  return 'file';
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
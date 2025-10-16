// File: types/message.types.ts

export interface MessageFile {
  uid: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'file';
  size?: string;
  thumbUrl?: string;
}

export interface Message {
  id: number;
  sender: string;
  text?: string;
  time: string;
  files?: MessageFile[];
}

export interface Customer {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
}

export interface MessageResponse {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  timestamp: string;
  sessionId: string;
  read: boolean;
}
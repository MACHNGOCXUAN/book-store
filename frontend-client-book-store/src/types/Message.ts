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
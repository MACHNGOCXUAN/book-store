import { UserDataType } from "./users";

export interface ChatSessionType {
  sessionId: string;
  customer: UserDataType;
  staff: UserDataType;
  startTime: string;
  lastMessageTime?: string | null;
  active: boolean;
}
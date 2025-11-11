import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ChatContextType {
  openAI: boolean;
  openEmployee: boolean;
  setOpenAI: (value: boolean) => void;
  setOpenEmployee: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [openAI, setOpenAI] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(false);

  const handleSetOpenAI = (value: boolean) => {
    setOpenAI(value);
    if (value) {
      setOpenEmployee(false); // Đóng chat Employee khi mở AI
    }
  };

  const handleSetOpenEmployee = (value: boolean) => {
    setOpenEmployee(value);
    if (value) {
      setOpenAI(false); // Đóng chat AI khi mở Employee
    }
  };

  return (
    <ChatContext.Provider
      value={{
        openAI,
        openEmployee,
        setOpenAI: handleSetOpenAI,
        setOpenEmployee: handleSetOpenEmployee,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

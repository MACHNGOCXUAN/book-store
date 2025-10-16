"use client"
import SocketIoClient from "@/lib/utils/socket-client";
import React, { createContext, useRef, useState } from "react";

import envConfig from "@/config";

interface SocketIoContextValue {
  socketIoClient: SocketIoClient | null;
  connected: boolean;
}
export const socketIoContext = createContext<SocketIoContextValue>({
  socketIoClient: null,
  connected: false,
});

interface Props {
  children: React.ReactNode;
}

export function ProvideSocketIoClient({ children }: Props) {
  const socketIo = useProvideSocketIoClient();
  return (
    <socketIoContext.Provider
      value={{
        socketIoClient: socketIo?.client || null,
        connected: socketIo?.connected || false,
      }}
    >
      {children}
    </socketIoContext.Provider>
  );
}
function useProvideSocketIoClient() {
  const clientRef = useRef<SocketIoClient | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  if (typeof window === "undefined") return;
  const url = envConfig.NEXT_PUBLIC_API_ENDPOINT + "/ws-chat" || "";

  console.log("xuan: ", url);
  
  const config = {
    url: url,
    token: "",
  };

  if (!clientRef.current) {
    clientRef.current = new SocketIoClient(config);
    clientRef.current.on("connect", () => {
      setConnected(true);
      console.log("Socket.io client connected");
    });
    clientRef.current.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.io client disconnected");
    });
  }
  return { client: clientRef.current, connected }; // Return the existing instance if it exists
}
import { useAppSelector } from "../hooks/hooks";
import ChatEmail from "./ChatEmail";
import ChatWithAI from "./ChatWithAI";
import ChatWithEmployee from "./ChatWithStaff";
import IconMap from "./IconMap";

const ChatStack = () => {
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        padding: "20px",
        gap: "12px",
        pointerEvents: "none", // Cho phép các element con nhận events
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <ChatEmail />
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <IconMap />
      </div>
      {isAuthenticated && (
        <div style={{ pointerEvents: "auto" }}>
          <ChatWithEmployee />
        </div>
      )}
      <div style={{ pointerEvents: "auto" }}>
        <ChatWithAI />
      </div>
    </div>
  );
};

export default ChatStack;

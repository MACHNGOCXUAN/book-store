"use client";
import chatIcon from "../assets/iconaddress.png";

const ChatPopoverWidget = () => {
  return (
    <div style={{ position: "relative" }}>
      {/* Chat Button */}
      <button
        onClick={() =>
          window.open("https://maps.app.goo.gl/jnQTBGxv6Nvw6fBg9", "_blank")
        }
        title="Địa chỉ chi tiết"
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: "white",
          transition: "transform 0.2s",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1)";
        }}
      >
        <img
          src={chatIcon}
          alt="Chat Icon"
          style={{
            width: "80%",
            height: "80%",
            objectFit: "cover",
          }}
        />
      </button>
    </div>
  );
};

export default ChatPopoverWidget;

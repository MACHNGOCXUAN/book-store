"use client";
import chatIcon from "../assets/iconemail.png";

import { Form } from "antd";

const ChatPopoverWidget = () => {
  const [form] = Form.useForm();
  const handleClick = () => {
    const recipient = "support@bookstore.vn";
    const mailBody = encodeURIComponent(`Xin chào BookStore.`);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&body=${mailBody}`;
    window.open(gmailUrl, "_blank");

    form.resetFields();
  };
  return (
    <div style={{ position: "relative" }}>
      {/* Chat Button */}
      <button
        onClick={() => handleClick()}
        title="Gửi Mail"
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

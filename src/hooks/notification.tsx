"use client";
import { notification } from "antd";

export type NotificationType = "success" | "info" | "warning" | "error";

export const useMyNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (type: NotificationType, message: string, description?: string) => {
    api[type]({
      message,
      description,
    });
  };

  return { openNotification, contextHolder };
};

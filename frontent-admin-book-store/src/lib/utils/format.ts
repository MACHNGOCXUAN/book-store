// format tiền tệ ví dụ: 1000000 -> 1.000.000 ₫
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format ngày giờ
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return "";

  try {
    let date: Date;
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      const today = new Date();
      const [hours, minutes] = timeString.split(":").map(Number);
      date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes
      );
    } else {
      date = new Date(timeString);
    }

    if (isNaN(date.getTime())) {
      console.warn("Invalid date format:", timeString);
      return "";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) {
      return "Vừa xong";
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút`;
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch (error) {
    console.error("Lỗi format time:", error);
    return "";
  }
};

export const normalizeTimestamp = (timestamp: string | undefined): string => {
  if (!timestamp) return new Date().toISOString();

  try {
    return new Date(timestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

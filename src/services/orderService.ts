const API_BASE = "http://localhost:8080/api/orders/createOrder";

export const orderService = {
    // Hàm gọi API tạo đơn hàng bằng fetch
    createOrder: async (payload: any): Promise<any> => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }
  
      const response = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Đặt hàng thất bại");
      }
  
      return data;
    }
};

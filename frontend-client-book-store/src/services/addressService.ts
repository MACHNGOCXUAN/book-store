import type { Address } from "../types/Address";

const API_BASE = "http://DESKTOP-GL3I116:8080/api/addresses";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Transform backend response to frontend Address type
const transformAddress = (data: any): Address => {
  return {
    id: data.id,
    receiverName: data.receiverName,
    receiverPhone: data.receiverPhone,
    main: data.main,
    province: data.province,
    district: data.district,
    ward: data.ward,
    specifics: data.specifics,
    isDefault: data.main === 1, // main = 1 means default, main = 0 means not default
  };
};

export const addressService = {
  // Lấy tất cả địa chỉ của customer
  async getAddressesByCustomer(customerId: string): Promise<Address[]> {
    const response = await fetch(`${API_BASE}/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch addresses");
    const data = await response.json();
    return data.map(transformAddress);
  },

  // Lấy địa chỉ mặc định
  async getDefaultAddress(customerId: string): Promise<Address | null> {
    const response = await fetch(`${API_BASE}/customer/${customerId}/default`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch default address");
    return response.json();
  },

  // Lấy địa chỉ theo ID
  async getAddressById(addressId: number): Promise<Address | null> {
    const response = await fetch(`${API_BASE}/${addressId}`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch address");
    return response.json();
  },

  // Thêm địa chỉ mới
  async createAddress(customerId: string, address: Address): Promise<Address> {
    const response = await fetch(`${API_BASE}/customer/${customerId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(address),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to create address");
    }
    return response.json();
  },

  // Cập nhật địa chỉ
  async updateAddress(
    customerId: string,
    addressId: number,
    address: Address
  ): Promise<Address> {
    const response = await fetch(
      `${API_BASE}/customer/${customerId}/${addressId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(address),
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to update address");
    }
    return response.json();
  },

  // Xóa địa chỉ
  async deleteAddress(customerId: string, addressId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE}/customer/${customerId}/${addressId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to delete address");
    }
    return true;
  },

  // Đặt địa chỉ làm mặc định
  async setDefaultAddress(
    customerId: string,
    addressId: number
  ): Promise<Address> {
    const response = await fetch(
      `${API_BASE}/customer/${customerId}/${addressId}/set-default`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to set default address");
    }
    return response.json();
  },
};

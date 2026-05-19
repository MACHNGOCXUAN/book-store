/**
 * Address Redux Feature
 * Quản lý địa chỉ giao hàng của người dùng
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Address } from "../../types/Address";

const API_BASE = "http://DESKTOP-GL3I116:8080/api/addresses";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

/* ==================== State Type ==================== */
type AddressState = {
  addresses: Address[];
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
};

const initialState: AddressState = {
  addresses: [],
  defaultAddress: null,
  loading: false,
  error: null,
};

/* ==================== Async Thunks ==================== */

/**
 * Fetch all addresses for a customer
 */
export const getAddresses = createAsyncThunk<
  Address[],
  string,
  { rejectValue: string }
>("addresses/getAddresses", async (customerId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE}/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      return rejectWithValue("Failed to fetch addresses");
    }
    const data = await response.json();
    return data.map(transformAddress);
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching addresses");
  }
});

/**
 * Fetch default address for a customer
 */
export const getDefaultAddress = createAsyncThunk<
  Address | null,
  string,
  { rejectValue: string }
>(
  "addresses/getDefaultAddress",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/customer/${customerId}/default`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.status === 404) return null;
      if (!response.ok) {
        return rejectWithValue("Failed to fetch default address");
      }
      const data = await response.json();
      return transformAddress(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching default address");
    }
  }
);

/**
 * Fetch address by ID
 */
export const getAddressById = createAsyncThunk<
  Address | null,
  number,
  { rejectValue: string }
>(
  "addresses/getAddressById",
  async (addressId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/${addressId}`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 404) return null;
      if (!response.ok) {
        return rejectWithValue("Failed to fetch address");
      }
      const data = await response.json();
      return transformAddress(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching address");
    }
  }
);

/**
 * Create new address
 */
export const createAddress = createAsyncThunk<
  Address,
  { customerId: string; address: Address },
  { rejectValue: string }
>(
  "addresses/createAddress",
  async ({ customerId, address }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/customer/${customerId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(address),
      });
      if (!response.ok) {
        const error = await response.text();
        return rejectWithValue(error || "Failed to create address");
      }
      const data = await response.json();
      return transformAddress(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error creating address");
    }
  }
);

/**
 * Update address
 */
export const updateAddress = createAsyncThunk<
  Address,
  { customerId: string; addressId: number; address: Address },
  { rejectValue: string }
>(
  "addresses/updateAddress",
  async ({ customerId, addressId, address }, { rejectWithValue }) => {
    try {
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
        return rejectWithValue(error || "Failed to update address");
      }
      const data = await response.json();
      return transformAddress(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error updating address");
    }
  }
);

/**
 * Delete address
 */
export const deleteAddress = createAsyncThunk<
  number,
  { customerId: string; addressId: number },
  { rejectValue: string }
>(
  "addresses/deleteAddress",
  async ({ customerId, addressId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/customer/${customerId}/${addressId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        const error = await response.text();
        return rejectWithValue(error || "Failed to delete address");
      }
      return addressId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error deleting address");
    }
  }
);

/**
 * Set address as default
 */
export const setDefaultAddress = createAsyncThunk<
  Address,
  { customerId: string; addressId: number },
  { rejectValue: string }
>(
  "addresses/setDefaultAddress",
  async ({ customerId, addressId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/customer/${customerId}/${addressId}/set-default`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        const error = await response.text();
        return rejectWithValue(error || "Failed to set default address");
      }
      const data = await response.json();
      return transformAddress(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error setting default address");
    }
  }
);

/* ==================== Slice ==================== */

const addressSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Addresses
    builder
      .addCase(getAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch addresses";
      });

    // Get Default Address
    builder
      .addCase(getDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultAddress = action.payload;
      })
      .addCase(getDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch default address";
      });

    // Get Address By ID
    builder.addCase(getAddressById.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch address";
    });

    // Create Address
    builder
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create address";
      });

    // Update Address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index >= 0) {
          state.addresses[index] = action.payload;
        }
        if (state.defaultAddress?.id === action.payload.id) {
          state.defaultAddress = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update address";
      });

    // Delete Address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter(
          (a) => a.id !== action.payload
        );
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete address";
      });

    // Set Default Address
    builder
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        // Update all addresses - set isDefault
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a.id === action.payload.id,
        }));
        state.defaultAddress = action.payload;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to set default address";
      });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;

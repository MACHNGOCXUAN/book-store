import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../config/api";
import type { Banner } from "../../types/Banner";

// Async thunk để lấy tất cả banner visible
export const fetchVisibleBanners = createAsyncThunk(
    'banner/fetchVisible',
    async (_, { getState }) => {
        const state = getState() as { auth: { token: string | null } };
        const token = state.auth.token;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/banners/visible`, {
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch banners');
        }
        return (await response.json()) as Banner[];
    }
);

interface BannerState {
    banners: Banner[];
    loading: boolean;
    error: string | null;
}

const initialState: BannerState = {
    banners: [],
    loading: false,
    error: null,
};

const bannerSlice = createSlice({
    name: 'banner',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVisibleBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVisibleBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload;
            })
            .addCase(fetchVisibleBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch banners';
            });
    },
});

export default bannerSlice.reducer;


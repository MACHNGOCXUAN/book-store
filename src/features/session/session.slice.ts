/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { MessageResponse } from "../../types/Message";
import { API_BASE } from "../../config/api";

type initialStateType = {
  loading?: boolean;
  messages?: MessageResponse[] | null;
  chatSession?: any
};

const initialState: initialStateType = {
  loading: false,
};

export const getMessagesBySession = createAsyncThunk<
  { data: MessageResponse[] },
  string,
  { rejectValue: string }
>("session/getMessagesBySession", async (session_id, thunkAPI) => {
  try {
    const response = await fetch(`${API_BASE}/messages/session/${session_id}`);
    if (!response.ok) return thunkAPI.rejectWithValue(`HTTP error! status: ${response.status}`);
    const data = await response.json() as { data: MessageResponse[] };
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const getChatSessionByCustomerId = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>(
  "session/getChatSessionByCustomerId",
  async (userId, thunkAPI) => {
    try {
      const response = await fetch(`${API_BASE}/messages/chat-session/user/${userId}`);

      if (!response.ok) {
        return thunkAPI.rejectWithValue(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMessagesBySession.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMessagesBySession.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data;
      })
      .addCase(getMessagesBySession.rejected, (state) => {
        state.loading = false;
        state.messages = null;
      });

    builder
      .addCase(getChatSessionByCustomerId.pending, state => {
        state.loading = true;
      })
      .addCase(getChatSessionByCustomerId.fulfilled, (state, action) => {
        state.loading = false;
        state.chatSession = action.payload.data
      })
      .addCase(getChatSessionByCustomerId.rejected, (state) => {
        state.loading = false;
        state.chatSession = null;
      });
  },
});

export default sessionSlice.reducer;

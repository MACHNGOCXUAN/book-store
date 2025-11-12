import http from "@/lib/utils/api";
import { ChatSessionType } from "@/types/chat-session.type";
import { MessageResponse } from "@/types/message.types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const getCustomerMessageStaff = createAsyncThunk(
  "session/getCustomerMessageStaff",
  async () => {
    const response = await http.get("messages/staff/customers");
    return response;
  }
);

export const getMessagesBySession = createAsyncThunk(
  "session/getMessagesBySession",
  async (seesion_id: string) => {
    const response = await http.get(`messages/session/${seesion_id}`);
    return response;
  }
);

export const getStaffMessageCustomer = createAsyncThunk(
  "session/getStaffMessageCustomer",
  async () => {
    const response = await http.get("messages/staff/customers/staff");
    return response;
  }
);

type initialStateType = {
  loading: Boolean;
  listCustomer: ChatSessionType[];
  messages?: MessageResponse[];
};

const initialState: initialStateType = {
  loading: false,
  listCustomer: [],
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    updateSessionHasStaff: (
      state,
      action: PayloadAction<{ sessionId: string; hasStaff: boolean }>
    ) => {
      const { sessionId, hasStaff } = action.payload;
      const session = state.listCustomer.find((s) => s.sessionId === sessionId);

      if (session) {
        session.customer.hasStaff = hasStaff;
      }
    },

    updateSessionLastMessage: (
      state,
      action: PayloadAction<{
        sessionId: string;
        lastMessageTime: string;
        lastMessage?: string;
      }>
    ) => {
      const { sessionId, lastMessageTime, lastMessage } = action.payload;
      const session = state.listCustomer.find((s) => s.sessionId === sessionId);

      if (session) {
        session.lastMessageTime = lastMessageTime;
        if (lastMessage !== undefined) {
          session.lastMessage = lastMessage;
        }
        state.listCustomer.sort((a, b) => {
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return timeB - timeA;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomerMessageStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCustomerMessageStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.listCustomer = action.payload.data;
      })
      .addCase(getCustomerMessageStaff.rejected, (state) => {
        state.loading = false;
        state.listCustomer = [];
      });

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
      });

    builder
      .addCase(getStaffMessageCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStaffMessageCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.listCustomer = action.payload.data;
      })
      .addCase(getStaffMessageCustomer.rejected, (state) => {
        state.loading = false;
        state.listCustomer = [];
      });
  },
});

export default sessionSlice.reducer;
export const { updateSessionHasStaff, updateSessionLastMessage } =
  sessionSlice.actions;

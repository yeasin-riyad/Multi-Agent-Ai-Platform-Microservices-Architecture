import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    artifacts: [],
    isLoading: false,
    hasArtifacts: false,   // ⭐ নতুন — sidebar trigger
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);

      // ⭐ Message-এ artifacts থাকলে flag set করো
      if (
        action.payload?.artifacts &&
        action.payload.artifacts.length > 0
      ) {
        state.hasArtifacts = true;
      }
    },
    setArtifacts: (state, action) => {
      state.artifacts = action.payload;
      state.hasArtifacts =
        Array.isArray(action.payload) && action.payload.length > 0;
    },
    setHasArtifacts: (state, action) => {
      state.hasArtifacts = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setArtifacts,
  setHasArtifacts,
  setLoading,
} = messageSlice.actions;

export default messageSlice.reducer;
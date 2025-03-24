import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfigState {
  backendUrl: string | null;
  socketUrl: string | null;
}

const initialState: ConfigState = {
  backendUrl: null,
  socketUrl: null,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setBackendUrl(state, action: PayloadAction<string>) {
      state.backendUrl = action.payload;
    },
    setSocketUrl(state, action: PayloadAction<string>) {
      state.socketUrl = action.payload;
    },
  },
});

export const { setBackendUrl, setSocketUrl } = configSlice.actions;

export default configSlice;

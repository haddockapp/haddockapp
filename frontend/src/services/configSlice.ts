import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface ConfigState {
  backendUrl: string;
}

const initialState: ConfigState = {
  backendUrl: await axios
    .get("./config.json")
    .then((res) => res.data.backendUrl),
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setBackendUrl(state, action: PayloadAction<string>) {
      state.backendUrl = action.payload;
    },
  },
});

export const { setBackendUrl } = configSlice.actions;

export default configSlice;

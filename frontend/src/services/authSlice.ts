import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface AuthState {
  isAuth: boolean;
  token: string | null;
  clientId: string | null;
}

const initialState: AuthState = {
  isAuth: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  clientId: localStorage.getItem("clientId"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      localStorage.removeItem("clientId");
      state.isAuth = false;
      state.token = null;
      state.clientId = null;
    },
    setToken(state, action: PayloadAction<string>) {
      state.isAuth = true;
      state.token = action.payload;
      state.clientId = uuidv4();
      localStorage.setItem("token", action.payload);
      localStorage.setItem("clientId", state.clientId);
    },
  },
});

export const { logout, setToken } = authSlice.actions;

export default authSlice;

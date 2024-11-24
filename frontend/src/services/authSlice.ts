import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuth: boolean;
  token: string | null;
  setupStep: number;
}

const initialState: AuthState = {
  isAuth: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  setupStep: +(localStorage.getItem("setupStep") ?? 0),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      state.isAuth = false;
      state.token = null;
      state.setupStep = 0;
      localStorage.setItem("setupStep", state.setupStep.toString());
    },
    setToken(state, action: PayloadAction<string>) {
      localStorage.setItem("token", action.payload);
      state.isAuth = true;
      state.token = action.payload;
    },
    nextSetupStep(state) {
      state.setupStep += 1;
      localStorage.setItem("setupStep", state.setupStep.toString());
    },
  },
});

export const { logout, setToken, nextSetupStep } = authSlice.actions;

export default authSlice;

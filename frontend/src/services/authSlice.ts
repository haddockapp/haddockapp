import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuth: boolean;
  token: string | null;
}

const initialState: AuthState = {
  isAuth: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      state.isAuth = false;
      state.token = null;
    },
    setToken(state, action: PayloadAction<string>) {
      localStorage.setItem("token", action.payload);
      state.isAuth = true;
      state.token = action.payload;
    },
  },
});

export const { logout, setToken } = authSlice.actions;

export default authSlice;

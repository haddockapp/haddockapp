import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuth: boolean;
  token: string | null;
  isSetupComplete: boolean;
}

const initialState: AuthState = {
  isAuth: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  /* We are using localStorage because we want to know whether
  the user has completed the setup process even when they are not logged in
  and therefore can't access the backend (GET /domains). 
  This is useful to immediately redirect to the correct page
  after the user logs ins */
  isSetupComplete: localStorage.getItem("isSetupComplete") === "true",
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
    setSetupCompletion(state, action: PayloadAction<boolean>) {
      state.isSetupComplete = action.payload;
      if (action.payload == true) {
        localStorage.setItem("isSetupComplete", "true");
      } else {
        localStorage.setItem("isSetupComplete", "false");
      }
    },
  },
});

export const { logout, setToken, setSetupCompletion } = authSlice.actions;

export default authSlice;

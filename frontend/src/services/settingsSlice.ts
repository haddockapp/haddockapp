import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

interface SettingsState {
  theme: Theme;
}

const initialState: SettingsState = {
  theme: (localStorage.getItem("theme") as Theme) || Theme.LIGHT,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      document.body.classList.remove(state.theme);
      document.body.classList.add(action.payload);
      localStorage.setItem("theme", action.payload);
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = settingsSlice.actions;

export default settingsSlice;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Theme {
    LIGHT = "light",
    DARK = "dark",
}

interface SettingsState {
    theme: Theme;
    showCommands: boolean;
}

const initialState: SettingsState = {
    theme: (localStorage.getItem("theme") as Theme) || Theme.DARK,
    showCommands: localStorage.getItem("showCommands") === "true",
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
        toggleShowCommands: (state) => {
            const newValue = !state.showCommands;
            localStorage.setItem("showCommands", newValue ? "true" : "false");
            state.showCommands = newValue;
        },
    },
});

export const { setTheme, toggleShowCommands } = settingsSlice.actions;

export default settingsSlice;

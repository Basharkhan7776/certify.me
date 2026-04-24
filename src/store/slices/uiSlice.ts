import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  activeTab: "my-certs" | "minted";
  sidebarCollapsed: boolean;
}

const initialState: UIState = {
  activeTab: "my-certs",
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<"my-certs" | "minted">) {
      state.activeTab = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setActiveTab, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;

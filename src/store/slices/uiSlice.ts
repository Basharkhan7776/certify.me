import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  activeTab: "my-certs" | "minted";
  sidebarCollapsed: boolean;
  mintDialogOpen: boolean;
}

const initialState: UIState = {
  activeTab: "my-certs",
  sidebarCollapsed: false,
  mintDialogOpen: false,
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
    setMintDialogOpen(state, action: PayloadAction<boolean>) {
      state.mintDialogOpen = action.payload;
    },
  },
});

export const { setActiveTab, toggleSidebar, setMintDialogOpen } = uiSlice.actions;
export default uiSlice.reducer;

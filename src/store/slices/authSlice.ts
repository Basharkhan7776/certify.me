import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    id: string;
    name?: string;
    email?: string;
    walletAddr?: string;
    blocked: boolean;
  } | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState["user"]>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setWalletAddr(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.walletAddr = action.payload;
      }
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setWalletAddr, clearUser } = authSlice.actions;
export default authSlice.reducer;

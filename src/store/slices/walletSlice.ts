import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: `0x${string}` | null;
  chainId: number | null;
  isConnected: boolean;
}

const initialState: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<{ address: `0x${string}`; chainId: number }>) {
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.isConnected = true;
    },
    disconnect(state) {
      state.address = null;
      state.chainId = null;
      state.isConnected = false;
    },
  },
});

export const { setConnected, disconnect } = walletSlice.actions;
export default walletSlice.reducer;

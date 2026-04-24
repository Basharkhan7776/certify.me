import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MintingState {
  studentAddr: string;
  certName: string;
  certDescription: string;
  issueDate: string;
  expiryDate: string;
  attributes: { trait_type: string; value: string }[];
  status: "idle" | "uploading" | "minting" | "success" | "error";
  error?: string;
}

const initialState: MintingState = {
  studentAddr: "",
  certName: "",
  certDescription: "",
  issueDate: "",
  expiryDate: "",
  attributes: [],
  status: "idle",
};

export const mintingSlice = createSlice({
  name: "minting",
  initialState,
  reducers: {
    setField(state, action: PayloadAction<Partial<MintingState>>) {
      Object.assign(state, action.payload);
    },
    addAttribute(state, action: PayloadAction<{ trait_type: string; value: string }>) {
      state.attributes.push(action.payload);
    },
    removeAttribute(state, action: PayloadAction<number>) {
      state.attributes.splice(action.payload, 1);
    },
    setStatus(state, action: PayloadAction<MintingState["status"]>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
    reset(state) {
      return initialState;
    },
  },
});

export const { setField, addAttribute, removeAttribute, setStatus, setError, reset } = mintingSlice.actions;
export default mintingSlice.reducer;

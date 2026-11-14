import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { resetApp } from "@/store/resetAction";
import type { SharedState } from "@/types";

const initialState: SharedState = {
  notification: null,
  header: { route: "", title: "" },
};

type Update = {
  [K in keyof SharedState]-?: { actualState: K; newState: SharedState[K] };
}[keyof SharedState];

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    updateSharedState: (state, { payload }: PayloadAction<Update>) => {
      (state as Record<string, unknown>)[payload.actualState] = payload.newState;
    },
  },
  extraReducers: (b) => b.addCase(resetApp, () => initialState),
});

export const { updateSharedState } = sharedSlice.actions;
export default sharedSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { resetApp } from "@/store/resetAction";
import type { AuthState } from "@/types";

// Never persisted: the profile and role are refetched on every load, so a restricted role can't
// reload its way past the route guard with a stale cached role.
const initialState: AuthState = {
  user: null,
  organizations: [],
  activeOrganization: null,
};

type Update = {
  [K in keyof AuthState]-?: { actualState: K; newState: AuthState[K] };
}[keyof AuthState];

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthState: (state, { payload }: PayloadAction<Update>) => {
      (state as Record<string, unknown>)[payload.actualState] = payload.newState;
    },
  },
  extraReducers: (b) => b.addCase(resetApp, () => initialState),
});

export const { updateAuthState } = authSlice.actions;
export default authSlice.reducer;

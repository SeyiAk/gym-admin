import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { resetApp } from "@/store/resetAction";
import type { ScopeState } from "@/types";

/**
 * The branch the dashboard is looking at. null means "All branches" (organization scope), which the
 * API only allows for OWNER / GENERAL_MANAGER. Persisted to localStorage: it's a harmless preference.
 */
const initialState: ScopeState = { branchId: null };

const scopeSlice = createSlice({
  name: "scope",
  initialState,
  reducers: {
    setBranch: (state, { payload }: PayloadAction<string | null>) => {
      state.branchId = payload;
    },
  },
  extraReducers: (b) => b.addCase(resetApp, () => initialState),
});

export const { setBranch } = scopeSlice.actions;
export default scopeSlice.reducer;

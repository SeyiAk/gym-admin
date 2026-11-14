import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import scopeReducer from "./slices/scopeSlice";
import sharedReducer from "./slices/sharedSlice";

// Persistence is opt-in per slice. Fetched records, the user and tokens are never persisted here.
const scopePersistConfig = { key: "scope", storage, whitelist: ["branchId"] };

const rootReducer = combineReducers({
  shared: sharedReducer,
  auth: authReducer,
  scope: persistReducer(scopePersistConfig, scopeReducer),
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";

const persisted = persistReducer({ key: "root", storage, whitelist: [] }, rootReducer);

export const store = configureStore({
  reducer: persisted,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

import { createAction } from "@reduxjs/toolkit";

/** Dispatched on logout; every slice returns to its initial state. */
export const resetApp = createAction("app/reset");

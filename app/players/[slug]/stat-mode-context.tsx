"use client";

import { createContext, useContext } from "react";
import type { StatMode } from "../../components/court-data";

// The player page's selected stat mode, for parts streamed in from the server
// (similar players) that render inside the client profile.
export const StatModeContext = createContext<StatMode>("career");

export function useStatMode() {
  return useContext(StatModeContext);
}

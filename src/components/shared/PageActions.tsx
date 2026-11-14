import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const PAGE_ACTIONS_ID = "page-actions";

/** Lets a page put buttons (e.g. "Add Member") into the shared header, left of the search bar. */
export function PageActions({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById(PAGE_ACTIONS_ID)), []);
  return target ? createPortal(children, target) : null;
}

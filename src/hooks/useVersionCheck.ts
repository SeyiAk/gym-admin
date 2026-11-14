import { useEffect, useRef } from "react";

/** Polls /version.json; when a new deploy lands, open tabs hard-reload instead of running stale chunks. */
export function useVersionCheck(intervalMs = 10_000) {
  const current = useRef<string | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version: string };
        if (current.current && current.current !== version) window.location.reload();
        current.current = version;
      } catch {
        // Offline or mid-deploy; try again next tick.
      }
    };
    check();
    const id = window.setInterval(check, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
}

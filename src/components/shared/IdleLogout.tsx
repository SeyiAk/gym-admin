import { Clock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
import { ActionModal } from "./modalForm/ActionModal";

const IDLE_MS = 5 * 60_000;
const WARNING_S = 90;
const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

/** 5 minutes idle → 90s warning → logout. Enabled by VITE_APP_FEATURE_ENABLED. */
export function IdleLogout() {
  const logout = useLogout();
  const [warning, setWarning] = useState(false);
  const [seconds, setSeconds] = useState(WARNING_S);
  const idleTimer = useRef<number>(0);

  const reset = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setSeconds(WARNING_S);
      setWarning(true);
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    if (warning) return;
    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(idleTimer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [warning, reset]);

  useEffect(() => {
    if (!warning) return;
    if (seconds <= 0) {
      logout();
      return;
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [warning, seconds, logout]);

  return (
    <ActionModal
      open={warning}
      onOpenChange={(o) => !o && setWarning(false)}
      icon={<Clock className="size-5" />}
      title="Are you still there?"
      description={`For your security you'll be logged out in ${seconds}s.`}
      onSubmit={() => setWarning(false)}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={() => logout()}>
            Log out
          </Button>
          <Button type="submit">I'm still here</Button>
        </div>
      }
    />
  );
}

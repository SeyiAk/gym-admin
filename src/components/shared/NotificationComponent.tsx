import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { cn } from "@/lib/utils";
import { updateSharedState } from "@/store/slices/sharedSlice";
import { NotificationType } from "@/types";

const STYLES = {
  [NotificationType.success]: {
    icon: CheckCircle2,
    cls: "from-[#223a22] to-surface text-appPrimary border-appPrimary/30",
  },
  [NotificationType.error]: {
    icon: XCircle,
    cls: "from-[#3a2222] to-surface text-danger border-danger/30",
  },
  [NotificationType.info]: {
    icon: Info,
    cls: "from-[#1f2b3d] to-surface text-info border-info/30",
  },
};

/** Global toast. Bottom-right so it never covers the header or the sidebar's gym switcher. Clears after 7s. */
export function NotificationComponent() {
  const dispatch = useAppDispatch();
  const notification = useAppSelector((s) => s.shared.notification);
  const clear = () => dispatch(updateSharedState({ actualState: "notification", newState: null }));

  useEffect(() => {
    if (!notification) return;
    const id = window.setTimeout(clear, 7000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  const style = notification ? STYLES[notification.type] : null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] w-[min(26rem,calc(100vw-3rem))]">
      <AnimatePresence>
        {notification && style && (
          <motion.div
            key={notification.message}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-gradient-to-r p-4 shadow-2xl",
              style.cls,
            )}
          >
            <style.icon className="mt-0.5 size-5 shrink-0" />
            <p className="flex-1 text-base text-white">{notification.message}</p>
            <button onClick={clear} className="text-muted hover:text-white" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

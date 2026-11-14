import { NotificationComponent } from "@/components/shared/NotificationComponent";
import { useVersionCheck } from "@/hooks/useVersionCheck";

export function AppLayout({ children }: { children: React.ReactNode }) {
  useVersionCheck();
  return (
    <>
      <NotificationComponent />
      {children}
    </>
  );
}

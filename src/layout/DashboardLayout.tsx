import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { CardSkeleton } from "@/components/shared/CardSkeleton";
import { HeaderBar } from "@/components/shared/HeaderBar";
import { IdleLogout } from "@/components/shared/IdleLogout";
import { Sidebar } from "@/components/shared/Sidebar";
import { useBootstrapSession } from "@/hooks/auth/useAuth";
import { clearSession } from "@/hooks/useLogout";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { resetApp } from "@/store/resetAction";
import { NotificationType } from "@/types";
import { canAccessPath, getLandingPath } from "@/utils/roleAccess";
import { checkToken, getAccessToken, getRefreshToken, tokenExpired } from "@/utils/token";

export const REDIRECT_KEY = "redirectAfterLogin";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const bootstrap = useBootstrapSession();
  const { user, activeOrganization } = useAppSelector((s) => s.auth);
  const [bootError, setBootError] = useState(false);
  const booting = useRef(false);
  const role = activeOrganization?.role;

  const hardLogout = (message?: string) => {
    if (location.pathname !== "/")
      sessionStorage.setItem(REDIRECT_KEY, location.pathname + location.search);
    dispatch(resetApp());
    queryClient.clear();
    clearSession();
    if (message) notify(message, NotificationType.error);
    navigate("/", { replace: true });
  };

  // Fired by the axios layer when a refresh fails or the server returns 401.
  useEffect(() => {
    const onLogout = () => hardLogout("Your session has expired. Please log in again.");
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // The profile isn't persisted. Fetch it before rendering children: rendering before the role is
  // known would let a restricted role bypass the route guard by reloading.
  useEffect(() => {
    if (user || booting.current || tokenExpired(getRefreshToken())) return;
    booting.current = true;
    bootstrap()
      .catch((err) => {
        setBootError(true);
        hardLogout(errorMessage(err));
      })
      .finally(() => {
        booting.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Session check on every route change and every 60s.
  useEffect(() => {
    const check = () => {
      if (tokenExpired(getRefreshToken()))
        return hardLogout("Your session has expired. Please log in again.");
      if (tokenExpired(getAccessToken()))
        checkToken().catch(() => hardLogout("Your session has expired. Please log in again."));
    };
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Route guard.
  useEffect(() => {
    if (!role) return;
    if (!canAccessPath(role, location.pathname)) {
      notify("You don't have access to that page.", NotificationType.error);
      navigate(getLandingPath(role), { replace: true });
    }
  }, [role, location.pathname, navigate, notify]);

  if (tokenExpired(getRefreshToken())) {
    sessionStorage.setItem(REDIRECT_KEY, location.pathname + location.search);
    return <Navigate to="/" replace />;
  }

  if (!user || !role || bootError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-page text-muted">
        <Loader2 className="size-8 animate-spin text-appPrimary" />
        <p className="text-base">Loading your gym…</p>
        <p className="text-sm text-subtle">
          The first request can take up to a minute while the server wakes up.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-8 px-12 pb-10 pt-6">
        <HeaderBar />
        <Suspense fallback={<CardSkeleton />}>
          {canAccessPath(role, location.pathname) ? children : null}
        </Suspense>
      </main>
      {import.meta.env.VITE_APP_FEATURE_ENABLED === "true" && <IdleLogout />}
    </div>
  );
}

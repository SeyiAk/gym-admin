import { Dumbbell } from "lucide-react";
import { Navigate } from "react-router-dom";
import { getRefreshToken, tokenExpired } from "@/utils/token";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-xl bg-appPrimarySoft">
        <Dumbbell className="size-6 text-appPrimary" />
      </div>
      <div className="leading-tight">
        <p className="text-xl font-bold text-white">HG FitAccess</p>
        <p className="text-sm text-muted">Gym Admin</p>
      </div>
    </div>
  );
}

/** Split screen: form on the left, brand panel on the right. No auth frames exist in Figma; styled from the dashboard. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already signed in (valid refresh token): skip the login page.
  if (!tokenExpired(getRefreshToken())) return <Navigate to="/overview" replace />;

  return (
    <div className="flex min-h-screen bg-page">
      <div className="flex w-full flex-col justify-between p-10 lg:w-1/2 lg:p-16">
        <Logo />
        <div className="mx-auto w-full max-w-[30rem] py-12">{children}</div>
        <p className="text-sm text-subtle">
          © {new Date().getFullYear()} Humble Globe. All rights reserved.
        </p>
      </div>
      <div className="relative hidden w-1/2 overflow-hidden border-l border-line bg-surface lg:flex">
        <div className="absolute -right-32 -top-32 size-[36rem] rounded-full bg-appPrimary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-[30rem] rounded-full bg-appPrimary/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-muted) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />
        <div className="relative flex flex-1 flex-col justify-end gap-6 p-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-appPrimary">
            <Dumbbell className="size-8 text-appPrimaryInk" />
          </div>
          <h2 className="text-5xl font-bold leading-tight text-white">
            Stronger People
            <br />
            <span className="text-appPrimary">Brighter Tomorrows</span>
          </h2>
          <p className="max-w-md text-xl text-muted">
            Members, memberships, check-ins and revenue across every branch, in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

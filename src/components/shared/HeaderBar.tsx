import { Bell, Building2, ChevronDown, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { useScope } from "@/hooks/useScope";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { cn } from "@/lib/utils";
import { fullName, initials } from "@/utils/helper";
import { PAGE_ACTIONS_ID } from "./PageActions";
import { SearchInput } from "./SearchInput";

// Pages whose endpoints take no branch scope; the picker would do nothing there.
const UNSCOPED = ["/branches", "/staff", "/settings"];

const pill =
  "flex items-center rounded-full border border-line bg-surface outline-none transition-colors hover:border-subtle focus-visible:ring-2 focus-visible:ring-appPrimary/50";

/**
 * Scope picker. Not in the Figma frames, but every /dashboard endpoint is scoped by branch, so the
 * user needs one place to choose it. Branch-only roles never see "All branches".
 */
function BranchScopeSelect() {
  const { canOrg, branches, branchId, setBranch, selectedBranch, branchesLoading } = useScope();
  if (!canOrg && branches.length <= 1) return null;
  const label =
    selectedBranch?.name ??
    (canOrg ? "All branches" : branchesLoading ? "Loading…" : "Select branch");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(pill, "h-[3.75rem] max-w-[15rem] cursor-pointer gap-2.5 rounded-xl px-4")}
      >
        <Building2 className="size-[1.125rem] shrink-0 text-muted" />
        <span className="truncate text-lg font-semibold text-white">{label}</span>
        <ChevronDown className="size-4 shrink-0 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
        <DropdownMenuLabel>Viewing data for</DropdownMenuLabel>
        {canOrg && (
          <DropdownMenuCheckItem checked={!branchId} onSelect={() => setBranch(null)}>
            All branches
          </DropdownMenuCheckItem>
        )}
        {branches.map((b) => (
          <DropdownMenuCheckItem
            key={b.id}
            checked={b.id === branchId}
            onSelect={() => setBranch(b.id)}
          >
            {b.name}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logout = useLogout();
  const { header } = useAppSelector((s) => s.shared);
  const user = useAppSelector((s) => s.auth.user);
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const [search, setSearch] = useState("");
  const name = user?.displayName || fullName(user);
  const canSearchMembers = !!role;

  return (
    <header className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="truncate text-4xl font-bold text-white">{header.title}</h1>
        {header.subtitle && <p className="truncate text-xl text-muted">{header.subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div id={PAGE_ACTIONS_ID} className="flex items-center gap-3 empty:hidden" />
        {!UNSCOPED.some((p) => pathname.startsWith(p)) && <BranchScopeSelect />}
        {canSearchMembers && (
          // Global search goes to Members: it's the only list with a search parameter that spans people.
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search members..."
            className="w-[18rem]"
            onSubmit={() => {
              if (!search.trim()) return;
              navigate(`/members?search=${encodeURIComponent(search.trim())}`);
              setSearch("");
            }}
          />
        )}
        <DropdownMenu>
          {/* No notifications API yet; the bell is kept for layout parity and says so. */}
          <DropdownMenuTrigger
            className="flex size-[3.75rem] cursor-pointer items-center justify-center rounded-xl border border-line bg-surface text-muted outline-none hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <p className="px-3 pb-3 text-base text-muted">You're all caught up.</p>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(pill, "cursor-pointer gap-2.5 py-2 pl-2 pr-4")}>
            <span className="flex size-8 items-center justify-center rounded-full bg-appPrimary text-[1.0625rem] font-bold text-appPrimaryInk">
              {initials(name)}
            </span>
            <span className="max-w-[10rem] truncate text-lg font-semibold text-white">{name}</span>
            <ChevronDown className="size-3.5 text-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => navigate("/settings")}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => logout()}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

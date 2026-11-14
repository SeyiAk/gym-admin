import {
  BarChart3,
  Calendar,
  ChevronDown,
  CreditCard,
  Dumbbell,
  Home,
  MapPin,
  Settings,
  Tags,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSwitchOrganization } from "@/hooks/auth/useAuth";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { cn } from "@/lib/utils";
import { getAllowedPaths, isDashboardRole, ROLE_LABELS } from "@/utils/roleAccess";

type NavItem = { path: string; label: string; icon: LucideIcon };

// Order mirrors SIDEBAR_PATH_ORDER in roleAccess.
const NAV: NavItem[] = [
  { path: "/overview", label: "Overview", icon: Home },
  { path: "/members", label: "Members", icon: Users },
  { path: "/memberships", label: "Memberships", icon: CreditCard },
  { path: "/membershipPlans", label: "Membership Plans", icon: Tags },
  { path: "/attendance", label: "Attendance", icon: Calendar },
  { path: "/branches", label: "Branches", icon: MapPin },
  { path: "/staff", label: "Staff", icon: UsersRound },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

function GymSwitcher() {
  const { organizations, activeOrganization } = useAppSelector((s) => s.auth);
  const switchOrg = useSwitchOrganization();
  const switchable = organizations.filter((o) => isDashboardRole(o.role));
  const location = [activeOrganization?.city, activeOrganization?.state].filter(Boolean).join(", ");

  const card = (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-line bg-page p-4 text-left">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[0.625rem] bg-appPrimary/12">
        {activeOrganization?.logo ? (
          <img src={activeOrganization.logo} alt="" className="size-full object-cover" />
        ) : (
          <Dumbbell className="size-5 text-appPrimary" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-lg font-bold text-white">{activeOrganization?.name ?? "—"}</p>
        <p className="truncate text-base text-muted">
          {location || (activeOrganization ? ROLE_LABELS[activeOrganization.role] : "")}
        </p>
      </div>
      {switchable.length > 1 && <ChevronDown className="size-4 shrink-0 text-muted" />}
    </div>
  );

  if (switchable.length <= 1) return card;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-appPrimary/50">
        {card}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuLabel>Switch gym</DropdownMenuLabel>
        {switchable.map((o) => (
          <DropdownMenuCheckItem
            key={o.id}
            checked={o.id === activeOrganization?.id}
            disabled={switchOrg.isPending}
            onSelect={() => o.id !== activeOrganization?.id && switchOrg.mutate(o.id)}
          >
            <span className="block truncate">{o.name}</span>
            <span className="block text-sm text-subtle">{ROLE_LABELS[o.role]}</span>
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar() {
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const allowed = getAllowedPaths(role);

  return (
    <aside className="sticky top-0 flex h-screen w-[20rem] shrink-0 flex-col gap-8 border-r border-line bg-surface p-8">
      <GymSwitcher />
      <nav className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto">
        {NAV.filter((n) => allowed.includes(n.path)).map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-xl font-medium text-muted transition-colors hover:text-white",
                isActive && "bg-navActive font-semibold text-appPrimary hover:text-appPrimary",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2.5 h-7 w-1 rounded-r bg-appPrimary" />
                )}
                <Icon className="size-5 shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-bold leading-snug text-white">
          Stronger People
          <br />
          Brighter Tomorrows
        </p>
        <p className="text-sm text-subtle">Powered by Humble Globe</p>
      </div>
    </aside>
  );
}

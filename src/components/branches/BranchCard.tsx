import { BarChart3, Hash, Mail, MapPin, Phone, Users, UsersRound } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { BranchRow } from "@/hooks/branches/useBranches";
import { display, formatCompactCurrency, formatDate, formatNumber } from "@/utils/helper";

function Tile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl bg-page px-4 py-3">
      <span className="flex items-center gap-1.5 text-sm text-subtle">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="truncate text-xl font-bold text-white">{value}</span>
    </div>
  );
}

export function BranchCard({ branch, onView }: { branch: BranchRow; onView: () => void }) {
  // Member/staff/revenue counts aren't in the spec; fall back to contact tiles when they're absent.
  const hasStats = [branch.members, branch.staff, branch.revenue].some((v) => v !== undefined);
  return (
    <article className="card flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="truncate text-xl font-bold text-white">{branch.name}</h3>
          <p className="flex items-center gap-1.5 truncate text-base text-subtle">
            <MapPin className="size-4 shrink-0" />
            {display(branch.location)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex gap-2">
            {branch.isPrimary && <StatusBadge tone="info">Primary</StatusBadge>}
            {branch.isActive !== undefined && (
              <StatusBadge tone={branch.isActive ? "brand" : "danger"}>
                {branch.isActive ? "Open" : "Closed"}
              </StatusBadge>
            )}
          </div>
          {branch.createdAt && (
            <span className="text-sm text-subtle">
              Since {formatDate(branch.createdAt, "MMM YYYY")}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        {hasStats ? (
          <>
            <Tile icon={Users} label="Members" value={formatNumber(branch.members)} />
            <Tile icon={UsersRound} label="Staff" value={formatNumber(branch.staff)} />
            <Tile
              icon={BarChart3}
              label="Revenue/mo"
              value={branch.revenue === undefined ? "—" : formatCompactCurrency(branch.revenue)}
            />
          </>
        ) : (
          <>
            <Tile icon={Hash} label="Code" value={display(branch.code)} />
            <Tile icon={Phone} label="Phone" value={display(branch.phone)} />
            <Tile icon={Mail} label="Email" value={display(branch.email)} />
          </>
        )}
      </div>
      {/* "Edit Branch" is in the design but there's no update-branch endpoint yet. */}
      <Button variant="soft" onClick={onView}>
        View Details
      </Button>
    </article>
  );
}

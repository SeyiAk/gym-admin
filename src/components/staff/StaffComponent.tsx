import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, Plus, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { DataTable } from "@/components/shared/DataTable";
import { PageActions } from "@/components/shared/PageActions";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { statusTone } from "@/components/members/constants";
import { useScope } from "@/hooks/useScope";
import { useGetStaff, type StaffRow } from "@/hooks/staff/useStaff";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { display, formatDate, formatNumber, titleCase } from "@/utils/helper";
import { canInviteStaff, canViewOrganizationScope } from "@/utils/roleAccess";
import { InviteStaffModal } from "./modal/InviteStaffModal";

const columns: ColumnDef<StaffRow, unknown>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.name} src={row.original.avatar} />
        <span className="font-semibold text-white">{row.original.name}</span>
      </div>
    ),
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ getValue }) => <span className="text-muted">{titleCase(getValue<string>())}</span>,
  },
  {
    header: "Branch",
    accessorKey: "branches",
    cell: ({ getValue }) => {
      const b = getValue<string[]>();
      return b.length ? (
        <div className="flex flex-wrap gap-1.5">
          {b.map((n) => (
            <StatusBadge key={n} tone="info">
              {n}
            </StatusBadge>
          ))}
        </div>
      ) : (
        <span className="text-subtle">All branches</span>
      );
    },
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) =>
      getValue() ? (
        <StatusBadge tone={statusTone(getValue<string>())}>
          {titleCase(getValue<string>())}
        </StatusBadge>
      ) : (
        <span className="text-subtle">N/A</span>
      ),
  },
  {
    header: "Joined",
    accessorKey: "joinedAt",
    cell: ({ getValue }) => <span className="text-muted">{formatDate(getValue<string>())}</span>,
  },
];

export default function StaffComponent() {
  usePageHeader("Staff", "Manage your gym team");
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const { branches } = useScope();
  const [paging, setPaging] = useState({ page: 1, pageSize: 20 });
  const [inviting, setInviting] = useState(false);
  const staff = useGetStaff({ page: paging.page, limit: paging.pageSize });
  const d = staff.data;

  // Role counts are derived client-side, so they're only shown when the whole team fits on this page.
  const complete = !!d && d.pagination.total <= d.rows.length;
  const count = (...roles: string[]) =>
    complete
      ? d!.rows.filter((r) => roles.includes((r.role ?? "").toUpperCase())).length
      : undefined;

  return (
    <div className="flex flex-col gap-8">
      {canInviteStaff(role) && (
        <PageActions>
          <Button size="lg" onClick={() => setInviting(true)}>
            <Plus /> Add Staff
          </Button>
        </PageActions>
      )}

      <div className="flex gap-4">
        <StatCard
          icon={UsersRound}
          label="Total Staff"
          loading={staff.isLoading}
          value={formatNumber(d?.pagination.total)}
        />
        <StatCard
          icon={ShieldCheck}
          label="Owners & GMs"
          loading={staff.isLoading}
          value={complete ? formatNumber(count("OWNER", "GENERAL_MANAGER")) : "—"}
        />
        <StatCard
          icon={UserCog}
          label="Managers & Receptionists"
          loading={staff.isLoading}
          value={complete ? formatNumber(count("MANAGER", "RECEPTIONIST")) : "—"}
        />
        {canViewOrganizationScope(role) && (
          <StatCard icon={MapPin} label="Across Branches" value={formatNumber(branches.length)} />
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          {d && (
            <span className="text-sm text-subtle">{d.pagination.total.toLocaleString()} staff</span>
          )}
        </div>
        <DataTable
          columns={columns}
          data={d?.rows ?? []}
          loading={staff.isLoading}
          error={staff.error as Error | null}
          onRetry={() => staff.refetch()}
          pagination={
            d && {
              page: paging.page,
              pageSize: paging.pageSize,
              totalPages: d.pagination.totalPages,
              total: d.pagination.total,
              onPageChange: (page) => setPaging((p) => ({ ...p, page })),
              onPageSizeChange: (pageSize) => setPaging({ page: 1, pageSize }),
            }
          }
          emptyState={{
            header: "No staff yet",
            subHeader: canInviteStaff(role)
              ? "Invite your managers and front-desk team with “Add Staff”."
              : "No team members have been added.",
          }}
        />
      </div>

      <InviteStaffModal open={inviting} onOpenChange={setInviting} />
    </div>
  );
}

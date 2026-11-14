import type { ColumnDef } from "@tanstack/react-table";
import { BarChart3, CreditCard, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { DataTable } from "@/components/shared/DataTable";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { statusTone } from "@/components/members/constants";
import { useGetMemberships, type MembershipRow } from "@/hooks/memberships/useMemberships";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import type { MembershipStatus } from "@/types";
import {
  display,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatNumber,
  titleCase,
} from "@/utils/helper";
import { MEMBERSHIP_TABS } from "./constants";

export default function MembershipsComponent() {
  usePageHeader("Memberships", "Track all active and past memberships");
  const navigate = useNavigate();
  const { scopeParams, branchesLoading, branchesError } = useScope();
  const [tab, setTab] = useState<MembershipStatus | "ALL">("ALL");
  const [paging, setPaging] = useState({ page: 1, pageSize: 20 });

  useEffect(() => setPaging((p) => ({ ...p, page: 1 })), [tab, scopeParams?.branchId]);

  const query = useGetMemberships(
    scopeParams
      ? {
          ...scopeParams,
          status: tab === "ALL" ? undefined : tab,
          page: paging.page,
          limit: paging.pageSize,
        }
      : null,
  );

  if (!scopeParams && !branchesLoading) return <ScopeNotice error={branchesError} />;

  const d = query.data;
  const loading = query.isLoading || (!scopeParams && branchesLoading);
  const s = d?.summary;
  const showBranch = scopeParams?.scope === "organization";

  const columns: ColumnDef<MembershipRow, unknown>[] = [
    {
      header: "Member",
      accessorKey: "member",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.member} src={row.original.memberAvatar} />
          <span className="font-semibold text-white">{row.original.member}</span>
        </div>
      ),
    },
    {
      header: "Plan",
      accessorKey: "plan",
      cell: ({ getValue }) => <span className="text-appPrimary">{display(getValue())}</span>,
    },
    ...(showBranch
      ? [
          {
            header: "Branch",
            accessorKey: "branch",
            cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
          } as ColumnDef<MembershipRow, unknown>,
        ]
      : []),
    {
      header: "Start Date",
      accessorKey: "startDate",
      cell: ({ getValue }) => <span className="text-muted">{formatDate(getValue<string>())}</span>,
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      cell: ({ getValue }) => <span className="text-muted">{formatDate(getValue<string>())}</span>,
    },
    {
      header: "Amount",
      accessorKey: "price",
      cell: ({ getValue }) => (
        <span className="font-bold text-appPrimary">{formatCurrency(getValue())}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <StatusBadge tone={statusTone(getValue<string>())}>
          {titleCase(getValue<string>())}
        </StatusBadge>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) =>
        row.original.memberId ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label="View member"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/members/${row.original.memberId}`);
            }}
          >
            <Eye />
          </Button>
        ) : null,
    },
  ];

  const tabLabel = MEMBERSHIP_TABS.find((t) => t.value === tab)!.label.toLowerCase();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <StatCard
          icon={CreditCard}
          label="Total Memberships"
          loading={loading}
          value={formatNumber(s?.total?.value)}
          change={s?.total?.change}
          changeLabel="vs last month"
        />
        <StatCard
          icon={CreditCard}
          label="Active"
          loading={loading}
          value={formatNumber(s?.active?.value)}
          change={s?.active?.change}
          changeLabel="vs last month"
        />
        <StatCard
          icon={CreditCard}
          label="Expired"
          loading={loading}
          value={formatNumber(s?.expired?.value)}
          change={s?.expired?.change}
          changeLabel="vs last month"
        />
        <StatCard
          icon={BarChart3}
          label="Revenue (Month)"
          loading={loading}
          value={formatCompactCurrency(s?.revenue?.value)}
          change={s?.revenue?.change}
          changeLabel="vs last month"
        />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SegmentedControl options={MEMBERSHIP_TABS} value={tab} onChange={setTab} />
          {d && (
            <span className="text-sm text-subtle">
              {d.pagination.total.toLocaleString()} records
            </span>
          )}
        </div>
        <DataTable
          columns={columns}
          data={d?.rows ?? []}
          loading={loading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          onRowClick={(r) => r.memberId && navigate(`/members/${r.memberId}`)}
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
          emptyState={
            tab === "ALL"
              ? {
                  header: "No memberships yet",
                  subHeader: "Memberships appear once members subscribe to a plan.",
                }
              : { header: `No ${tabLabel} memberships`, subHeader: "Try another tab." }
          }
        />
      </div>
    </div>
  );
}

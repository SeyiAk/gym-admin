import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Calendar, CreditCard, Timer, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { BarSeriesChart } from "@/components/shared/BarSeriesChart";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOverview, type ActivityRow } from "@/hooks/overview/useOverview";
import { useGetReports } from "@/hooks/reports/useReports";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import { display, durationBetween, formatDate, formatNumber, formatTime } from "@/utils/helper";
import type { Loose } from "@/utils/normalize";
import { pick } from "@/utils/normalize";

type Row = ActivityRow & { checkedOutAt?: string };

/**
 * There is no admin attendance endpoint yet (the /mobile/attendance/* routes are per-member). This
 * screen is built from what the dashboard does expose: /overview (monthly check-ins, recent
 * activity) and /reports (average daily and weekly check-ins). Swap in the log endpoint when it lands.
 */
export default function AttendanceComponent() {
  usePageHeader("Attendance", "Track member check-ins and check-outs");
  const navigate = useNavigate();
  const { scopeParams, branchesLoading, branchesError } = useScope();
  const overview = useGetOverview(scopeParams ? { ...scopeParams, growthPeriod: "7d" } : null);
  const reports = useGetReports(scopeParams ? { period: 3, branchId: scopeParams.branchId } : null);

  if (!scopeParams && !branchesLoading) return <ScopeNotice error={branchesError} />;

  const o = overview.data;
  const r = reports.data;
  const loading = overview.isLoading || (!scopeParams && branchesLoading);
  const rows: Row[] = (o?.recentActivities ?? []).map((raw, i) => ({
    ...(o?.recent[i] as ActivityRow),
    checkedOutAt: pick<string>(raw as Loose, "checkoutAt", "checkedOutAt"),
  }));

  const columns: ColumnDef<Row, unknown>[] = [
    {
      header: "Member",
      accessorKey: "member",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.member} />
          <span className="font-semibold text-white">{row.original.member}</span>
        </div>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branch",
      cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
    },
    {
      header: "Date",
      accessorKey: "at",
      cell: ({ getValue }) => <span className="text-muted">{formatDate(getValue<string>())}</span>,
    },
    {
      header: "Check-In",
      accessorKey: "at",
      id: "in",
      cell: ({ getValue }) => (
        <span className="text-appPrimary">{getValue() ? formatTime(getValue<string>()) : "—"}</span>
      ),
    },
    {
      header: "Check-Out",
      accessorKey: "checkedOutAt",
      cell: ({ getValue }) => (
        <span className="text-muted">{getValue() ? formatTime(getValue<string>()) : "—"}</span>
      ),
    },
    {
      header: "Duration",
      id: "duration",
      cell: ({ row }) => (
        <span className="text-muted">
          {durationBetween(row.original.at, row.original.checkedOutAt)}
        </span>
      ),
    },
    {
      header: "Status",
      id: "status",
      cell: ({ row }) =>
        row.original.checkedOutAt || row.original.checkedOut ? (
          <StatusBadge tone="info">Checked Out</StatusBadge>
        ) : (
          <StatusBadge tone="brand">In Gym</StatusBadge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <StatCard
          icon={Calendar}
          label="Monthly Check-ins"
          loading={loading}
          value={formatNumber(o?.metrics.monthlyCheckIns.value)}
          change={o?.metrics.monthlyCheckIns.percentageChange}
          changeLabel="vs last month"
        />
        <StatCard
          icon={Timer}
          label="Avg. Daily Check-ins"
          loading={reports.isLoading}
          value={formatNumber(r?.avgDailyCheckIns?.value)}
          change={r?.avgDailyCheckIns?.change}
          changeLabel="vs last period"
        />
        <StatCard
          icon={CreditCard}
          label="Active Memberships"
          loading={loading}
          value={formatNumber(o?.metrics.activeMemberships.value)}
          change={o?.metrics.activeMemberships.percentageChange}
          changeLabel="vs last month"
        />
        <StatCard
          icon={Users}
          label="Expiring This Week"
          loading={loading}
          value={formatNumber(o?.status.expiringSoon)}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 px-5 py-4 text-base text-muted">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-info" />
        <p>
          Showing the latest check-in activity. A full, filterable attendance log (Today / This Week
          / Custom) needs an admin attendance endpoint, which the API doesn't have yet.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_28rem] gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            error={overview.error as Error | null}
            onRetry={() => overview.refetch()}
            onRowClick={(row) => row.memberId && navigate(`/members/${row.memberId}`)}
            emptyState={{
              header: "No check-ins yet",
              subHeader: "Members check in by scanning the branch QR code in the app.",
            }}
          />
        </div>
        <SectionCard title="Weekly Check-ins" className="self-start p-7">
          {reports.isLoading ? (
            <Skeleton className="h-[13rem]" />
          ) : r?.weeklyCheckIns.length ? (
            <BarSeriesChart data={r.weeklyCheckIns} />
          ) : (
            <EmptyState header="No check-in data" className="py-8" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

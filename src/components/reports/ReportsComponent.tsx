import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { BarChart3, Calendar, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { BarSeriesChart } from "@/components/shared/BarSeriesChart";
import { DataTable } from "@/components/shared/DataTable";
import { DateRangeFields } from "@/components/shared/DateRangeFields";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SectionCard } from "@/components/shared/SectionCard";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetReports, type Reports } from "@/hooks/reports/useReports";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import { display, formatCompactCurrency, formatCurrency, formatNumber } from "@/utils/helper";
import { MembersByPlan } from "./MembersByPlan";

type Period = "3" | "6" | "custom";
type TopRow = Reports["topMembers"][number] & { rank: number };

// The API's period accepts 3 or 6 months; "12 Months" from the design is offered via Custom.
const PERIODS: { label: string; value: Period }[] = [
  { label: "3 Months", value: "3" },
  { label: "6 Months", value: "6" },
  { label: "Custom", value: "custom" },
];

const topColumns: ColumnDef<TopRow, unknown>[] = [
  {
    header: "#",
    accessorKey: "rank",
    cell: ({ getValue }) => (
      <span className={getValue<number>() === 1 ? "font-bold text-appPrimary" : "text-subtle"}>
        {getValue<number>()}
      </span>
    ),
  },
  {
    header: "Member",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.name} src={row.original.avatar} className="size-8" />
        <span className="font-semibold text-white">{row.original.name}</span>
      </div>
    ),
  },
  {
    header: "Plan",
    accessorKey: "plan",
    cell: ({ getValue }) => <span className="text-appPrimary">{display(getValue())}</span>,
  },
  {
    header: "Visits",
    accessorKey: "visits",
    cell: ({ getValue }) => (
      <span className="font-bold text-white">{formatNumber(getValue())}</span>
    ),
  },
  {
    header: "Revenue",
    accessorKey: "revenue",
    cell: ({ getValue }) => <span className="text-appPrimary">{formatCurrency(getValue())}</span>,
  },
];

export default function ReportsComponent() {
  usePageHeader("Reports", "Analytics and performance insights");
  const navigate = useNavigate();
  const { scopeParams, branchesLoading, branchesError } = useScope();
  const [period, setPeriod] = useState<Period>("6");
  const [range, setRange] = useState({
    start: dayjs().subtract(12, "month").startOf("month").format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD"),
  });

  const params =
    !scopeParams || (period === "custom" && !(range.start && range.end))
      ? null
      : {
          branchId: scopeParams.branchId,
          ...(period === "custom"
            ? { startDate: range.start, endDate: range.end }
            : { period: Number(period) as 3 | 6 }),
        };
  const query = useGetReports(params);

  if (!scopeParams && !branchesLoading) return <ScopeNotice error={branchesError} />;
  if (query.error && !query.data) {
    return (
      <div className="card">
        <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />
      </div>
    );
  }

  const r = query.data;
  const loading = query.isLoading || !params;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Revenue"
          loading={loading}
          value={formatCompactCurrency(r?.revenue?.value)}
          change={r?.revenue?.change}
          changeLabel="vs last period"
        />
        <StatCard
          icon={Users}
          label="Total Members"
          loading={loading}
          value={formatNumber(r?.members?.value)}
          change={r?.members?.change}
          changeLabel="vs last period"
        />
        <StatCard
          icon={Calendar}
          label="Avg. Daily Check-ins"
          loading={loading}
          value={formatNumber(r?.avgDailyCheckIns?.value)}
          change={r?.avgDailyCheckIns?.change}
          changeLabel="vs last period"
        />
        {/* The design's "Retention Rate" isn't in the API; active members is the closest reported figure. */}
        <StatCard
          icon={UserCheck}
          label="Active Members"
          loading={loading}
          value={formatNumber(r?.activeMembers?.value)}
          change={r?.activeMembers?.change}
          changeLabel="vs last period"
        />
      </div>

      <div className="flex gap-4">
        <section className="card flex min-w-0 flex-1 flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">Monthly Revenue</h2>
            <div className="flex items-center gap-3">
              {period === "custom" && (
                <DateRangeFields
                  start={range.start}
                  end={range.end}
                  max={dayjs().format("YYYY-MM-DD")}
                  onChange={setRange}
                />
              )}
              <SegmentedControl
                variant="track"
                options={PERIODS}
                value={period}
                onChange={setPeriod}
              />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-[13rem]" />
          ) : r?.monthlyRevenue.length ? (
            <BarSeriesChart data={r.monthlyRevenue} format={formatCompactCurrency} />
          ) : (
            <EmptyState header="No revenue in this period" className="py-10" />
          )}
        </section>
        <SectionCard title="Members by Plan" className="w-[23rem] shrink-0 p-6">
          {loading ? (
            <Skeleton className="h-48" />
          ) : r?.membersByPlan.length ? (
            <MembersByPlan data={r.membersByPlan} />
          ) : (
            <EmptyState header="No plan data" className="py-10" />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-[1fr_38rem] gap-4">
        <SectionCard title="Weekly Check-ins" className="p-6">
          {loading ? (
            <Skeleton className="h-[13rem]" />
          ) : r?.weeklyCheckIns.length ? (
            <BarSeriesChart
              className="h-[17rem]"
              data={r.weeklyCheckIns}
              highlight={r.weeklyCheckIns.reduce(
                (best, d, i, a) => (d.value > a[best].value ? i : best),
                0,
              )}
            />
          ) : (
            <EmptyState header="No check-ins this week" className="py-10" />
          )}
        </SectionCard>
        <SectionCard title="Top Members (Visits)" className="p-6">
          <DataTable
            variant="plain"
            columns={topColumns}
            data={(r?.topMembers ?? []).slice(0, 5).map((m, i) => ({ ...m, rank: i + 1 }))}
            loading={loading}
            onRowClick={(m) => m.memberId && navigate(`/members/${m.memberId}`)}
            emptyState={{ header: "No visits recorded yet" }}
          />
        </SectionCard>
      </div>
    </div>
  );
}

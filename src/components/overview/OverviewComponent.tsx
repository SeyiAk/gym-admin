import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { BarChart3, Calendar, CreditCard, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from "@/components/shared/DataTable";
import { DateRangeFields } from "@/components/shared/DateRangeFields";
import { ErrorState } from "@/components/shared/EmptyState";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SectionCard } from "@/components/shared/SectionCard";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useGetOverview, type ActivityRow, type RenewalRow } from "@/hooks/overview/useOverview";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import { useAppSelector } from "@/hooks/useTypedSelector";
import type { GrowthPeriod } from "@/types";
import {
  display,
  formatCompactCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from "@/utils/helper";
import { daysLeftTone, GROWTH_OPTIONS } from "./constants";
import { MembershipGrowthChart } from "./MembershipGrowthChart";
import { MembershipStatusDonut } from "./MembershipStatusDonut";

const activityColumns: ColumnDef<ActivityRow, unknown>[] = [
  {
    header: "Member",
    accessorKey: "member",
    cell: ({ getValue }) => <span className="font-semibold text-white">{getValue<string>()}</span>,
  },
  {
    header: "Activity",
    accessorKey: "activity",
    cell: ({ getValue }) => <span className="font-medium text-muted">{getValue<string>()}</span>,
  },
  {
    header: "Branch",
    accessorKey: "branch",
    cell: ({ getValue }) => <span className="font-medium text-muted">{display(getValue())}</span>,
  },
  {
    header: "Date & Time",
    accessorKey: "at",
    cell: ({ getValue }) => (
      <span className="text-subtle">{formatDateTime(getValue<string>())}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "checkedOut",
    meta: { className: "text-right" },
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <StatusBadge tone="info" size="md">
          Checked Out
        </StatusBadge>
      ) : (
        <StatusBadge tone="brand" size="md">
          Checked In
        </StatusBadge>
      ),
  },
];

const renewalColumns: ColumnDef<RenewalRow, unknown>[] = [
  {
    header: "Member",
    accessorKey: "member",
    cell: ({ getValue }) => <span className="font-semibold text-white">{getValue<string>()}</span>,
  },
  {
    header: "Membership",
    accessorKey: "plan",
    cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
  },
  {
    header: "Renewal Date",
    accessorKey: "endDate",
    cell: ({ getValue }) => <span className="text-subtle">{formatDate(getValue<string>())}</span>,
  },
  {
    header: "Days Left",
    accessorKey: "daysLeft",
    meta: { className: "text-right" },
    cell: ({ getValue }) => {
      const d = getValue<number | null>();
      return (
        <StatusBadge tone={daysLeftTone(d)} size="md">
          {d === null ? "N/A" : `${Math.max(d, 0)} day${d === 1 ? "" : "s"}`}
        </StatusBadge>
      );
    },
  },
];

export default function OverviewComponent() {
  const navigate = useNavigate();
  const orgName = useAppSelector((s) => s.auth.activeOrganization?.name);
  usePageHeader(
    `Welcome back${orgName ? `, ${orgName}` : ""}`,
    "Here's what's happening at your gym today.",
  );
  const { scopeParams, branchesLoading, branchesError } = useScope();

  const [period, setPeriod] = useState<GrowthPeriod>("30d");
  const [range, setRange] = useState({
    start: dayjs().subtract(3, "month").format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD"),
  });
  const customReady = period !== "custom" || (range.start && range.end);

  const overview = useGetOverview(
    scopeParams && customReady
      ? {
          ...scopeParams,
          growthPeriod: period,
          ...(period === "custom" ? { startDate: range.start, endDate: range.end } : {}),
        }
      : null,
  );

  if (!scopeParams && !branchesLoading) return <ScopeNotice error={branchesError} />;

  const d = overview.data;
  const loading = overview.isLoading || (!scopeParams && branchesLoading);
  const m = d?.metrics;

  if (overview.error && !d) {
    return (
      <div className="card">
        <ErrorState
          message={(overview.error as Error).message}
          onRetry={() => overview.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <StatCard
          icon={Users}
          label="Total Members"
          loading={loading}
          value={formatNumber(m?.totalMembers.value)}
          change={m?.totalMembers.percentageChange}
          changeLabel="vs last month"
        />
        <StatCard
          icon={CreditCard}
          label="Active Memberships"
          loading={loading}
          value={formatNumber(m?.activeMemberships.value)}
          change={m?.activeMemberships.percentageChange}
          changeLabel="vs last month"
        />
        {/* The design shows "Today's Check-ins"; the API returns monthly check-ins. */}
        <StatCard
          icon={Calendar}
          label="Monthly Check-ins"
          loading={loading}
          value={formatNumber(m?.monthlyCheckIns.value)}
          change={m?.monthlyCheckIns.percentageChange}
          changeLabel="vs last month"
        />
        <StatCard
          icon={BarChart3}
          label="Monthly Revenue"
          loading={loading}
          value={formatCompactCurrency(m?.monthlyRevenue.value)}
          change={m?.monthlyRevenue.percentageChange}
          changeLabel="vs last month"
        />
      </div>

      <div className="flex gap-4">
        <section className="card flex min-w-0 flex-1 flex-col gap-6 p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">Membership Growth</h2>
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
                options={[...GROWTH_OPTIONS]}
                value={period}
                onChange={setPeriod}
              />
            </div>
          </div>
          <MembershipGrowthChart data={d?.membershipGrowth?.data ?? []} loading={loading} />
        </section>
        <section className="card flex w-[30rem] shrink-0 flex-col gap-6 p-7">
          <h2 className="text-2xl font-bold text-white">Membership Status</h2>
          <MembershipStatusDonut
            loading={loading}
            {...(d?.status ?? { active: 0, expiringSoon: 0, inactive: 0 })}
          />
        </section>
      </div>

      <div className="flex gap-4">
        <SectionCard
          title="Recent Member Activity"
          className="flex-1"
          action={
            <Link
              to="/attendance"
              className="text-[1.0625rem] font-semibold text-appPrimary hover:underline"
            >
              View all
            </Link>
          }
        >
          <DataTable
            variant="plain"
            columns={activityColumns}
            data={d?.recent.slice(0, 5) ?? []}
            loading={loading}
            onRowClick={(r) => r.memberId && navigate(`/members/${r.memberId}`)}
            emptyState={{
              header: "No recent activity",
              subHeader: "Member check-ins will appear here.",
            }}
          />
        </SectionCard>
        <SectionCard
          title="Upcoming Renewals"
          className="w-[36.25rem] shrink-0"
          action={
            <Link
              to="/memberships"
              className="text-[1.0625rem] font-semibold text-appPrimary hover:underline"
            >
              View all
            </Link>
          }
        >
          <DataTable
            variant="plain"
            columns={renewalColumns}
            data={d?.renewals.slice(0, 5) ?? []}
            loading={loading}
            onRowClick={(r) => r.memberId && navigate(`/members/${r.memberId}`)}
            emptyState={{
              header: "No renewals due",
              subHeader: "Memberships ending within 7 days show here.",
            }}
          />
        </SectionCard>
      </div>
    </div>
  );
}

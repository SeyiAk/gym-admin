import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  Clock,
  CreditCard,
  History,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMemberDetails, type MemberDetails } from "@/hooks/members/useMembers";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import { display, formatCurrency, formatDate, formatTime, titleCase } from "@/utils/helper";
import { daysLeftTone } from "@/components/overview/constants";
import { CheckinsBarChart } from "./CheckinsBarChart";
import { statusTone } from "./constants";

type HistoryRow = MemberDetails["history"][number];
type CheckinRow = MemberDetails["recent"][number];

const historyColumns: ColumnDef<HistoryRow, unknown>[] = [
  {
    header: "Plan",
    accessorKey: "plan",
    cell: ({ getValue }) => <span className="font-semibold text-white">{display(getValue())}</span>,
  },
  {
    header: "Period",
    id: "period",
    cell: ({ row }) => (
      <span className="text-muted">
        {formatDate(row.original.startDate, "D MMM YYYY")} –{" "}
        {formatDate(row.original.endDate, "D MMM YYYY")}
      </span>
    ),
  },
  {
    header: "Amount",
    accessorKey: "price",
    cell: ({ getValue }) => <span className="text-muted">{formatCurrency(getValue())}</span>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => (
      <StatusBadge tone={statusTone(getValue<string>())} size="md">
        {titleCase(getValue<string>())}
      </StatusBadge>
    ),
  },
];

const checkinColumns: ColumnDef<CheckinRow, unknown>[] = [
  {
    header: "Date & Time",
    accessorKey: "checkedInAt",
    cell: ({ getValue }) => (
      <span className="font-semibold text-white">
        {formatDate(getValue<string>(), "D MMM YYYY, h:mm A")}
      </span>
    ),
  },
  {
    header: "Branch",
    accessorKey: "branch",
    cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
  },
  {
    header: "Check-out",
    accessorKey: "checkedOutAt",
    cell: ({ getValue }) => (
      <span className="text-muted">{getValue() ? formatTime(getValue<string>()) : "—"}</span>
    ),
  },
  {
    header: "Status",
    id: "status",
    meta: { className: "text-right" },
    cell: ({ row }) =>
      row.original.checkedOutAt ? (
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

function InfoRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4 py-2 text-base">
      <span className="text-muted">{label}</span>
      <div className="min-w-0">
        <div className="break-words text-white">{value}</div>
        {sub && <div className="text-sm text-muted">{sub}</div>}
      </div>
    </div>
  );
}

const durationLabel = (n?: number, unit?: string) =>
  n && unit
    ? n === 1
      ? `per ${unit.toLowerCase()}`
      : `per ${n} ${unit.toLowerCase()}s`
    : undefined;

export default function MemberDetailsComponent() {
  usePageHeader("Members / Member Details", "View and manage member information.");
  const { id } = useParams();
  const { scopeParams, branchesLoading, branchesError } = useScope();
  const query = useGetMemberDetails(id, scopeParams);

  if (!scopeParams && !branchesLoading) return <ScopeNotice error={branchesError} />;

  if (query.isLoading || !scopeParams) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="card">
        <ErrorState
          message={(query.error as Error)?.message ?? "Member not found."}
          onRetry={() => query.refetch()}
        />
        <div className="flex justify-center pb-8">
          <Button variant="ghost" asChild>
            <Link to="/members">
              <ArrowLeft /> Back to members
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const m = query.data;
  const c = m.current;

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-wrap items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-6">
          <Avatar
            name={m.name}
            src={m.profileImage}
            className="size-[5.25rem] text-3xl font-bold"
          />
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">{m.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-base text-muted">
              <span className="text-lg">Member ID: {display(m.membershipNumber)}</span>
              {m.status && (
                <StatusBadge tone={statusTone(m.status)} size="md">
                  {titleCase(m.status)}
                </StatusBadge>
              )}
              {m.homeBranch && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {m.homeBranch}
                </span>
              )}
              {m.joinedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  Joined {formatDate(m.joinedAt, "D MMM YYYY")}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* "More", "Edit Member" and "Renew Membership" are in the design but have no endpoints yet. */}
        <Button variant="outline" asChild>
          <Link to="/members">
            <ArrowLeft /> All members
          </Link>
        </Button>
      </section>

      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="Personal Information" icon={<User className="size-5" />}>
          <InfoRow label="Full Name" value={m.name} />
          <InfoRow label="Email Address" value={display(m.email)} />
          <InfoRow label="Phone Number" value={display(m.phone)} />
          {m.gender && <InfoRow label="Gender" value={titleCase(m.gender)} />}
          <InfoRow label="Date of Birth" value={formatDate(m.dateOfBirth, "D MMM YYYY")} />
          <InfoRow label="Address" value={display(m.address)} />
          {(m.emergencyContact || m.emergencyPhone) && (
            <InfoRow
              label="Emergency Contact"
              value={display(m.emergencyContact)}
              sub={m.emergencyPhone}
            />
          )}
        </SectionCard>

        <SectionCard title="Current Membership" icon={<CreditCard className="size-5" />}>
          {c ? (
            <>
              <InfoRow
                label="Plan"
                value={<span className="font-semibold">{display(c.plan)}</span>}
                sub={c.planDescription}
              />
              <InfoRow label="Start Date" value={formatDate(c.startDate, "D MMM YYYY")} />
              <InfoRow
                label="Expiry Date"
                value={
                  <span className="flex flex-wrap items-center gap-2">
                    {formatDate(c.endDate, "D MMM YYYY")}
                    {c.daysLeft !== null && c.daysLeft >= 0 && (
                      <StatusBadge tone={daysLeftTone(c.daysLeft)}>
                        {c.daysLeft} days left
                      </StatusBadge>
                    )}
                  </span>
                }
              />
              <InfoRow
                label="Amount"
                value={<span className="text-lg font-bold">{formatCurrency(c.price)}</span>}
                sub={durationLabel(c.duration, c.durationUnit)}
              />
              {c.status && (
                <InfoRow
                  label="Status"
                  value={
                    <StatusBadge tone={statusTone(c.status)}>{titleCase(c.status)}</StatusBadge>
                  }
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={CreditCard}
              header="No active membership"
              subHeader="This member has no current plan."
              className="py-8"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Attendance Summary"
          icon={<Calendar className="size-5" />}
          bodyClassName="flex flex-col gap-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex gap-3 rounded-xl border border-line bg-page p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-appPrimarySoft">
                <Users className="size-4 text-appPrimary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-muted">This Month</span>
                <span className="text-2xl font-bold text-white">
                  {display(m.summary.thisMonth)}
                </span>
                <span className="text-sm text-muted">check-ins</span>
                {typeof m.summary.change === "number" && (
                  <span className="flex items-center gap-1 text-sm font-bold text-appPrimary">
                    <ArrowUp className="size-3" />
                    {Math.abs(m.summary.change)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-line bg-page p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/15">
                <Clock className="size-4 text-info" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm text-muted">Last Check-in</span>
                <span className="truncate text-2xl font-bold text-white">
                  {m.summary.lastCheckIn ? formatDate(m.summary.lastCheckIn, "MMM D") : "N/A"}
                </span>
                {m.summary.lastCheckIn && (
                  <span className="text-sm text-muted">{formatTime(m.summary.lastCheckIn)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-white">Check-ins (Last 14 Days)</p>
            {m.daily.length ? (
              <CheckinsBarChart data={m.daily} />
            ) : (
              <p className="py-6 text-center text-sm text-subtle">
                No check-ins in the last 14 days.
              </p>
            )}
          </div>
          {typeof m.summary.total === "number" && (
            <p className="text-sm text-subtle">{m.summary.total} visits all-time</p>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <SectionCard title="Membership History" icon={<History className="size-5" />}>
          <DataTable
            variant="plain"
            columns={historyColumns}
            data={m.history}
            emptyState={{ header: "No membership history" }}
          />
        </SectionCard>
        <SectionCard title="Recent Check-ins" icon={<Clock className="size-5" />}>
          <DataTable
            variant="plain"
            columns={checkinColumns}
            data={m.recent.slice(0, 5)}
            emptyState={{ header: "No check-ins yet" }}
          />
        </SectionCard>
      </div>
    </div>
  );
}

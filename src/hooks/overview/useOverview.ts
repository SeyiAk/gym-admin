import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { getOverviewAPICall } from "@/services/overview";
import type { OverviewParams } from "@/types";
import { daysUntil } from "@/utils/helper";
import { asObject, personName, pick } from "@/utils/normalize";

export type ActivityRow = {
  id: string;
  member: string;
  memberId?: string;
  activity: string;
  branch?: string;
  at?: string;
  checkedOut: boolean;
};

export type RenewalRow = {
  id: string;
  member: string;
  memberId?: string;
  plan?: string;
  endDate?: string;
  daysLeft: number | null;
};

// Item shapes aren't documented. Activities are read like the mobile /home recentActivities
// (type, checkedInAt, checkoutAt, branch) plus a member/user object.
export function toActivityRow(raw: unknown, i: number): ActivityRow {
  const type = pick<string>(raw, "type", "activity", "action");
  const checkedOutAt = pick<string>(raw, "checkoutAt", "checkedOutAt");
  return {
    id: String(pick(raw, "id") ?? i),
    member: personName(raw, "member", "user", "member.user") ?? "Unknown member",
    memberId: pick<string>(raw, "member.id", "memberId"),
    activity: type
      ? type.toUpperCase().includes("OUT")
        ? "Check-out"
        : type.toUpperCase().includes("IN")
          ? "Check-in"
          : type
      : "Check-in",
    branch: pick<string>(raw, "branch.name", "branchName"),
    at: pick<string>(raw, "checkedInAt", "createdAt", "date", "timestamp"),
    checkedOut: !!checkedOutAt || pick<string>(raw, "status") === "CHECKED_OUT",
  };
}

export function toRenewalRow(raw: unknown, i: number): RenewalRow {
  const endDate = pick<string>(raw, "endDate", "renewalDate", "expiresAt", "membership.endDate");
  const days = pick<number>(raw, "daysLeft", "daysRemaining", "remainingDays");
  return {
    id: String(pick(raw, "id") ?? i),
    member: personName(raw, "member", "user", "member.user") ?? "Unknown member",
    memberId: pick<string>(raw, "member.id", "memberId"),
    plan: pick<string>(raw, "plan.name", "membershipPlan.name", "planName", "membership.plan.name"),
    endDate,
    daysLeft: typeof days === "number" ? days : daysUntil(endDate),
  };
}

export function useGetOverview(params: OverviewParams | null) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["overview", "dashboard", orgId, params],
    queryFn: () => getOverviewAPICall(params!),
    enabled: !!params && !!orgId,
    placeholderData: keepPreviousData,
    select: (res) => {
      const d = res.data;
      return {
        ...d,
        recent: (Array.isArray(d.recentActivities) ? d.recentActivities : []).map(toActivityRow),
        renewals: (Array.isArray(d.upcomingRenewals) ? d.upcomingRenewals : []).map(toRenewalRow),
        status: {
          active: 0,
          expiringSoon: 0,
          inactive: 0,
          ...asObject(d.membershipStatus),
        } as typeof d.membershipStatus,
      };
    },
  });
}

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { getReportsAPICall } from "@/services/reports";
import type { ReportsParams } from "@/types";
import { asObject, extractItems, personName, pick, type Loose } from "@/utils/normalize";

type Kpi = { value: unknown; change: number | null } | undefined;

const kpi = (root: Loose, ...keys: string[]): Kpi => {
  const raw = pick(root, ...keys);
  if (raw === undefined) return undefined;
  if (raw && typeof raw === "object") {
    const o = asObject(raw);
    return {
      value: o.value ?? o.total ?? o.amount ?? o.count,
      change: typeof o.percentageChange === "number" ? o.percentageChange : null,
    };
  }
  return { value: raw, change: null };
};

/**
 * GET /dashboard/reports lists its sections (revenue, member totals, average daily check-ins,
 * monthly revenue, members by plan, weekly check-ins, top members) without a schema.
 */
export function toReports(data: unknown) {
  const root = asObject(data);
  const summary = asObject(pick(root, "summary", "metrics", "kpis") ?? root);
  return {
    revenue: kpi(summary, "totalRevenue", "revenue"),
    members: kpi(summary, "totalMembers", "members", "memberTotals.total"),
    activeMembers: kpi(summary, "activeMembers", "memberTotals.active"),
    avgDailyCheckIns: kpi(
      summary,
      "averageDailyCheckIns",
      "avgDailyCheckIns",
      "averageDailyCheckins",
    ),
    monthlyRevenue: extractItems<Loose>(pick(root, "monthlyRevenue", "revenueByMonth") ?? []).map(
      (r) => ({
        label: String(pick(r, "month", "label", "period") ?? ""),
        value: Number(pick(r, "revenue", "amount", "total", "value") ?? 0) || 0,
      }),
    ),
    membersByPlan: extractItems<Loose>(pick(root, "membersByPlan", "planDistribution") ?? []).map(
      (r) => ({
        plan: String(pick(r, "planName", "plan.name", "name", "plan") ?? "Plan"),
        count: Number(pick(r, "members", "count", "total", "activeMembers") ?? 0) || 0,
        percentage: pick<number>(r, "percentage", "percent"),
      }),
    ),
    weeklyCheckIns: extractItems<Loose>(
      pick(root, "weeklyCheckIns", "weeklyCheckins", "checkInsByDay") ?? [],
    ).map((r) => ({
      label: String(pick(r, "day", "label", "dayOfWeek", "date") ?? ""),
      value: Number(pick(r, "checkIns", "checkins", "count", "total", "value") ?? 0) || 0,
    })),
    topMembers: extractItems<Loose>(pick(root, "topMembers") ?? []).map((r, i) => ({
      id: String(pick(r, "id", "member.id", "memberId") ?? i),
      memberId: pick<string>(r, "member.id", "memberId", "id"),
      name: personName(r, "member", "user") ?? "Unknown member",
      avatar: pick<string>(r, "profileImage", "member.profileImage"),
      plan: pick<string>(r, "plan.name", "planName", "membershipPlan.name", "plan"),
      visits: pick<number>(r, "visits", "checkIns", "totalVisits", "count"),
      revenue: pick(r, "revenue", "amount", "totalSpent"),
    })),
  };
}

export type Reports = ReturnType<typeof toReports>;

export function useGetReports(params: ReportsParams | null) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["reports", "dashboard", orgId, params],
    queryFn: () => getReportsAPICall(params!),
    enabled: !!params && !!orgId,
    placeholderData: keepPreviousData,
    select: (res) => toReports(res.data),
  });
}

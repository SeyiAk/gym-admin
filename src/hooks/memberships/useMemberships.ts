import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { getMembershipsAPICall } from "@/services/memberships";
import type { MembershipsParams } from "@/types";
import {
  asObject,
  extractItems,
  extractPagination,
  personName,
  pick,
  type Loose,
} from "@/utils/normalize";

export type MembershipRow = {
  id: string;
  memberId?: string;
  member: string;
  memberAvatar?: string;
  plan?: string;
  branch?: string;
  startDate?: string;
  endDate?: string;
  price?: unknown;
  status?: string;
};

export type SummaryMetric = { value: unknown; change: number | null };

/** Summary metrics may arrive as plain numbers or as { value, percentageChange } like /overview. */
const metric = (summary: Loose, ...keys: string[]): SummaryMetric | undefined => {
  const raw = pick(summary, ...keys);
  if (raw === undefined) return undefined;
  if (typeof raw === "object") {
    const o = asObject(raw);
    return {
      value: o.value ?? o.count ?? o.total,
      change: typeof o.percentageChange === "number" ? o.percentageChange : null,
    };
  }
  return { value: raw, change: null };
};

const toRow = (r: Loose, i: number): MembershipRow => ({
  id: String(pick(r, "id") ?? i),
  memberId: pick<string>(r, "member.id", "memberId"),
  member: personName(r, "member", "user", "member.user") ?? "Unknown member",
  memberAvatar: pick<string>(r, "member.profileImage", "member.avatar"),
  plan: pick<string>(r, "plan.name", "membershipPlan.name", "planName"),
  branch: pick<string>(r, "branch.name", "member.homeBranch.name"),
  startDate: pick<string>(r, "startDate"),
  endDate: pick<string>(r, "endDate"),
  price: pick(r, "price", "amount"),
  status: pick<string>(r, "status"),
});

export function useGetMemberships(params: MembershipsParams | null) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["memberships", "list", orgId, params],
    queryFn: () => getMembershipsAPICall(params!),
    enabled: !!params && !!orgId,
    placeholderData: keepPreviousData,
    select: (res) => {
      const d = res.data;
      const summary = asObject(pick(d, "summary", "metrics", "stats") ?? d);
      const rows = extractItems<Loose>(d, "memberships", "records").map(toRow);
      return {
        rows,
        pagination: extractPagination(d, params?.limit ?? 20, rows.length),
        summary: {
          total: metric(summary, "totalMemberships", "total"),
          active: metric(summary, "activeMemberships", "active"),
          expired: metric(summary, "expiredMemberships", "expired"),
          revenue: metric(summary, "monthlyRevenue", "revenue"),
        },
      };
    },
  });
}

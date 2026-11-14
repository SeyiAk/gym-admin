import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { getMemberDetailsAPICall, getMembersAPICall } from "@/services/members";
import type { MembersParams, ScopeParams } from "@/types";
import { daysUntil } from "@/utils/helper";
import { asObject, extractItems, personName, pick, type Loose } from "@/utils/normalize";

export function useGetMembers(params: MembersParams | null) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["members", "list", orgId, params],
    queryFn: () => getMembersAPICall(params!),
    enabled: !!params && !!orgId,
    placeholderData: keepPreviousData,
    select: (res) => ({
      members: res.data?.members ?? [],
      pagination: res.data?.pagination ?? {
        page: 1,
        limit: params?.limit ?? 20,
        total: 0,
        totalPages: 1,
      },
    }),
  });
}

export type MemberDetails = ReturnType<typeof toMemberDetails>;

/**
 * GET /dashboard/members/{id} lists its sections (personal info, home branch, current membership,
 * membership history, attendance summary, 14-day attendance, recent check-ins) but no schema.
 * Keys are read defensively; anything missing renders "N/A".
 */
export function toMemberDetails(data: unknown) {
  const root = asObject(data);
  const member = asObject(pick(root, "member", "personalInformation", "profile") ?? root);
  const current = pick<Loose>(
    root,
    "currentMembership",
    "member.currentMembership",
    "activeMembership",
  );
  const summary = asObject(pick(root, "attendanceSummary", "attendance.summary", "attendance"));
  const history = extractItems<Loose>(
    pick(root, "membershipHistory", "memberships", "history") ?? [],
    "items",
  );
  const daily = extractItems<Loose>(
    pick(
      root,
      "attendance14Days",
      "attendanceLast14Days",
      "fourteenDayAttendance",
      "attendanceChart",
      "attendance.daily",
      "dailyAttendance",
    ) ?? [],
  );
  const recent = extractItems<Loose>(
    pick(root, "recentCheckIns", "recentCheckins", "recentAttendance", "attendance.recent") ?? [],
  );
  const endDate = pick<string>(current, "endDate");

  return {
    id: String(pick(member, "id") ?? ""),
    name: personName(member) ?? "Member",
    membershipNumber: pick<string>(member, "membershipNumber"),
    email: pick<string>(member, "email"),
    phone: pick<string>(member, "phone"),
    status: pick<string>(member, "status"),
    gender: pick<string>(member, "gender"),
    dateOfBirth: pick<string>(member, "dateOfBirth"),
    address: pick<string>(member, "address"),
    emergencyContact: pick<string>(member, "emergencyContactName", "emergencyContact.name"),
    emergencyPhone: pick<string>(member, "emergencyContactPhone", "emergencyContact.phone"),
    profileImage: pick<string>(member, "profileImage", "avatar"),
    joinedAt: pick<string>(member, "joinedAt", "createdAt"),
    homeBranch:
      pick<string>(root, "homeBranch.name", "member.homeBranch.name") ??
      pick<string>(member, "homeBranch.name"),
    current: current
      ? {
          plan: pick<string>(current, "plan.name", "membershipPlan.name", "planName"),
          planDescription: pick<string>(current, "plan.description", "membershipPlan.description"),
          duration: pick<number>(current, "plan.duration", "membershipPlan.duration"),
          durationUnit: pick<string>(current, "plan.durationUnit", "membershipPlan.durationUnit"),
          startDate: pick<string>(current, "startDate"),
          endDate,
          price: pick(current, "price", "amount"),
          status: pick<string>(current, "status"),
          daysLeft: daysUntil(endDate),
        }
      : null,
    summary: {
      thisMonth: pick<number>(
        summary,
        "monthlyVisits",
        "thisMonth",
        "monthlyCheckIns",
        "currentMonth",
      ),
      total: pick<number>(summary, "totalVisits", "total", "totalCheckIns"),
      change: pick<number>(summary, "percentageChange", "monthlyChange"),
      lastCheckIn: pick<string>(summary, "lastCheckIn", "lastAttendance", "lastCheckInAt"),
    },
    daily: daily.map((d) => ({
      date: pick<string>(d, "date", "day") ?? "",
      count:
        Number(pick(d, "checkIns", "visits", "count", "total") ?? (pick(d, "attended") ? 1 : 0)) ||
        0,
    })),
    history: history.map((h, i) => ({
      id: String(pick(h, "id") ?? i),
      plan: pick<string>(h, "plan.name", "membershipPlan.name", "planName"),
      startDate: pick<string>(h, "startDate"),
      endDate: pick<string>(h, "endDate"),
      price: pick(h, "price", "amount"),
      status: pick<string>(h, "status"),
    })),
    recent: recent.map((r, i) => ({
      id: String(pick(r, "id") ?? i),
      checkedInAt: pick<string>(r, "checkedInAt", "createdAt"),
      checkedOutAt: pick<string>(r, "checkedOutAt", "checkoutAt"),
      branch: pick<string>(r, "branch.name", "branchName"),
      status: pick<string>(r, "status"),
    })),
  };
}

export function useGetMemberDetails(memberId: string | undefined, scope: ScopeParams | null) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["members", "detail", orgId, memberId, scope],
    queryFn: () => getMemberDetailsAPICall(memberId!, scope!),
    enabled: !!memberId && !!scope && !!orgId,
    select: (res) => toMemberDetails(res.data),
  });
}

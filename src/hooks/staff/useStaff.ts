import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { getStaffAPICall, inviteStaffAPICall } from "@/services/staff";
import { NotificationType, type InviteStaffPayload } from "@/types";
import {
  asObject,
  extractItems,
  extractPagination,
  personName,
  pick,
  type Loose,
} from "@/utils/normalize";

export type StaffRow = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  branches: string[];
  status?: string;
  joinedAt?: string;
  pending: boolean;
};

/** GET /dashboard/staff has no documented schema. Staff may be memberships ({ user, role }) or users. */
function toStaffRow(raw: Loose, i: number): StaffRow {
  const user = asObject(pick(raw, "user") ?? raw);
  const branchList = extractItems<Loose>(
    pick(raw, "branches", "branchAssignments", "assignedBranches") ?? [],
  );
  const single = pick<string>(raw, "branch.name", "branchName");
  return {
    id: String(pick(raw, "id") ?? pick(user, "id") ?? i),
    name: personName(user) ?? personName(raw) ?? pick<string>(raw, "email") ?? "Staff member",
    email: pick<string>(user, "email") ?? pick<string>(raw, "email"),
    phone: pick<string>(user, "phone") ?? pick<string>(raw, "phone"),
    avatar: pick<string>(user, "avatar", "profileImage"),
    role: pick<string>(raw, "role", "organizationRole", "orgRole"),
    branches: [
      ...branchList.map((b) => pick<string>(b, "name", "branch.name") ?? ""),
      ...(single ? [single] : []),
    ].filter(Boolean),
    status: pick<string>(raw, "status") ?? pick<string>(user, "status"),
    joinedAt: pick<string>(raw, "joinedAt", "createdAt"),
    pending:
      pick<string>(raw, "status") === "PENDING" || pick<string>(raw, "type") === "INVITATION",
  };
}

export function useGetStaff(params: { page: number; limit: number }, enabled = true) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["staff", "list", orgId, params],
    queryFn: () => getStaffAPICall(params),
    enabled: enabled && !!orgId,
    placeholderData: keepPreviousData,
    select: (res) => {
      const rows = extractItems<Loose>(res.data, "staff", "members", "users").map(toStaffRow);
      return { rows, pagination: extractPagination(res.data, params.limit, rows.length) };
    },
  });
}

export function useInviteStaff() {
  const qc = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: (payload: InviteStaffPayload) => inviteStaffAPICall(payload),
    onSuccess: (res, vars) => {
      notify(res.message || `Invitation sent to ${vars.email}.`);
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (err) => notify(errorMessage(err), NotificationType.error),
  });
}

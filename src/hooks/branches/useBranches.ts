import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { createBranchAPICall, getBranchQrAPICall, getBranchesAPICall } from "@/services/branches";
import type { CreateBranchPayload, ListParams } from "@/types";
import { extractItems, extractPagination, pick, type Loose } from "@/utils/normalize";

export type BranchRow = {
  id: string;
  name: string;
  code?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  isActive?: boolean;
  createdAt?: string;
  // Counts are not in the spec; shown only when the API happens to include them.
  members?: number;
  staff?: number;
  revenue?: number | string;
};

/** GET /dashboard/branches documents no response schema; this reads the likely shapes. */
export function toBranchRow(raw: Loose): BranchRow {
  const city = pick<string>(raw, "city");
  const state = pick<string>(raw, "state");
  const status = pick<string>(raw, "status");
  const isActive = pick<boolean>(raw, "isActive");
  return {
    id: String(pick(raw, "id") ?? ""),
    name: pick<string>(raw, "name") ?? "Unnamed branch",
    code: pick<string>(raw, "code"),
    address: pick<string>(raw, "address"),
    city,
    state,
    country: pick<string>(raw, "country"),
    // Drop repeats such as "Lagos, Lagos" when city and state share a name.
    location:
      [...new Set([pick<string>(raw, "address"), city, state].filter(Boolean))].join(", ") ||
      undefined,
    email: pick<string>(raw, "email"),
    phone: pick<string>(raw, "phone"),
    isPrimary: Boolean(pick(raw, "isPrimary")),
    isActive: isActive ?? (status ? status.toUpperCase() === "ACTIVE" : undefined),
    createdAt: pick<string>(raw, "createdAt"),
    members: pick<number>(raw, "membersCount", "totalMembers", "_count.members", "stats.members"),
    staff: pick<number>(raw, "staffCount", "totalStaff", "_count.staff", "stats.staff"),
    revenue: pick(raw, "monthlyRevenue", "revenue", "stats.revenue"),
  };
}

export function useGetBranches(params: ListParams, enabled = true) {
  const orgId = useAppSelector((s) => s.auth.activeOrganization?.id);
  return useQuery({
    queryKey: ["branches", "list", orgId, params],
    queryFn: () => getBranchesAPICall(params),
    enabled: enabled && !!orgId,
    placeholderData: keepPreviousData,
    select: (res) => {
      const items = extractItems<Loose>(res.data, "branches").map(toBranchRow);
      return { items, pagination: extractPagination(res.data, params.limit ?? 20, items.length) };
    },
  });
}

/** All branches for selects. The API caps limit at 100. */
export const useBranchOptions = (enabled = true) =>
  useGetBranches({ page: 1, limit: 100 }, enabled);

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => createBranchAPICall(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
}

/** The QR payload shape is undocumented: accept an image data URL, an image URL or a raw token. */
export function useBranchQr(branchId: string | null) {
  return useQuery({
    queryKey: ["branches", "qr", branchId],
    queryFn: () => getBranchQrAPICall(branchId!),
    enabled: !!branchId,
    staleTime: 60_000,
    select: (res) => {
      const d = res.data;
      const value =
        typeof d === "string"
          ? d
          : pick<string>(d, "qrCode", "qrCodeUrl", "qr", "image", "dataUrl", "url");
      const token = pick<string>(d, "qrToken", "token");
      const expiresAt = pick<string>(d, "expiresAt");
      const isImage = !!value && (value.startsWith("data:image") || /^https?:\/\//.test(value));
      return {
        image: isImage ? value : undefined,
        token: token ?? (!isImage ? value : undefined),
        expiresAt,
      };
    },
  });
}

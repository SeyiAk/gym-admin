import type { Tone } from "@/components/shared/StatusBadge";
import type { MemberStatus } from "@/types";

export const MEMBER_TABS: { label: string; value: MemberStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

const STATUS_TONES: Record<string, Tone> = {
  ACTIVE: "brand",
  INACTIVE: "warning",
  SUSPENDED: "danger",
  EXPIRED: "danger",
  PENDING: "warning",
  CANCELLED: "neutral",
  CHECKED_IN: "brand",
  CHECKED_OUT: "info",
};

/** Unknown statuses fall back to neutral and are shown verbatim, never relabelled. */
export const statusTone = (status?: string | null): Tone =>
  STATUS_TONES[(status ?? "").toUpperCase()] ?? "neutral";

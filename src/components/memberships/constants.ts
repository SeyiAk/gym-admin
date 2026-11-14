import type { MembershipStatus } from "@/types";

export const MEMBERSHIP_TABS: { label: string; value: MembershipStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Cancelled", value: "CANCELLED" },
];

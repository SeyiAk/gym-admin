import type { Tone } from "@/components/shared/StatusBadge";

export const GROWTH_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  // The design shows "12 Months"; the API offers 7d, 30d or a custom range, so "Custom" replaces it.
  { label: "Custom", value: "custom" },
] as const;

/** Days-left pill: red ≤3, amber ≤7, grey after (matches the Upcoming Renewals frame). */
export const daysLeftTone = (days: number | null): Tone =>
  days === null ? "neutral" : days <= 3 ? "danger" : days <= 7 ? "warning" : "neutral";

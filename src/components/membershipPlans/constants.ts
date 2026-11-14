import type { DurationUnit, MembershipPlan } from "@/types";

export const DURATION_UNITS: { label: string; value: DurationUnit }[] = [
  { label: "Day(s)", value: "DAY" },
  { label: "Week(s)", value: "WEEK" },
  { label: "Month(s)", value: "MONTH" },
  { label: "Year(s)", value: "YEAR" },
];

/** "/ month", "/ 3 months". */
export const perLabel = (duration: number, unit: DurationUnit) => {
  const u = unit.toLowerCase();
  return duration === 1 ? `/ ${u}` : `/ ${duration} ${u}s`;
};

/** Card accents cycle through the design's four tiers (blue, amber, green, violet). */
export const PLAN_ACCENTS = [
  {
    badge: "bg-info/15 text-info",
    text: "text-info",
    button: "border-info text-info hover:bg-info/10",
  },
  {
    badge: "bg-warning/15 text-warning",
    text: "text-warning",
    button: "border-warning text-warning hover:bg-warning/10",
  },
  {
    badge: "bg-appPrimarySoft text-appPrimary",
    text: "text-appPrimary",
    button: "border-appPrimary text-appPrimary hover:bg-appPrimarySoft",
  },
  {
    badge: "bg-violet/15 text-violet",
    text: "text-violet",
    button: "border-violet text-violet hover:bg-violet/10",
  },
];

/** "Most Popular" is derived: the plan with the most active members, if any plan has members. */
export const mostPopularId = (plans: MembershipPlan[]) => {
  const top = [...plans].sort((a, b) => (b.activeMembers ?? 0) - (a.activeMembers ?? 0))[0];
  return top && top.activeMembers > 0 ? top.id : null;
};

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/types";
import { formatCurrency, formatNumber } from "@/utils/helper";
import { perLabel, PLAN_ACCENTS } from "./constants";

type Props = {
  plan: MembershipPlan;
  index: number;
  popular: boolean;
  canEdit: boolean;
  onEdit: () => void;
};

export function PlanCard({ plan, index, popular, canEdit, onEdit }: Props) {
  const accent = PLAN_ACCENTS[index % PLAN_ACCENTS.length];
  return (
    <article
      className={cn(
        "card relative flex min-w-0 flex-col gap-6 p-8",
        popular && "border-appPrimary",
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-page bg-appPrimary px-3 py-1 text-xs font-bold text-appPrimaryInk">
          Most Popular
        </span>
      )}
      <div className="flex flex-col gap-3 border-b border-line pb-6">
        <span
          className={cn("self-start rounded-md px-2.5 py-1 text-sm font-semibold", accent.badge)}
        >
          {plan.name}
        </span>
        <p className="flex items-baseline gap-3">
          <span className="text-[2.5rem] font-bold leading-none text-white">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-lg text-muted">{perLabel(plan.duration, plan.durationUnit)}</span>
        </p>
        <p className="text-sm text-subtle">
          <span className={cn("font-bold", accent.text)}>{formatNumber(plan.activeMembers)}</span>{" "}
          active members
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-3 text-base text-muted">
        {/* The API has no feature list; the description and plan terms stand in for the design's bullets. */}
        {plan.description && (
          <li className="flex gap-2.5">
            <Check className="mt-1 size-4 shrink-0 text-appPrimary" />
            {plan.description}
          </li>
        )}
        <li className="flex gap-2.5">
          <Check className="mt-1 size-4 shrink-0 text-appPrimary" />
          {plan.duration} {plan.durationUnit.toLowerCase()}
          {plan.duration > 1 ? "s" : ""} of access
        </li>
        <li className="flex gap-2.5">
          <Check className="mt-1 size-4 shrink-0 text-appPrimary" />
          {plan.gracePeriod ? `${plan.gracePeriod}-day grace period` : "No grace period"}
        </li>
        <li className="flex gap-2.5">
          <Check className="mt-1 size-4 shrink-0 text-appPrimary" />
          {formatCurrency(plan.revenue)} revenue to date
        </li>
      </ul>
      {canEdit && (
        <Button
          variant={popular ? "primary" : "outline"}
          size="lg"
          onClick={onEdit}
          className={cn(!popular && "bg-transparent", !popular && accent.button)}
        >
          Edit Plan
        </Button>
      )}
    </article>
  );
}

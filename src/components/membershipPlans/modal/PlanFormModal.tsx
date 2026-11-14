import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { ActionModal } from "@/components/shared/modalForm/ActionModal";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Input, inputClass, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreatePlan, useUpdatePlan } from "@/hooks/membershipPlans/useMembershipPlans";
import type { DurationUnit, MembershipPlan } from "@/types";
import { DURATION_UNITS } from "../constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName?: string;
  plan?: MembershipPlan | null;
};

const empty = {
  name: "",
  description: "",
  price: "",
  duration: "1",
  durationUnit: "MONTH" as DurationUnit,
  gracePeriod: "0",
};
type Form = typeof empty;

export function PlanFormModal({ open, onOpenChange, branchId, branchName, plan }: Props) {
  const create = useCreatePlan();
  const update = useUpdatePlan();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const editing = !!plan;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      plan
        ? {
            name: plan.name,
            description: plan.description ?? "",
            price: String(plan.price),
            duration: String(plan.duration),
            durationUnit: plan.durationUnit,
            gracePeriod: String(plan.gracePeriod ?? 0),
          }
        : empty,
    );
  }, [open, plan]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "Enter a plan name";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter a price above 0";
    if (!Number.isInteger(Number(form.duration)) || Number(form.duration) < 1)
      next.duration = "Whole number, at least 1";
    if (!Number.isInteger(Number(form.gracePeriod)) || Number(form.gracePeriod) < 0)
      next.gracePeriod = "Whole number, 0 or more";
    setErrors(next);
    if (Object.keys(next).length) return;

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      duration: Number(form.duration),
      durationUnit: form.durationUnit,
      gracePeriod: Number(form.gracePeriod),
    };
    const done = { onSuccess: () => onOpenChange(false) };
    if (plan) update.mutate({ id: plan.id, ...body }, done);
    else create.mutate({ branchId, ...body }, done);
  };

  return (
    <ActionModal
      open={open}
      onOpenChange={onOpenChange}
      icon={<Tag className="size-5" />}
      title={editing ? "Edit plan" : "Add membership plan"}
      description={
        editing
          ? "Price changes apply to new memberships only; existing members keep the price they paid."
          : `Plans are branch-specific. This plan will be added to ${branchName ?? "the selected branch"}.`
      }
      submitLabel={editing ? "Save changes" : "Create plan"}
      onSubmit={submit}
      loading={create.isPending || update.isPending}
    >
      <FormField label="Plan name" htmlFor="plan-name" error={errors.name} required>
        <Input
          id="plan-name"
          placeholder="e.g. Monthly Membership"
          value={form.name}
          aria-invalid={!!errors.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </FormField>
      <FormField label="Description" htmlFor="plan-desc" hint="What members get with this plan.">
        <Textarea
          id="plan-desc"
          placeholder="Access to the gym floor and locker rooms"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </FormField>
      <FormField label="Price (₦)" htmlFor="plan-price" error={errors.price} required>
        <NumericFormat
          id="plan-price"
          className={inputClass}
          thousandSeparator=","
          decimalScale={2}
          allowNegative={false}
          prefix="₦"
          placeholder="₦15,000"
          value={form.price}
          aria-invalid={!!errors.price}
          onValueChange={(v) => set("price", v.value)}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Duration" htmlFor="plan-duration" error={errors.duration} required>
          <Input
            id="plan-duration"
            type="number"
            min={1}
            step={1}
            value={form.duration}
            aria-invalid={!!errors.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
        </FormField>
        <FormField label="Unit" required>
          <Select
            value={form.durationUnit}
            onValueChange={(v) => set("durationUnit", v as DurationUnit)}
            options={DURATION_UNITS}
          />
        </FormField>
      </div>
      <FormField
        label="Grace period (days)"
        htmlFor="plan-grace"
        error={errors.gracePeriod}
        hint="Days a member keeps access after the plan ends."
      >
        <Input
          id="plan-grace"
          type="number"
          min={0}
          step={1}
          value={form.gracePeriod}
          aria-invalid={!!errors.gracePeriod}
          onChange={(e) => set("gracePeriod", e.target.value)}
        />
      </FormField>
    </ActionModal>
  );
}

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/shared/EmptyState";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrganization, useUpdateOrganization } from "@/hooks/settings/useSettings";
import { useAppSelector } from "@/hooks/useTypedSelector";
import type { Organization } from "@/types";
import { canEditOrganization } from "@/utils/roleAccess";

type Form = Omit<Organization, "id" | "description" | "logo"> & {
  description: string;
  logo: string;
};
type Errors = Partial<Record<keyof Form, string>>;

// Constraints from the PATCH /organizations/{id} schema.
function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2 || f.name.length > 100) e.name = "2–100 characters";
  if (!/^[a-z0-9-]{2,100}$/.test(f.slug)) e.slug = "Lowercase letters, numbers and hyphens";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  if (f.phone.length < 10 || f.phone.length > 20) e.phone = "10–20 characters";
  if (f.address.trim().length < 5) e.address = "At least 5 characters";
  (["city", "state", "country"] as const).forEach((k) => {
    if (f[k].trim().length < 2) e[k] = "Required";
  });
  if (f.description.length > 500) e.description = "500 characters max";
  if (f.logo && !/^https?:\/\/\S+$/.test(f.logo)) e.logo = "Enter a full URL (https://…)";
  return e;
}

export function GymTab() {
  const active = useAppSelector((s) => s.auth.activeOrganization);
  const canEdit = canEditOrganization(active?.role);
  const org = useGetOrganization(active?.id);
  const update = useUpdateOrganization();
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (org.data) {
      const { id: _id, ...rest } = org.data;
      void _id;
      setForm({ ...rest, description: rest.description ?? "", logo: rest.logo ?? "" });
    }
  }, [org.data]);

  if (org.isLoading || (!form && !org.error)) return <Skeleton className="h-[32rem] rounded-2xl" />;
  if (org.error || !form)
    return (
      <div className="card">
        <ErrorState
          message={(org.error as Error)?.message ?? "Not found"}
          onRetry={() => org.refetch()}
        />
      </div>
    );

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));
  const field = (k: keyof Form, label: string, props: React.ComponentProps<"input"> = {}) => (
    <FormField label={label} htmlFor={`org-${k}`} error={errors[k]}>
      <Input
        id={`org-${k}`}
        value={form[k]}
        disabled={!canEdit}
        aria-invalid={!!errors[k]}
        onChange={(e) => set(k, e.target.value)}
        {...props}
      />
    </FormField>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length || !active) return;
    // PATCH: send only what changed.
    const original = org.data!;
    const changed = Object.fromEntries(
      Object.entries(form).filter(([k, val]) => (original[k as keyof Organization] ?? "") !== val),
    );
    if (!Object.keys(changed).length) return;
    update.mutate({ id: active.id, ...changed });
  };

  return (
    <form onSubmit={submit} noValidate className="card flex flex-col gap-6 p-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Gym details</h2>
        <p className="text-base text-muted">
          {canEdit
            ? "Shown to members in the HG FitAccess app."
            : "Only owners and general managers can edit these details."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {field("name", "Gym name")}
        {field("slug", "URL slug", {
          onChange: (e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")),
        })}
        {field("email", "Email", { type: "email" })}
        {field("phone", "Phone", { type: "tel" })}
      </div>
      {field("address", "Address")}
      <div className="grid grid-cols-3 gap-5">
        {field("city", "City")}
        {field("state", "State")}
        {field("country", "Country")}
      </div>
      {field("logo", "Logo URL", { placeholder: "https://…" })}
      <FormField
        label="Description"
        htmlFor="org-description"
        error={errors.description}
        hint={`${form.description.length}/500`}
      >
        <Textarea
          id="org-description"
          value={form.description}
          disabled={!canEdit}
          onChange={(e) => set("description", e.target.value)}
        />
      </FormField>
      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending}>
            Save changes
          </Button>
        </div>
      )}
    </form>
  );
}

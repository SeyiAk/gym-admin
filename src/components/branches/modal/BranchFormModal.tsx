import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionModal } from "@/components/shared/modalForm/ActionModal";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCreateBranch } from "@/hooks/branches/useBranches";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { NotificationType } from "@/types";

const empty = {
  name: "",
  code: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
  isPrimary: false,
};
type Form = typeof empty;
type Errors = Partial<Record<keyof Form, string>>;

// Rules mirror the documented branch schema (POST /organizations/{id}/branches).
function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "At least 2 characters";
  if (!/^[A-Z0-9-]{2,20}$/.test(f.code)) e.code = "2–20 characters: A–Z, 0–9 and hyphens";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  if (f.phone && (f.phone.length < 10 || f.phone.length > 20)) e.phone = "10–20 characters";
  if (f.address.trim().length < 5) e.address = "At least 5 characters";
  if (f.city.trim().length < 2) e.city = "Required";
  if (f.state.trim().length < 2) e.state = "Required";
  if (f.country.trim().length < 2) e.country = "Required";
  return e;
}

export function BranchFormModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const create = useCreateBranch();
  const notify = useNotify();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setForm(empty);
      setErrors({});
    }
  }, [open]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    create.mutate(
      {
        name: form.name.trim(),
        code: form.code,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        isPrimary: form.isPrimary,
      },
      {
        onSuccess: (res) => {
          notify(res.message || "Branch created.");
          onOpenChange(false);
        },
        onError: (err) => notify(errorMessage(err), NotificationType.error),
      },
    );
  };

  const text = (
    key: keyof Omit<Form, "isPrimary">,
    label: string,
    props: React.ComponentProps<"input"> = {},
    required = true,
  ) => (
    <FormField label={label} htmlFor={`branch-${key}`} error={errors[key]} required={required}>
      <Input
        id={`branch-${key}`}
        value={form[key]}
        aria-invalid={!!errors[key]}
        onChange={(e) => set(key, e.target.value)}
        {...props}
      />
    </FormField>
  );

  return (
    <ActionModal
      open={open}
      onOpenChange={onOpenChange}
      icon={<MapPin className="size-5" />}
      title="Add new branch"
      description="Members check in at a branch by scanning its QR code."
      submitLabel="Create branch"
      onSubmit={submit}
      loading={create.isPending}
      className="max-w-[40rem]"
    >
      <div className="grid grid-cols-2 gap-4">
        {text("name", "Branch name", { placeholder: "Ikeja Main Branch" })}
        <FormField
          label="Branch code"
          htmlFor="branch-code"
          error={errors.code}
          required
          hint="e.g. IKEJA-001"
        >
          <Input
            id="branch-code"
            value={form.code}
            placeholder="IKEJA-001"
            aria-invalid={!!errors.code}
            onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
            maxLength={20}
          />
        </FormField>
        {text("email", "Email", { type: "email", placeholder: "ikeja@yourgym.com" }, false)}
        {text("phone", "Phone", { type: "tel", placeholder: "08012345678" }, false)}
      </div>
      {text("address", "Address", { placeholder: "12 Allen Avenue" })}
      <div className="grid grid-cols-3 gap-4">
        {text("city", "City", { placeholder: "Ikeja" })}
        {text("state", "State", { placeholder: "Lagos" })}
        {text("country", "Country")}
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-page px-4 py-3">
        <span>
          <span className="block text-base font-semibold text-white">Primary branch</span>
          <span className="block text-sm text-muted">Your organization's main location.</span>
        </span>
        <Switch checked={form.isPrimary} onCheckedChange={(v) => set("isPrimary", v)} />
      </label>
    </ActionModal>
  );
}

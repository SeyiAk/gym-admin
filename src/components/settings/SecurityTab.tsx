import { useState } from "react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Button } from "@/components/ui/button";
import { useChangePassword } from "@/hooks/auth/useAuth";

const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function SecurityTab() {
  const change = useChangePassword();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<typeof empty>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<typeof empty> = {};
    if (!form.currentPassword) next.currentPassword = "Enter your current password";
    if (form.newPassword.length < 8) next.newPassword = "Use at least 8 characters";
    else if (form.newPassword === form.currentPassword)
      next.newPassword = "Choose a different password";
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;
    change.mutate(form, { onSuccess: () => setForm(empty) });
  };

  return (
    <form onSubmit={submit} noValidate className="card flex max-w-[40rem] flex-col gap-6 p-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Change password</h2>
        <p className="text-base text-muted">You'll stay signed in on this device.</p>
      </div>
      <FormField label="Current password" htmlFor="cur" error={errors.currentPassword}>
        <PasswordInput
          id="cur"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
      </FormField>
      <FormField label="New password" htmlFor="new" error={errors.newPassword}>
        <PasswordInput
          id="new"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </FormField>
      <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirmPassword}>
        <PasswordInput
          id="confirm"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={change.isPending}>
          Update password
        </Button>
      </div>
    </form>
  );
}

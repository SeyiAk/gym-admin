import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/auth/useAuth";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { REDIRECT_KEY } from "@/layout/DashboardLayout";
import { NotificationType } from "@/types";
import { PasswordInput } from "./PasswordInput";

export default function LoginComponent() {
  const navigate = useNavigate();
  const notify = useNotify();
  const login = useLogin();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<typeof form> = {};
    if (!form.identifier.trim()) next.identifier = "Enter your email or phone number";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;

    login.mutate(
      { identifier: form.identifier.trim(), password: form.password },
      {
        onSuccess: (res) => {
          notify(`Welcome back, ${res.data.user.firstName}.`);
          const redirect = sessionStorage.getItem(REDIRECT_KEY);
          sessionStorage.removeItem(REDIRECT_KEY);
          // DashboardLayout loads the role and bounces to the landing page if the redirect isn't allowed.
          navigate(redirect || "/overview", { replace: true });
        },
        onError: (err) => notify(errorMessage(err), NotificationType.error),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Welcome back</h1>
        <p className="text-lg text-muted">Sign in to manage your gym.</p>
      </div>
      <div className="flex flex-col gap-5">
        <FormField label="Email or phone number" htmlFor="identifier" error={errors.identifier}>
          <Input
            id="identifier"
            autoComplete="username"
            placeholder="you@gym.com or 0801 234 5678"
            value={form.identifier}
            aria-invalid={!!errors.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            aria-invalid={!!errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormField>
        <Link
          to="/forgotPassword"
          className="self-end text-base font-semibold text-appPrimary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" loading={login.isPending}>
        Sign in
      </Button>
    </form>
  );
}

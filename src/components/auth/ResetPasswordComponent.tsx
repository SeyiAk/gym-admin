import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { useForgotPassword, useResetPassword } from "@/hooks/auth/useAuth";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { NotificationType } from "@/types";
import { PasswordInput } from "./PasswordInput";

type Errors = Partial<Record<"email" | "otp" | "password" | "confirmPassword", string>>;

export default function ResetPasswordComponent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const reset = useResetPassword();
  const resend = useForgotPassword();
  const [form, setForm] = useState({
    email: params.get("email") ?? "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!form.email.trim()) next.email = "Enter your email address";
    if (form.otp.length !== 6) next.otp = "Enter the 6-digit code from your email";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;

    reset.mutate(
      { ...form, email: form.email.trim() },
      {
        onSuccess: (res) => {
          notify(res.message || "Password reset successfully. Sign in with your new password.");
          navigate("/", { replace: true });
        },
        onError: (err) => notify(errorMessage(err), NotificationType.error),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <Link
        to="/forgotPassword"
        className="flex items-center gap-2 text-base text-muted hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Reset password</h1>
        <p className="text-lg text-muted">
          Enter the code we emailed you and choose a new password.
        </p>
      </div>
      <div className="flex flex-col gap-5">
        {!params.get("email") && (
          <FormField label="Email address" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
        )}
        <FormField label="Reset code" error={errors.otp}>
          <InputOTP
            maxLength={6}
            value={form.otp}
            onChange={(otp) => setForm({ ...form, otp })}
            inputMode="numeric"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTP>
        </FormField>
        <button
          type="button"
          disabled={resend.isPending || !form.email}
          onClick={() =>
            resend.mutate(form.email.trim(), {
              onSuccess: () => notify("A new code is on its way.", NotificationType.info),
              onError: (err) => notify(errorMessage(err), NotificationType.error),
            })
          }
          className="self-start text-base font-semibold text-appPrimary hover:underline disabled:opacity-50"
        >
          Resend code
        </button>
        <FormField label="New password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormField>
        <FormField
          label="Confirm new password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </FormField>
      </div>
      <Button type="submit" size="lg" loading={reset.isPending}>
        Reset password
      </Button>
    </form>
  );
}

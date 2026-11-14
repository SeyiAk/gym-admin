import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/auth/useAuth";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { NotificationType } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordComponent() {
  const navigate = useNavigate();
  const notify = useNotify();
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address");
    setError("");
    forgot.mutate(email.trim(), {
      onSuccess: (res) => {
        // The API never reveals whether the email exists; pass its neutral message through.
        notify(
          res.message || "If the email exists, a reset code has been sent.",
          NotificationType.info,
        );
        navigate(`/resetPassword?email=${encodeURIComponent(email.trim())}`);
      },
      onError: (err) => notify(errorMessage(err), NotificationType.error),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <Link to="/" className="flex items-center gap-2 text-base text-muted hover:text-white">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Forgot password?</h1>
        <p className="text-lg text-muted">
          Enter your account email and we'll send you a 6-digit reset code.
        </p>
      </div>
      <FormField label="Email address" htmlFor="email" error={error}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@gym.com"
          value={email}
          aria-invalid={!!error}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <Button type="submit" size="lg" loading={forgot.isPending}>
        Send reset code
      </Button>
    </form>
  );
}

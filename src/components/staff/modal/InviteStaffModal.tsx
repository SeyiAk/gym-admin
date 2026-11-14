import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionModal } from "@/components/shared/modalForm/ActionModal";
import { FormField } from "@/components/shared/modalForm/FormField";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useInviteStaff } from "@/hooks/staff/useStaff";
import { useAppSelector } from "@/hooks/useTypedSelector";
import type { InviteRole } from "@/types";
import { invitableRoles, ROLE_LABELS } from "@/utils/roleAccess";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteStaffModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const roles = invitableRoles(role);
  const invite = useInviteStaff();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("RECEPTIONIST");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setEmail("");
      setInviteRole("RECEPTIONIST");
      setError("");
    }
  }, [open]);

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address");
    setError("");
    invite.mutate(
      { email: email.trim().toLowerCase(), role: inviteRole },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <ActionModal
      open={open}
      onOpenChange={onOpenChange}
      icon={<UserPlus className="size-5" />}
      title="Invite staff member"
      description="They'll get an email invitation to join your gym on HG FitAccess."
      submitLabel="Send invitation"
      onSubmit={submit}
      loading={invite.isPending}
    >
      <FormField label="Email address" htmlFor="invite-email" error={error} required>
        <Input
          id="invite-email"
          type="email"
          placeholder="staff@yourgym.com"
          value={email}
          aria-invalid={!!error}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Role" required hint="Managers and receptionists work within a branch.">
        <Select
          value={inviteRole}
          onValueChange={(v) => setInviteRole(v as InviteRole)}
          options={roles.map((r) => ({ label: ROLE_LABELS[r], value: r }))}
        />
      </FormField>
    </ActionModal>
  );
}

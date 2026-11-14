import { CheckCircle2, XCircle } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { display, formatDate, fullName } from "@/utils/helper";
import { ROLE_LABELS } from "@/utils/roleAccess";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[14rem_1fr] gap-4 border-b border-line py-4 text-base last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

const Verified = ({ ok }: { ok?: boolean }) =>
  ok ? (
    <span className="ml-2 inline-flex items-center gap-1 text-sm text-appPrimary">
      <CheckCircle2 className="size-4" />
      Verified
    </span>
  ) : (
    <span className="ml-2 inline-flex items-center gap-1 text-sm text-subtle">
      <XCircle className="size-4" />
      Not verified
    </span>
  );

/** Read-only: the API has no endpoint for staff to edit their own profile. */
export function ProfileTab() {
  const { user, activeOrganization } = useAppSelector((s) => s.auth);
  const name = user?.displayName || fullName(user);
  return (
    <section className="card flex flex-col gap-6 p-8">
      <div className="flex items-center gap-5">
        <Avatar name={name} src={user?.avatar} className="size-20 text-2xl" />
        <div>
          <p className="text-2xl font-bold text-white">{name}</p>
          <p className="text-lg text-muted">
            {activeOrganization
              ? `${ROLE_LABELS[activeOrganization.role]} · ${activeOrganization.name}`
              : ""}
          </p>
        </div>
      </div>
      <div>
        <Row label="First name" value={display(user?.firstName)} />
        <Row label="Last name" value={display(user?.lastName)} />
        <Row
          label="Email"
          value={
            <>
              {display(user?.email)}
              <Verified ok={user?.isEmailVerified} />
            </>
          }
        />
        <Row
          label="Phone"
          value={
            <>
              {display(user?.phone)}
              <Verified ok={user?.isPhoneVerified} />
            </>
          }
        />
        <Row label="Account created" value={formatDate(user?.createdAt)} />
      </div>
    </section>
  );
}

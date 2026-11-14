import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBranchQr, type BranchRow } from "@/hooks/branches/useBranches";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { display, formatDate } from "@/utils/helper";
import { canGenerateBranchQr } from "@/utils/roleAccess";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-line py-3.5 text-base last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}

export function BranchDetailsDrawer({
  branch,
  onClose,
}: {
  branch: BranchRow | null;
  onClose: () => void;
}) {
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const canQr = canGenerateBranchQr(role);
  const qr = useBranchQr(branch && canQr ? branch.id : null);

  return (
    <Drawer open={!!branch} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        {branch && (
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-2 border-b border-line p-6 pr-14">
              <DrawerTitle>{branch.name}</DrawerTitle>
              <DrawerDescription>{display(branch.location)}</DrawerDescription>
              <div className="flex gap-2">
                {branch.isActive !== undefined && (
                  <StatusBadge tone={branch.isActive ? "brand" : "danger"}>
                    {branch.isActive ? "Open" : "Closed"}
                  </StatusBadge>
                )}
                {branch.isPrimary && <StatusBadge tone="info">Primary</StatusBadge>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <Row label="Branch code" value={display(branch.code)} />
              <Row label="Email" value={display(branch.email)} />
              <Row label="Phone" value={display(branch.phone)} />
              <Row label="Address" value={display(branch.address)} />
              <Row
                label="City / State"
                value={display([branch.city, branch.state].filter(Boolean).join(", "))}
              />
              <Row label="Country" value={display(branch.country)} />
              <Row label="Created" value={formatDate(branch.createdAt)} />

              {canQr && (
                <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-line bg-page p-6">
                  <div className="flex items-center gap-2 self-start text-lg font-bold text-white">
                    <QrCode className="size-5 text-appPrimary" /> Check-in QR code
                  </div>
                  {qr.isLoading ? (
                    <Skeleton className="size-56" />
                  ) : qr.error ? (
                    <p className="text-center text-base text-danger">
                      {(qr.error as Error).message}
                    </p>
                  ) : qr.data?.image ? (
                    <>
                      <img
                        src={qr.data.image}
                        alt={`${branch.name} check-in QR code`}
                        className="size-56 rounded-xl bg-white p-3"
                      />
                      <Button variant="outline" asChild>
                        <a href={qr.data.image} download={`${branch.code ?? branch.name}-qr.png`}>
                          <Download /> Download
                        </a>
                      </Button>
                    </>
                  ) : qr.data?.token ? (
                    // The API returned a raw token rather than an image; show it so it can be encoded.
                    <p className="break-all rounded-lg bg-surface p-3 font-mono text-xs text-muted">
                      {qr.data.token}
                    </p>
                  ) : (
                    <p className="text-base text-muted">No QR code returned.</p>
                  )}
                  {qr.data?.expiresAt && (
                    <p className="text-sm text-subtle">
                      Expires {formatDate(qr.data.expiresAt, "MMM D, YYYY h:mm A")}
                    </p>
                  )}
                  <p className="text-center text-sm text-subtle">
                    Print this at the front desk. Members scan it in the app to check in and out.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

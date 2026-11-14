import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
  destructive?: boolean;
  footer?: React.ReactNode;
  className?: string;
};

/** Every create, update and confirm dialog. Fields go in as children; the form submits on Enter. */
export function ActionModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onSubmit,
  loading,
  submitDisabled,
  destructive,
  footer,
  className,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className={cn("max-w-[34rem]", className)}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitDisabled && !loading) onSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-appPrimarySoft text-appPrimary">
                {icon}
              </div>
            )}
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">{title}</DialogDescription>
              )}
            </div>
          </div>
          {children && (
            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">{children}</div>
          )}
          {footer ?? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                variant={destructive ? "danger" : "primary"}
                loading={loading}
                disabled={submitDisabled}
              >
                {submitLabel}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

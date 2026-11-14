import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  header: string;
  subHeader?: string;
  icon?: LucideIcon;
  className?: string;
  action?: React.ReactNode;
};

export function EmptyState({ header, subHeader, icon: Icon = Inbox, className, action }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-line/60">
        <Icon className="size-6 text-muted" />
      </div>
      <p className="text-lg font-bold text-white">{header}</p>
      {subHeader && <p className="max-w-md text-base text-muted">{subHeader}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={AlertTriangle}
      header="Couldn't load this data"
      subHeader={message}
      className={className}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}

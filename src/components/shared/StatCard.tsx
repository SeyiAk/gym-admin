import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  label: string;
  value?: React.ReactNode;
  /** Percentage change; omitted when the API doesn't provide one. */
  change?: number | null;
  changeLabel?: string;
  loading?: boolean;
  className?: string;
};

/** KPI tile from the designs. Never rendered with placeholder numbers: no value, no tile content. */
export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  loading,
  className,
}: Props) {
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const down = hasChange && change! < 0;
  return (
    <div className={cn("card flex min-w-0 flex-1 items-center gap-4 p-6", className)}>
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-appPrimarySoft">
        <Icon className="size-[1.375rem] text-appPrimary" strokeWidth={2} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-lg font-medium text-muted">{label}</p>
        {loading ? (
          <Skeleton className="h-10 w-28" />
        ) : (
          <p className="truncate text-4xl font-bold text-white">{value ?? "N/A"}</p>
        )}
        {!loading && hasChange && (
          <div className="flex items-center gap-1 text-base">
            {down ? (
              <ArrowDown className="size-3 text-danger" strokeWidth={3} />
            ) : (
              <ArrowUp className="size-3 text-appPrimary" strokeWidth={3} />
            )}
            <span className={cn("font-bold", down ? "text-danger" : "text-appPrimary")}>
              {Math.abs(change!).toFixed(Math.abs(change!) < 10 && change! % 1 ? 1 : 0)}%
            </span>
            {changeLabel && <span className="truncate text-subtle">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageSize: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
};

const SIZES = [10, 20, 50, 100];

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…" as const, p] : [p]));
}

export function Pagination({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
  className,
}: Props) {
  const btn =
    "flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-3 text-sm text-subtle">
        {onPageSizeChange && (
          <>
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
              options={SIZES.map((s) => ({ label: String(s), value: String(s) }))}
              triggerClassName="h-9 w-20 text-sm"
            />
          </>
        )}
        {typeof total === "number" && <span>{total.toLocaleString()} total</span>}
      </div>
      <div className="flex items-center gap-1">
        <button
          className={cn(btn, "text-muted hover:bg-line")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, Math.max(totalPages, 1)).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-subtle">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                btn,
                p === page ? "bg-appPrimary text-appPrimaryInk" : "text-muted hover:bg-line",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          className={cn(btn, "text-muted hover:bg-line")}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

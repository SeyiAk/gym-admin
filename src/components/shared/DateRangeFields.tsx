import { cn } from "@/lib/utils";

type Props = {
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
  max?: string;
  className?: string;
};

const field =
  "h-10 rounded-lg border border-line bg-page px-3 text-sm text-white outline-none focus:border-appPrimary/60 [color-scheme:dark]";

/** Compact YYYY-MM-DD range for "Custom" periods. A half-filled range is the caller's to ignore. */
export function DateRangeFields({ start, end, onChange, max, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="date"
        aria-label="Start date"
        className={field}
        value={start}
        max={end || max}
        onChange={(e) => onChange({ start: e.target.value, end })}
      />
      <span className="text-subtle">–</span>
      <input
        type="date"
        aria-label="End date"
        className={field}
        value={end}
        min={start}
        max={max}
        onChange={(e) => onChange({ start, end: e.target.value })}
      />
    </div>
  );
}

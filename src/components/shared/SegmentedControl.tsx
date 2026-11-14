import { cn } from "@/lib/utils";

type Option<T extends string> = { label: string; value: T; disabled?: boolean };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "pills": the table tabs (All / Active / ...). "track": the chart period switcher. */
  variant?: "pills" | "track";
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "pills",
  className,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1",
        variant === "track" && "rounded-[0.625rem] bg-page p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              variant === "track" ? "px-4 py-2 text-base" : "px-4 py-2 text-sm",
              active ? "bg-appPrimary text-appPrimaryInk" : "text-muted hover:text-white",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

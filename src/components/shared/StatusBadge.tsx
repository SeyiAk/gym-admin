import { cn } from "@/lib/utils";

export type Tone = "brand" | "info" | "danger" | "warning" | "neutral" | "violet";

const TONES: Record<Tone, string> = {
  brand: "bg-appPrimarySoft text-appPrimary",
  info: "bg-info/12 text-info",
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-[#9BA3AF]/10 text-muted",
  violet: "bg-violet/12 text-violet",
};

type Props = { tone?: Tone; children: React.ReactNode; className?: string; size?: "sm" | "md" };

export function StatusBadge({ tone = "neutral", children, className, size = "sm" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap font-bold",
        size === "md" ? "rounded-full px-3 py-1 text-base" : "rounded-md px-2 py-1 text-xs",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";
import { initials } from "@/utils/helper";

// Avatar fills cycle through the design's palette, keyed on the name so a person keeps their colour.
const FILLS = ["#34D399", "#3B82F6", "#EF5350", "#A78BFA", "#ACF699", "#F2C94C"];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

type Props = { name?: string | null; src?: string | null; className?: string };

export function Avatar({ name, src, className }: Props) {
  const label = name ?? "";
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={cn("size-9 shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-appPrimaryInk",
        className,
      )}
      style={{ backgroundColor: FILLS[hash(label) % FILLS.length] }}
    >
      {initials(label)}
    </span>
  );
}

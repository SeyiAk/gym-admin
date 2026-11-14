import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  onSubmit,
}: Props) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn(
        "flex h-[3.75rem] items-center gap-2.5 rounded-xl border border-line bg-surface px-4 focus-within:border-appPrimary/50",
        className,
      )}
    >
      <Search className="size-[1.125rem] shrink-0 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-subtle"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-subtle hover:text-white"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}

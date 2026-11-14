import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { label: string; value: string };

type Props = {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  itemClassName?: string;
  id?: string;
  "aria-invalid"?: boolean;
};

/** Radix select styled like the design's inputs. Selected and hovered rows use the brand colour. */
function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  disabled,
  triggerClassName,
  itemClassName,
  ...rest
}: Props) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-line bg-page px-4 text-base text-white outline-none focus:border-appPrimary/60 disabled:opacity-60 data-[placeholder]:text-subtle aria-invalid:border-danger",
          triggerClassName,
        )}
        {...rest}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[60] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className={cn(
                  "flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-base text-muted outline-none data-[highlighted]:bg-appPrimarySoft data-[highlighted]:text-appPrimary data-[state=checked]:text-appPrimary",
                  itemClassName,
                )}
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select };

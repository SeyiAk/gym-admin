import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  destructive,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { destructive?: boolean }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2.5 text-base text-muted outline-none data-[highlighted]:bg-line data-[highlighted]:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4",
        destructive && "text-danger data-[highlighted]:text-danger",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckItem({
  checked,
  children,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { checked?: boolean }) {
  return (
    <DropdownMenuItem className={cn(checked && "text-appPrimary", className)} {...props}>
      <span className="flex-1">{children}</span>
      {checked && <Check />}
    </DropdownMenuItem>
  );
}

const DropdownMenuLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
  <DropdownMenuPrimitive.Label
    className={cn("px-3 py-2 text-sm text-subtle", className)}
    {...props}
  />
);
const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator className={cn("my-1 h-px bg-line", className)} {...props} />
);

export {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};

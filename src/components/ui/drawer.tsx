import { X } from "lucide-react";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root direction="right" {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <DrawerPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[32rem] flex-col border-l border-line bg-surface outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DrawerPrimitive.Close className="absolute right-5 top-5 rounded-lg p-1 text-muted hover:bg-line hover:text-white">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DrawerPrimitive.Close>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

const DrawerTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) => (
  <DrawerPrimitive.Title className={cn("text-xl font-bold text-white", className)} {...props} />
);
const DrawerDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) => (
  <DrawerPrimitive.Description className={cn("text-base text-muted", className)} {...props} />
);

export { Drawer, DrawerContent, DrawerDescription, DrawerTitle };

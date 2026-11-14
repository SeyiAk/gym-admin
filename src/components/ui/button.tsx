import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-appPrimary/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-appPrimary text-appPrimaryInk hover:bg-appPrimary/90",
        soft: "bg-appPrimarySoft text-appPrimary hover:bg-appPrimary/20",
        secondary: "bg-line text-muted hover:text-white hover:bg-line/80",
        outline: "border border-line bg-surface text-white hover:bg-line/60",
        ghost: "text-muted hover:text-white hover:bg-line/60",
        danger: "bg-danger text-white hover:bg-danger/90",
        link: "text-appPrimary hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-3 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-base [&_svg]:size-4",
        lg: "h-12 px-6 text-lg [&_svg]:size-5",
        icon: "size-8 rounded-lg [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };

function Button({
  className,
  variant,
  size,
  asChild,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };

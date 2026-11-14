import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-xl border border-line bg-page px-4 text-base text-white placeholder:text-subtle outline-none transition-colors focus:border-appPrimary/60 disabled:opacity-60 aria-invalid:border-danger";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "h-auto min-h-24 py-3", className)} {...props} />;
}

export { Input, Textarea };

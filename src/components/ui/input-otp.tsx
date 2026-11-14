import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";
import { cn } from "@/lib/utils";

function InputOTP({ className, ...props }: React.ComponentProps<typeof OTPInput>) {
  return <OTPInput containerClassName={cn("flex items-center gap-3", className)} {...props} />;
}

function InputOTPSlot({ index }: { index: number }) {
  const ctx = React.useContext(OTPInputContext);
  const slot = ctx.slots[index];
  return (
    <div
      className={cn(
        "relative flex size-14 items-center justify-center rounded-xl border border-line bg-page text-2xl font-bold text-white transition-colors",
        slot?.isActive && "border-appPrimary",
      )}
    >
      {slot?.char}
      {slot?.hasFakeCaret && <div className="h-6 w-px animate-pulse bg-appPrimary" />}
    </div>
  );
}

export { InputOTP, InputOTPSlot };

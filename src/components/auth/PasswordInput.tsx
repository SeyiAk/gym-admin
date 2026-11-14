import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function PasswordInput(props: React.ComponentProps<"input">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-white"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

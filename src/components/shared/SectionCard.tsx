import { cn } from "@/lib/utils";

type Props = {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function SectionCard({ title, icon, action, children, className, bodyClassName }: Props) {
  return (
    <section className={cn("card flex min-w-0 flex-col gap-4 p-6", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[1.3125rem] font-bold text-white">
            {icon}
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}

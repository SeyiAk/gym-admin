import { CHART } from "@/components/shared/chartTheme";
import type { Reports } from "@/hooks/reports/useReports";

const COLORS = [CHART.brand, CHART.info, CHART.warning, CHART.violet, "#34D399", "#EF5350"];

export function MembersByPlan({ data }: { data: Reports["membersByPlan"] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <ul className="flex flex-col gap-5">
      {data.map((d, i) => {
        // Use the API's percentage when given; otherwise derive it from the counts.
        const pct =
          typeof d.percentage === "number" ? d.percentage : total ? (d.count / total) * 100 : 0;
        const color = COLORS[i % COLORS.length];
        return (
          <li key={d.plan} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2 text-muted">
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {d.plan}
              </span>
              <span className="font-bold text-white">
                {d.count.toLocaleString()}{" "}
                <span className="font-normal text-subtle">({Math.round(pct)}%)</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import type { EChartsOption } from "echarts";
import { useMemo } from "react";
import { Chart } from "@/components/shared/Chart";
import { baseTooltip, CHART } from "@/components/shared/chartTheme";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/utils/helper";

type Props = { active: number; expiringSoon: number; inactive: number; loading?: boolean };

const SEGMENTS = [
  { key: "active", label: "Active", color: CHART.brand },
  { key: "expiringSoon", label: "Expiring Soon", color: CHART.warning },
  { key: "inactive", label: "Inactive", color: CHART.neutral },
] as const;

export function MembershipStatusDonut({ loading, ...counts }: Props) {
  // "Total Members" in the centre is the sum of the three buckets the API returns.
  const total = counts.active + counts.expiringSoon + counts.inactive;
  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: { ...baseTooltip, trigger: "item" as const },
      series: [
        {
          type: "pie" as const,
          radius: ["74%", "96%"],
          padAngle: total ? 2 : 0,
          itemStyle: { borderRadius: 4 },
          label: { show: false },
          emphasis: { scale: false },
          data: total
            ? SEGMENTS.map((s) => ({
                name: s.label,
                value: counts[s.key],
                itemStyle: { color: s.color },
              }))
            : [{ name: "No members", value: 1, itemStyle: { color: CHART.line } }],
        },
      ],
    }),
    [counts, total],
  );

  if (loading) return <Skeleton className="h-[11.25rem] w-full" />;

  return (
    <div className="flex flex-1 items-center gap-6">
      <div className="relative size-[11.25rem] shrink-0">
        <Chart option={option} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.75rem] font-bold text-white">{formatNumber(total)}</span>
          <span className="text-sm text-subtle">Total Members</span>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-4">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[1.0625rem] font-medium text-muted">{s.label}</span>
                <span className="text-lg font-bold text-white">{formatNumber(counts[s.key])}</span>
              </div>
            </div>
            <span className="text-lg font-semibold text-muted">
              {total ? Math.round((counts[s.key] / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

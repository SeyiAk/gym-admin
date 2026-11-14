import dayjs from "dayjs";
import type { EChartsOption } from "echarts";
import { useMemo } from "react";
import { Chart } from "@/components/shared/Chart";
import { baseTooltip, CHART } from "@/components/shared/chartTheme";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

type Point = { date: string; activeMemberships: number };

export function MembershipGrowthChart({ data, loading }: { data: Point[]; loading?: boolean }) {
  const option = useMemo<EChartsOption>(
    () => ({
      grid: { left: 48, right: 16, top: 12, bottom: 28 },
      tooltip: {
        ...baseTooltip,
        trigger: "axis" as const,
        formatter: (params) => {
          const p = (Array.isArray(params) ? params[0] : params) as {
            axisValue?: string;
            value?: unknown;
          };
          return `${dayjs(p.axisValue).format("MMM D, YYYY")}<br/><b>${Number(p.value).toLocaleString()}</b> active memberships`;
        },
      },
      xAxis: {
        type: "category" as const,
        data: data.map((d) => d.date),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: CHART.muted,
          fontSize: 12,
          formatter: (v: string) => dayjs(v).format("MMM D"),
          hideOverlap: true,
        },
      },
      yAxis: {
        type: "value" as const,
        axisLabel: { color: CHART.label, fontSize: 12 },
        splitLine: { lineStyle: { color: CHART.line, type: "dashed" as const } },
        minInterval: 1,
        // Fit the axis to the data so small changes are visible, like the design.
        scale: true,
      },
      series: [
        {
          type: "line" as const,
          data: data.map((d) => d.activeMemberships),
          smooth: false,
          symbol: "circle",
          symbolSize: 7,
          showSymbol: data.length <= 31,
          lineStyle: { color: CHART.brand, width: 2 },
          itemStyle: { color: CHART.brand },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(172,246,153,0.40)" },
                { offset: 1, color: "rgba(172,246,153,0.02)" },
              ],
            },
          },
        },
      ],
    }),
    [data],
  );

  if (loading) return <Skeleton className="h-[13.75rem] w-full" />;
  if (!data.length)
    return (
      <EmptyState
        header="No growth data yet"
        subHeader="Active memberships will chart here once members join."
        className="h-[13.75rem] py-0"
      />
    );
  return <Chart option={option} className="h-[13.75rem]" />;
}

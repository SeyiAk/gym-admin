import dayjs from "dayjs";
import type { EChartsOption } from "echarts";
import { useMemo } from "react";
import { Chart } from "@/components/shared/Chart";
import { baseTooltip, CHART } from "@/components/shared/chartTheme";

export function CheckinsBarChart({ data }: { data: { date: string; count: number }[] }) {
  const option = useMemo<EChartsOption>(
    () => ({
      grid: { left: 0, right: 0, top: 8, bottom: 22 },
      tooltip: { ...baseTooltip, trigger: "axis" as const, axisPointer: { type: "none" as const } },
      xAxis: {
        type: "category" as const,
        data: data.map((d) => (dayjs(d.date).isValid() ? dayjs(d.date).format("MMM D") : d.date)),
        axisLine: { lineStyle: { color: CHART.line } },
        axisTick: { show: false },
        axisLabel: { color: CHART.muted, fontSize: 11, interval: 1 },
      },
      yAxis: { type: "value" as const, show: false, minInterval: 1 },
      series: [
        {
          type: "bar" as const,
          data: data.map((d) => d.count),
          barWidth: "45%",
          itemStyle: { color: CHART.brand, borderRadius: [3, 3, 0, 0] },
        },
      ],
    }),
    [data],
  );
  return <Chart option={option} className="h-[7.5rem]" />;
}

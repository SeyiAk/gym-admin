import type { DefaultLabelFormatterCallbackParams, EChartsOption } from "echarts";
import { useMemo } from "react";
import { Chart } from "./Chart";
import { baseTooltip, CHART } from "./chartTheme";

type Props = {
  data: { label: string; value: number }[];
  format?: (v: number) => string;
  className?: string;
  /** Index to highlight in brand green; defaults to the last bar (the current period, per the design). */
  highlight?: number;
};

/** Muted bars with the current period highlighted and values above each bar (Reports frames). */
export function BarSeriesChart({
  data,
  format = (v) => v.toLocaleString(),
  className = "h-[13rem]",
  highlight,
}: Props) {
  const hi = highlight ?? data.length - 1;
  const option = useMemo<EChartsOption>(
    () => ({
      grid: { left: 0, right: 0, top: 24, bottom: 22 },
      tooltip: {
        ...baseTooltip,
        trigger: "axis" as const,
        axisPointer: { type: "none" as const },
        valueFormatter: (v: unknown) => format(Number(v)),
      },
      xAxis: {
        type: "category" as const,
        data: data.map((d) => d.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART.label, fontSize: 12 },
      },
      yAxis: { type: "value" as const, show: false },
      series: [
        {
          type: "bar" as const,
          barCategoryGap: "10%",
          data: data.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: i === hi ? CHART.brand : CHART.brandMuted,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top" as const,
            color: CHART.brand,
            fontSize: 11,
            fontWeight: 700,
            formatter: (p: DefaultLabelFormatterCallbackParams) => format(Number(p.value)),
          },
        },
      ],
    }),
    [data, format, hi],
  );
  return <Chart option={option} className={className} />;
}

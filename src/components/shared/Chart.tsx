import { BarChart, LineChart, PieChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import ReactEChartsCore from "echarts-for-react/lib/core";
import type { EChartsOption } from "echarts";
import { CHART } from "./chartTheme";

// Tree-shaken registration: only the chart types the dashboard uses.
echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer]);

type Props = { option: EChartsOption; className?: string; style?: React.CSSProperties };

export function Chart({ option, className, style }: Props) {
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={{ textStyle: { fontFamily: CHART.font }, animationDuration: 500, ...option }}
      notMerge
      lazyUpdate
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
      opts={{ renderer: "canvas" }}
    />
  );
}

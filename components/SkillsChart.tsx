"use client";

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';

// Turbopack sometimes wraps commonjs exports, so unwrap .default if present
const initMore = typeof HC_more === 'function' ? HC_more : (HC_more as any).default;
if (typeof initMore === 'function') {
  initMore(Highcharts);
}

export interface SkillsChartHandle {
  reflow: () => void;
}

const SkillsChart = forwardRef<SkillsChartHandle, { options: Highcharts.Options }>(
  ({ options }, ref) => {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    useImperativeHandle(ref, () => ({
      reflow: () => {
        chartComponentRef.current?.chart?.reflow();
      }
    }));

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    );
  }
);

SkillsChart.displayName = 'SkillsChart';

export default SkillsChart;
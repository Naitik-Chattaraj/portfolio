"use client";

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

if (typeof window !== 'undefined') {
  // Dynamically require highcharts-more on the client side only to avoid server evaluation errors.
  const HC_more = require('highcharts/highcharts-more');
  const initMore = typeof HC_more === 'function' ? HC_more : (HC_more as any).default;
  if (typeof initMore === 'function') {
    initMore(Highcharts);
  }
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
"use client";

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

gsap.registerPlugin(ScrollTrigger);

const SkillsChart = dynamic(() => import('./SkillsChart'), { ssr: false });

const Skills = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartComponentRef = useRef<{ reflow: () => void }>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [showChart, setShowChart] = React.useState(false);
  const showChartRef = useRef(false);

  const segments = [
    { text: "The ", highlight: false },
    { text: "tools", highlight: true },
    { text: " behind the ideas", highlight: false }
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const activeChars = charRefs.current.filter(Boolean);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: pinRef.current,
          invalidateOnRefresh: true,
        },
        onUpdate: function () {
          const progress = this.progress();
          const shouldShow = progress > 0.55;
          if (shouldShow !== showChartRef.current) {
            showChartRef.current = shouldShow;
            setShowChart(shouldShow);
          }
        }
      });

      tl.fromTo(activeChars,
        { opacity: 0 },
        { opacity: 1, stagger: 0.05, duration: 2, ease: "none" }
      )
        .to(textRef.current, { opacity: 1, duration: 0.5 })
        .to(textRef.current, { opacity: 0, duration: 1 })
        .fromTo(chartRef.current,
          { opacity: 0, scale: 0.8, pointerEvents: 'none' },
          { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 1.5 },
          "-=0.5"
        );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Force Highcharts to re-measure its container once it's mounted and the
  // GSAP opacity/scale tween has had a moment to settle. Packed bubble layout
  // doesn't auto-reflow on CSS transform changes, only on a real resize event,
  // so we nudge it here and also on window resize.
  useLayoutEffect(() => {
    if (!showChart) return;
    const t = setTimeout(() => {
      chartComponentRef.current?.reflow();
    }, 100);

    const handleResize = () => chartComponentRef.current?.reflow();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [showChart]);

  const chartOptions = {
    chart: {
      type: 'packedbubble',
      height: '100%',
      backgroundColor: 'transparent',
    },
    title: {
      text: ''
    },
    tooltip: {
      useHTML: true,
      pointFormat: '<span style="color: {point.color}"></span><b>{point.name}</b>'
    },
    plotOptions: {
      packedbubble: {
        minSize: '15%',
        maxSize: '100%',
        layoutAlgorithm: {
          splitSeries: false,
          gravitationalConstant: 0.05
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          style: {
            color: 'white',
            textOutline: 'none',
            fontWeight: 'normal',
            fontSize: '14px'
          }
        }
      }
    },
    legend: {
      enabled: false
    },
    series: [
      {
        type: 'packedbubble',
        name: 'Frontend',
        color: '#d6d6b1',
        data: [
          { name: 'HTML', value: 95 },
          { name: 'CSS', value: 92 },
          { name: 'JavaScript', value: 94 },
          { name: 'TypeScript', value: 78 },
          { name: 'React', value: 90 },
          { name: 'React Native', value: 82 },
          { name: 'Next.js', value: 78 },
          { name: 'Tailwind CSS', value: 88 },
          { name: 'Three.js', value: 68 },
          { name: 'Vite', value: 85 }
        ]
      },
      {
        type: 'packedbubble',
        name: 'Programming Languages',
        color: '#aeb5c0ff',
        data: [
          { name: 'C', value: 72 },
          { name: 'C++', value: 65 },
          { name: 'Java', value: 58 },
          { name: 'Python', value: 78 },
          { name: 'Lua', value: 48 },
          { name: 'SQL', value: 72 }
        ]
      },
      {
        type: 'packedbubble',
        name: 'Backend',
        color: '#f59e0b',
        data: [
          { name: 'Node.js', value: 88 },
          { name: 'Express.js', value: 84 },
          { name: 'REST APIs', value: 86 }
        ]
      },
      {
        type: 'packedbubble',
        name: 'Databases / Backend Services',
        color: '#f97068',
        data: [
          { name: 'MongoDB', value: 76 },
          { name: 'PostgreSQL', value: 70 },
          { name: 'MySQL', value: 74 },
          { name: 'Supabase', value: 84 }
        ]
      },
      {
        type: 'packedbubble',
        name: 'Mobile / Build',
        color: '#8b5cf6',
        data: [
          { name: 'Expo', value: 78 },
          { name: 'EAS', value: 68 }
        ]
      },
      {
        type: 'packedbubble',
        name: 'DevOps / Tools',
        color: '#ec4899',
        data: [
          { name: 'Redis', value: 82 },
          { name: 'Git', value: 88 },
          { name: 'Docker', value: 58 },
          { name: 'Linux', value: 80 }
        ]
      },
      {
        type: 'packedbubble',
        name: 'Other Technical Skills',
        color: '#14b8a6',
        data: [
          { name: 'Tkinter', value: 65 },
          { name: 'OCPP', value: 62 },
          { name: 'Realtime Systems', value: 78 },
          { name: 'IoT / ESP32', value: 67 }
        ]
      }
    ]
  };

  let charIndex = 0;
  const renderText = () => {
    return segments.map((seg, sIdx) => (
      <span key={sIdx} className={seg.highlight ? "text-[#FF6B6B]" : "text-[#D6D6B1]"}>
        {seg.text.split('').map((char) => {
          const idx = charIndex++;
          return (
            <span
              key={idx}
              ref={(el) => {
                charRefs.current[idx] = el;
              }}
              className="opacity-0 inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <section
      id="skills"
      ref={containerRef}
      className="relative w-full bg-[var(--color-body-bg)]"
    >
      <div
        ref={pinRef}
        className="w-full h-dvh flex flex-col items-center justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="w-full relative z-10 flex justify-between items-center px-8 py-6 border-b border-[#D6D6B1]/20 text-2xl md:text-3xl font-mono tracking-widest pointer-events-none">
          <span className='text-[#D6D6B1]'>003</span>
          <span className='text-[#D6D6B1]'>MY SKILLS</span>
          <span className='text-[#D6D6B1]'>003</span>
        </div>

        {/* Content & Animation Area */}
        <div className="relative flex-1 w-full flex items-center justify-center">
          {/* Hero Text */}
          <h2
            ref={textRef}
            className="absolute text-5xl md:text-7xl font-semibold text-center tracking-tighter pointer-events-none z-10 px-4"
          >
            {renderText()}
          </h2>

          {/* Bubble Chart */}
          <div
            ref={chartRef}
            className="w-[50%] h-full opacity-0"
          >
            {showChart && (
              <SkillsChart ref={chartComponentRef} options={chartOptions as any} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
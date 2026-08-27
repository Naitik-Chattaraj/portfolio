'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Footprints, Snowflake, TreePine, Droplets, Sun, type LucideIcon } from 'lucide-react';

// ── AutoplayVideo ────────────────────────────────────────────────────────────
/**
 * Renders a muted looping video.
 * `playing` controls whether it plays or pauses — driven by an
 * IntersectionObserver so playback only starts when the section is visible.
 */
function AutoplayVideo({
  src,
  className,
  playing,
}: {
  src: string;
  className?: string;
  playing: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    if (playing) {
      el.play().catch(() => { });
    } else {
      el.pause();
    }
  }, [playing, src]);

  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      className={className}
    />
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
interface ProjectOption {
  id: number;
  slug: string;
  icon?: LucideIcon;
  iconSrc?: string;
  main: string;
  sub: string;
  bg?: string;
  bgVideo?: string;
  defaultBg: string;
}

const options: ProjectOption[] = [
  {
    id: 1,
    slug: 'tech-club-website',
    iconSrc: '/icons/tech-club.png',
    main: 'Tech Club DPSRPK',
    sub: 'The official website for the Tech Club of DPS Ruby Park, Kolkata',
    bgVideo: '/video/tech-club.mp4',
    defaultBg: '#e7f528ff'
  },
  {
    id: 2,
    slug: 'the-carcino-foundation-website',
    iconSrc: '/icons/carcino.png',
    main: 'The Carcino Foundation',
    sub: 'The official website for The Carcino Foundation (2025-26)',
    bgVideo: '/video/carcinowebsite.mp4',
    defaultBg: '#8f29caff'
  },
  {
    id: 3,
    slug: 'widense-technologies',
    iconSrc: '/icons/widense.png',
    main: 'Widense Technologies',
    sub: 'The official website for Widense Technologies',
    bgVideo: '/video/widense-tech.mp4',
    defaultBg: '#f31010ff'
  },
  {
    id: 4,
    slug: 'vantage',
    iconSrc: '/icons/vantage.png',
    main: 'The Vantage App',
    sub: 'An all in one app for tracking tasks and editing articles.',
    bgVideo: '/video/vantage.mp4',
    defaultBg: '#6b2eccff'
  },
  {
    id: 5,
    slug: 'LuminoLens',
    iconSrc: '/icons/lumino-lens.png',
    main: 'LuminoLens',
    sub: 'Award winning website for 2025 Hackathon in DPSRPK.',
    bgVideo: '/video/lumino-lens.mp4',
    defaultBg: '#1cffffff'
  }
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Projects() {
  const [activeId, setActiveId] = useState(1);
  // true once the projects section scrolls into view
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Observe the section entering / leaving the viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0.2 } // start when 20 % of the section is visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="projects"
      ref={sectionRef}
      className="relative w-full min-h-[calc(100vh-0.5rem)] md:min-h-[calc(100vh-0.5rem)] lg:min-h-[calc(100vh-1rem)] rounded-[38px] overflow-hidden flex flex-col bg-[var(--color-card-bg)] shadow-2xl mt-4 px-6 py-12 md:px-12 md:py-20"
    >
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-50 z-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]"></div>

      <div className="relative z-10 w-full flex flex-col items-center h-full flex-grow">
        <div className="flex w-full justify-between items-center text-2xl md:text-3xl font-mono mb-16 md:mb-24 uppercase tracking-widest text-[#232223]">
          <span>003</span>
          <span>My Projects</span>
          <span>003</span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-[4rem] font-medium tracking-tight text-center mb-12 md:mb-20 text-[#232223]">
          Some Ideas brought to life <span className="text-[var(--color-primary)]">through code.</span>
        </h2>

        {/* Accordion Container */}
        <div className="flex flex-row items-stretch overflow-hidden w-full max-w-[900px] h-[400px] mx-auto gap-4 md:gap-5 mt-auto mb-auto">
          {options.map((opt) => {
            const isActive = activeId === opt.id;
            const Icon = opt.icon;
            return (
              <Link
                key={opt.id}
                href={`/projects/${opt.slug}`}
                className={`group relative overflow-hidden cursor-pointer no-underline transition-all duration-500 ease-[cubic-bezier(0.05,0.61,0.41,0.95)] ${isActive ? 'rounded-[40px] flex-[10]' : 'rounded-[30px] flex-[1] min-w-[60px]'
                  }`}
                style={
                  opt.bgVideo
                    ? { backgroundColor: opt.defaultBg }
                    : {
                      backgroundImage: opt.bg,
                      backgroundSize: isActive ? 'auto 100%' : 'auto 120%',
                      backgroundPosition: 'center',
                      backgroundColor: 'rgba(0,0,0,0.8)',
                    }
                }
                onMouseEnter={() => setActiveId(opt.id)}
              >
                {/* Video background */}
                {opt.bgVideo && (
                  <AutoplayVideo
                    src={opt.bgVideo}
                    playing={sectionVisible}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isActive ? 'blur-0' : 'blur-sm brightness-50'
                      }`}
                  />
                )}

                {/* Sideways project name — only visible on inactive video cards */}
                {opt.bgVideo && !isActive && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <span
                      className="text-white font-bold text-sm tracking-widest uppercase whitespace-nowrap select-none"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        opacity: 0.9,
                      }}
                    >
                      {opt.main}
                    </span>
                  </div>
                )}

                {/* Shadow overlay */}
                <div
                  className={`absolute left-0 right-0 h-[120px] transition-all duration-500 ease-[cubic-bezier(0.05,0.61,0.41,0.95)] z-10 ${isActive
                    ? 'bottom-0 shadow-[inset_0_-120px_120px_-120px_black,inset_0_-120px_120px_-100px_black]'
                    : '-bottom-[40px] shadow-[inset_0_-120px_0px_-120px_black,inset_0_-120px_0px_-100px_black]'
                    }`}
                />

                {/* Label */}
                <div
                  className={`absolute flex h-[40px] transition-all duration-500 ease-[cubic-bezier(0.05,0.61,0.41,0.95)] z-20 ${isActive ? 'bottom-[20px] left-[20px]' : 'bottom-[10px] left-[10px]'
                    }`}
                >
                  {/* Icon bubble */}
                  <div
                    className="flex flex-row justify-center items-center min-w-[40px] max-w-[40px] h-[40px] rounded-full bg-black shadow-lg overflow-hidden"
                    style={{ color: opt.defaultBg }}
                  >
                    {opt.iconSrc ? (
                      <img
                        src={opt.iconSrc}
                        alt={opt.main}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    ) : Icon ? (
                      <Icon size={20} strokeWidth={2.5} />
                    ) : null}
                  </div>

                  <div className="flex flex-col justify-center ml-[10px] text-white whitespace-pre overflow-hidden">
                    <div
                      className={`relative transition-all duration-500 ease-[cubic-bezier(0.05,0.61,0.41,0.95)] ${isActive ? 'left-0 opacity-100' : 'left-[20px] opacity-0'
                        }`}
                    >
                      <div className="font-bold text-[1.2rem] leading-tight">{opt.main}</div>
                      <div className="transition-delay-[0.1s] text-sm leading-tight opacity-80">{opt.sub}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


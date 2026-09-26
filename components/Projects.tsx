'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { Footprints, Snowflake, TreePine, Droplets, Sun, type LucideIcon } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Observe the section entering / leaving the viewport for video autoplay
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Blur-in entrance animation for heading text when entering section
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const chars = textRefs.current.filter(Boolean);
      if (!chars.length) return;

      gsap.fromTo(
        chars,
        { opacity: 0, filter: "blur(12px)", y: 10 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.015,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          onComplete: () => {
            gsap.set(chars, { clearProps: "filter,y" });
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const segments = [
    { text: "Some Ideas brought to life ", highlight: false },
    { text: "through code.", highlight: true }
  ];

  const renderText = () => {
    let charIndex = 0;
    return segments.map((seg, sIdx) => {
      const words = seg.text.split(/(\s+)/);
      return (
        <span key={sIdx} className={seg.highlight ? "text-[var(--color-primary)]" : ""}>
          {words.map((word, wIdx) => {
            if (word.match(/^\s+$/)) {
              return <span key={wIdx}>{word}</span>;
            }
            return (
              <span key={wIdx} className="inline-block whitespace-pre">
                {word.split('').map((char) => {
                  const idx = charIndex++;
                  return (
                    <span
                      key={idx}
                      className="inline-block will-change-[filter,opacity,transform] opacity-0"
                      ref={(el) => {
                        textRefs.current[idx] = el;
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div
      id="projects"
      ref={sectionRef}
      className="relative w-full min-h-[calc(100vh-0.5rem)] md:min-h-[calc(100vh-0.5rem)] lg:min-h-[calc(100vh-1rem)] rounded-[38px] overflow-hidden flex flex-col bg-[var(--color-card-bg)] shadow-2xl mt-4 px-6 py-12 md:px-12 md:py-20 "
    >
      {/* Background Noise & Vignette Layers */}
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-50 z-0" />
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      <div className="relative z-10 w-full flex flex-col items-center h-full flex-grow">
        <div className="flex w-full justify-between items-center text-2xl md:text-3xl font-mono mb-16 md:mb-24 uppercase tracking-widest text-[#232223]">
          <span>002</span>
          <span>My Projects</span>
          <span>002</span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-[4rem] font-medium tracking-tight text-center mb-12 md:mb-20 text-[#232223]">
          {renderText()}
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


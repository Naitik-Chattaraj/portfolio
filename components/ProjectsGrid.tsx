'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { projects, type Project } from '@/lib/projects';

// ── Card ──────────────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const Icon = project.icon;

  const isWide = project.span === 'wide';

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleClick = () => {
    try {
      sessionStorage.setItem('return_to_projects_grid', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      onClick={handleClick}
      className={`project-card projects-grid-region cursor-none group relative overflow-hidden no-underline flex flex-col justify-between transition-all duration-500
        bg-[#2B2B25] border border-white/10 hover:border-white/25 hover:shadow-2xl hover:-translate-y-1
        ${isWide
          ? 'md:col-span-2 rounded-[32px] md:rounded-[38px] p-6 md:p-8 flex-col md:flex-row items-center gap-6 md:gap-8'
          : 'col-span-1 rounded-[28px] md:rounded-[34px] p-5 md:p-6 gap-5'
        }
      `}
      style={{
        borderRadius: isWide ? '36px' : '32px',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        cursor: 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Video Frame (nicely positioned with rounded corners) ── */}
      <div
        className={`relative overflow-hidden bg-black/60 shadow-xl flex-shrink-0 group-hover:shadow-2xl transition-all duration-500
          ${isWide
            ? 'w-full md:w-[60%] aspect-[16/10] rounded-[24px] md:rounded-[28px]'
            : 'w-full aspect-[16/10] rounded-[22px] md:rounded-[24px]'
          }
        `}
        style={{
          borderRadius: isWide ? '26px' : '22px',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        }}
      >
        {project.bgVideo && (
          <video
            ref={videoRef}
            src={project.bgVideo}
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={(e) => {
              // Ensure initial frame is painted while video remains paused
              if (e.currentTarget.currentTime === 0) {
                e.currentTarget.currentTime = 0.05;
              }
            }}
            className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105
              ${isWide ? 'rounded-[24px] md:rounded-[28px]' : 'rounded-[22px] md:rounded-[24px]'}
            `}
            style={{ borderRadius: isWide ? '26px' : '22px' }}
          />
        )}

        {/* Fallback image */}
        {!project.bgVideo && project.bg && (
          <div
            className="w-full h-full bg-cover bg-top transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              backgroundImage: project.bg,
              borderRadius: isWide ? '26px' : '22px',
            }}
          />
        )}

        {/* Play indicator badge when paused */}
        {project.bgVideo && (
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
              hovered ? 'opacity-0 scale-90' : 'opacity-85 scale-100'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg text-white/90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Subtle inner highlight border on video */}
        <div
          className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10"
          style={{ borderRadius: isWide ? '26px' : '22px' }}
        />

        {/* Hover arrow indicator on video */}
        <div
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 ${
            hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div
        className={`flex flex-col justify-between w-full
          ${isWide ? 'md:w-[40%] gap-4 md:py-2' : 'gap-3'}
        `}
      >
        {isWide && (
          <span className="px-3.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-mono uppercase tracking-widest w-fit border border-white/10">
            Featured Project
          </span>
        )}

        <div className="flex items-start gap-4">
          {/* Icon bubble */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2.5 transition-transform duration-300 group-hover:scale-105"
            style={{ color: project.defaultBg }}
          >
            {project.iconSrc ? (
              <img
                src={project.iconSrc}
                alt={project.main}
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
            ) : Icon ? (
              <Icon size={24} strokeWidth={2.5} />
            ) : null}
          </div>

          {/* Title & Sub */}
          <div className="flex flex-col gap-1 flex-1">
            <h2 className="text-white font-bold text-xl md:text-2xl leading-tight group-hover:text-[#D6D6B1] transition-colors">
              {project.main}
            </h2>
            <p className="text-white/70 text-sm leading-snug line-clamp-2">
              {project.sub}
            </p>
          </div>
        </div>

        {isWide && (
          <div className="inline-flex items-center gap-2 text-white/90 font-medium text-sm group-hover:text-[#D6D6B1] transition-colors mt-2">
            <span>Explore Case Study</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
export default function ProjectsGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-0 cursor-none projects-grid-region" style={{ cursor: 'none' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 cursor-none projects-grid-region" style={{ cursor: 'none' }}>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}

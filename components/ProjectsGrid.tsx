'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Snowflake, TreePine, Droplets, Sun, type LucideIcon } from 'lucide-react';

// ── Project data ──────────────────────────────────────────────────────────────
// Mirror of the data in app/projects/[slug]/page.tsx.
// TODO: extract to lib/projects.ts and import from both files.
interface Project {
  slug: string;
  icon?: LucideIcon;
  iconSrc?: string;
  main: string;
  sub: string;
  bg?: string;
  bgVideo?: string;
  defaultBg: string;
  /** Controls grid span: 'wide' = 2 columns, 'normal' = 1 column */
  span?: 'wide' | 'normal';
}

const projects: Project[] = [
  {
    slug: 'tech-club-website',
    iconSrc: '/icons/tech-club.png',
    main: 'Tech Club Website',
    sub: 'The official website for the Tech Club of DPS Ruby Park, Kolkata',
    bgVideo: '/video/tech-club.mp4',
    defaultBg: '#ED5565',
    span: 'wide',
  },
  {
    slug: 'oretemauw',
    icon: Snowflake,
    main: 'Oretemauw',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/8b69cdde47aa952e4176b4200052abf4/tumblr_o51p7mFFF21qho82wo1_1280.jpg)',
    defaultBg: '#FC6E51',
  },
  {
    slug: 'iteresuselle',
    icon: TreePine,
    main: 'Iteresuselle',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/5af3f8303456e376ceda1517553ba786/tumblr_o4986gakjh1qho82wo1_1280.jpg)',
    defaultBg: '#FFCE54',
  },
  {
    slug: 'idiefe',
    icon: Droplets,
    main: 'Idiefe',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/5516a22e0cdacaa85311ec3f8fd1e9ef/tumblr_o45jwvdsL11qho82wo1_1280.jpg)',
    defaultBg: '#2ECC71',
  },
  {
    slug: 'inatethi',
    icon: Sun,
    main: 'Inatethi',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/f19901f50b79604839ca761cd6d74748/tumblr_o65rohhkQL1qho82wo1_1280.jpg)',
    defaultBg: '#5D9CEC',
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const Icon = project.icon;

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative overflow-hidden rounded-3xl no-underline flex flex-col justify-end
        ${project.span === 'wide' ? 'md:col-span-2' : 'col-span-1'}
      `}
      style={{
        minHeight: project.span === 'wide' ? '360px' : '300px',
        backgroundColor: project.defaultBg,
        ...(!project.bgVideo && project.bg
          ? {
              backgroundImage: project.bg,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video background (plays on hover) */}
      {project.bgVideo && (
        <video
          ref={videoRef}
          src={project.bgVideo}
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Image zoom effect overlay */}
      {!project.bgVideo && (
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            backgroundImage: project.bg,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />

      {/* Arrow indicator — appears on hover */}
      <div
        className={`absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
          hovered ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-2 -translate-y-2'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>

      {/* Card content */}
      <div className="relative z-10 p-6 flex items-end gap-4">
        {/* Icon bubble */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden"
          style={{ color: project.defaultBg }}
        >
          {project.iconSrc ? (
            <img
              src={project.iconSrc}
              alt={project.main}
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          ) : Icon ? (
            <Icon size={20} strokeWidth={2.5} />
          ) : null}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-0.5">
          <h2 className="text-white font-bold text-xl leading-tight">{project.main}</h2>
          <p className="text-white/60 text-sm leading-snug line-clamp-2">{project.sub}</p>
        </div>
      </div>
    </Link>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
export default function ProjectsGrid() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}

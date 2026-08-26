import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Snowflake, TreePine, Droplets, Sun, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import MarkdownContent from '@/components/MarkdownContent';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProjectOption {
  slug: string;
  icon?: LucideIcon;
  iconSrc?: string;
  main: string;
  sub: string;
  bg?: string;
  bgVideo?: string;
  defaultBg: string;
  /**
   * Filename of the markdown file inside `content/projects/`.
   * e.g. 'tech-club-website.md'
   * The file can use standard Markdown + GFM (tables, task lists, etc.)
   * Images: use root-relative paths that resolve to /public, e.g.
   *   ![Alt](/images/projects/my-project/screenshot.png)
   */
  descriptionMd?: string;
  /** Optional external URL for the live project */
  url?: string;
}

// ── Project data ──────────────────────────────────────────────────────────────
// To add / edit a project description:
//   1. Create or edit  content/projects/<slug>.md
//   2. Set  descriptionMd: '<slug>.md'  in the entry below
//   3. Drop any images in  public/images/projects/<slug>/
const projects: ProjectOption[] = [
  {
    slug: 'tech-club-website',
    iconSrc: '/icons/tech-club.png',
    main: 'Tech Club Website',
    sub: 'The official website for the Tech Club of DPS Ruby Park, Kolkata',
    bgVideo: '/video/tech-club.mp4',
    defaultBg: '#ED5565',
    descriptionMd: 'tech-club-website.md',
  },
  {
    slug: 'oretemauw',
    icon: Snowflake,
    main: 'Oretemauw',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/8b69cdde47aa952e4176b4200052abf4/tumblr_o51p7mFFF21qho82wo1_1280.jpg)',
    defaultBg: '#FC6E51',
    descriptionMd: 'oretemauw.md',
  },
  {
    slug: 'iteresuselle',
    icon: TreePine,
    main: 'Iteresuselle',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/5af3f8303456e376ceda1517553ba786/tumblr_o4986gakjh1qho82wo1_1280.jpg)',
    defaultBg: '#FFCE54',
    descriptionMd: 'iteresuselle.md',
  },
  {
    slug: 'idiefe',
    icon: Droplets,
    main: 'Idiefe',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/5516a22e0cdacaa85311ec3f8fd1e9ef/tumblr_o45jwvdsL11qho82wo1_1280.jpg)',
    defaultBg: '#2ECC71',
    descriptionMd: 'idiefe.md',
  },
  {
    slug: 'inatethi',
    icon: Sun,
    main: 'Inatethi',
    sub: 'Omuke trughte a otufta',
    bg: 'url(https://66.media.tumblr.com/f19901f50b79604839ca761cd6d74748/tumblr_o65rohhkQL1qho82wo1_1280.jpg)',
    defaultBg: '#5D9CEC',
    descriptionMd: 'inatethi.md',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function readMarkdown(filename: string): string | null {
  const filePath = join(process.cwd(), 'content', 'projects', filename);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8');
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.main} | Naitik Chattaraj`,
    description: project.sub,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const Icon = project.icon;
  const markdownContent = project.descriptionMd
    ? readMarkdown(project.descriptionMd)
    : null;

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-body-bg)' }}>
      {/* ── Hero ── */}
      <section
        className="relative w-full flex flex-col items-center justify-end overflow-hidden"
        style={{ minHeight: '70vh' }}
      >
        {/* Background: video or image */}
        {project.bgVideo ? (
          <video
            src={project.bgVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: project.bg }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <Link
          href="/#projects"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </Link>

        {/* Hero text */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-16 flex flex-col gap-4">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-lg mb-2 overflow-hidden"
            style={{ color: project.defaultBg }}
          >
            {project.iconSrc ? (
              <img src={project.iconSrc} alt={project.main} width={32} height={32} className="w-8 h-8 object-contain" />
            ) : Icon ? (
              <Icon size={28} strokeWidth={2} />
            ) : null}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            {project.main}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl">{project.sub}</p>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-80 w-fit"
              style={{ backgroundColor: project.defaultBg }}
            >
              Visit Live Site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </section>

      {/* ── Markdown Description ── */}
      {markdownContent && (
        <section className="w-full max-w-4xl mx-auto px-6 py-16">
          {/* Section label */}
          <p
            className="text-xs font-mono uppercase tracking-widest mb-8 opacity-60"
            style={{ color: project.defaultBg }}
          >
            About this project
          </p>
          <MarkdownContent markdown={markdownContent} />
        </section>
      )}
    </main>
  );
}


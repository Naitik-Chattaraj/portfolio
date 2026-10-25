import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import MarkdownContent from '@/components/MarkdownContent';
import ProjectBackButton from '@/components/ProjectBackButton';
import { projects } from '@/lib/projects';

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
  const project = projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
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
  const project = projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
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
        <ProjectBackButton />

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


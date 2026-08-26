import type { Metadata } from 'next';
import ProjectsGrid from '@/components/ProjectsGrid';

export const metadata: Metadata = {
  title: 'Projects | Naitik Chattaraj',
  description: 'A collection of projects built by Naitik Chattaraj — websites, apps, and ideas brought to life through code.',
};

export default function ProjectsPage() {
  return (
    <main
      className="min-h-screen flex flex-col pb-32"
      style={{ backgroundColor: 'var(--color-body-bg)' }}
    >
      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-20 pb-12 flex flex-col gap-4">
        <p className="text-xs font-mono uppercase tracking-widest text-white/40">003 — Portfolio</p>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
          My <span style={{ color: 'var(--color-primary)' }}>Projects</span>
        </h1>
        <p className="text-lg text-white/50 max-w-xl">
          Ideas brought to life through code — websites, tools, and experiments.
        </p>
      </header>

      {/* ── Grid ── */}
      <ProjectsGrid />
    </main>
  );
}

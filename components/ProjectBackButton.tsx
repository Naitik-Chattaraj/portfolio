'use client';

import { useRouter } from 'next/navigation';

export default function ProjectBackButton() {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/projects');
    }
  };

  return (
    <a
      href="/projects"
      onClick={handleBack}
      className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/85 hover:text-white hover:bg-black/65 text-sm font-medium transition-all duration-200 shadow-lg cursor-pointer"
      aria-label="Back to projects"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </a>
  );
}

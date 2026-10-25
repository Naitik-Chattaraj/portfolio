import type { Metadata } from 'next';
import ProjectsPageClient from '@/components/ProjectsPageClient';

export const metadata: Metadata = {
  title: 'Projects | Naitik Chattaraj',
  description:
    'A collection of projects built by Naitik Chattaraj — websites, apps, and ideas brought to life through code.',
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}

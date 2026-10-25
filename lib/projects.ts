import type { LucideIcon } from 'lucide-react';

export interface Project {
  id: number;
  slug: string;
  main: string;
  sub: string;
  icon?: LucideIcon;
  iconSrc?: string;
  bgVideo?: string;
  bg?: string;
  defaultBg: string;
  span?: 'wide' | 'normal';
  descriptionMd?: string;
  url?: string;
}

export const projects: Project[] = [
  {
    id: 1,
    slug: 'tech-club-website',
    iconSrc: '/icons/tech-club.png',
    main: 'Tech Club DPSRPK',
    sub: 'The official website for the Tech Club of DPS Ruby Park, Kolkata',
    bgVideo: '/video/tech-club.mp4',
    defaultBg: '#e7f528ff',
    span: 'wide',
    descriptionMd: 'tech-club-website.md',
    url: 'https://techclubdps.github.io',
  },
  {
    id: 2,
    slug: 'the-carcino-foundation-website',
    iconSrc: '/icons/carcino.png',
    main: 'The Carcino Foundation',
    sub: 'The official website for The Carcino Foundation (2025-26)',
    bgVideo: '/video/carcinowebsite.mp4',
    defaultBg: '#8f29caff',
    span: 'normal',
    descriptionMd: 'the-carcino-foundation-website.md',
  },
  {
    id: 3,
    slug: 'widense-technologies',
    iconSrc: '/icons/widense.png',
    main: 'Widense Technologies',
    sub: 'The official website for Widense Technologies',
    bgVideo: '/video/widense-tech.mp4',
    defaultBg: '#f31010ff',
    span: 'normal',
    descriptionMd: 'widense-technologies.md',
  },
  {
    id: 4,
    slug: 'vantage',
    iconSrc: '/icons/vantage.png',
    main: 'The Vantage App',
    sub: 'An all in one app for tracking tasks and editing articles.',
    bgVideo: '/video/vantage.mp4',
    defaultBg: '#6b2eccff',
    span: 'normal',
    descriptionMd: 'vantage.md',
  },
  {
    id: 5,
    slug: 'LuminoLens',
    iconSrc: '/icons/lumino-lens.png',
    main: 'LuminoLens',
    sub: 'Award winning website for 2025 Hackathon in DPSRPK.',
    bgVideo: '/video/lumino-lens.mp4',
    defaultBg: '#1cffffff',
    span: 'normal',
    descriptionMd: 'lumino-lens.md',
  },
];

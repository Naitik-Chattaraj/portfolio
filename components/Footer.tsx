'use client';

import { useRef, useLayoutEffect, useEffect, useState, ComponentType, SVGProps } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Home,
  FolderGit2,
  Mail,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface ActiveHoverState {
  type: string;
  icon: IconType;
  color: string;
}

// Custom Brand SVGs
const LinkedinIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const InstagramIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface HeartParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  wobble: number;
  wobbleSpeed: number;
  scale: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
  decay: number;
}

const HEART_COLORS = [
  '#FF2E63',
  '#FF477E',
  '#FF5C8A',
  '#FF70A6',
  '#FF99C8',
  '#E86C60',
  '#FF0055',
  '#FF3366',
  '#FF6699',
  '#F4EADF',
  '#FF1493',
  '#FF69B4',
  '#D81B60',
  '#EC407A',
];

const HEART_SVG_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLDivElement>(null);
  const nameLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nameLetterCoordsRef = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const [activeHover, setActiveHover] = useState<ActiveHoverState | null>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: -9999, y: -9999 });

  // Heart Confetti Canvas Refs & State
  const heartCanvasRef = useRef<HTMLCanvasElement>(null);
  const heartParticlesRef = useRef<HeartParticle[]>([]);
  const heartAnimRef = useRef<boolean>(false);
  const madeWithLoveRef = useRef<HTMLSpanElement>(null);
  const heartIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Resize heart canvas to match window viewport
  useEffect(() => {
    const handleResize = () => {
      const canvas = heartCanvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (heartIntervalRef.current) clearInterval(heartIntervalRef.current);
    };
  }, []);

  const animateHearts = () => {
    const canvas = heartCanvasRef.current;
    if (!canvas) {
      heartAnimRef.current = false;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      heartAnimRef.current = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = heartParticlesRef.current;

    let path2d: Path2D | null = null;
    if (typeof window !== 'undefined' && 'Path2D' in window) {
      path2d = new Path2D(HEART_SVG_PATH);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.wobble) * 2.5;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > window.innerHeight + 50) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (path2d) {
        ctx.translate(-12, -12);
        ctx.fill(path2d);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(animateHearts);
    } else {
      heartAnimRef.current = false;
    }
  };

  const spawnHeartShower = (count: number, originX: number, originY: number, spreadX: number) => {
    const newParticles: HeartParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.75);
      const speed = 9 + Math.random() * 17;
      newParticles.push({
        x: originX + (Math.random() - 0.5) * spreadX,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 6,
        vy: Math.sin(angle) * speed,
        gravity: 0.35 + Math.random() * 0.25,
        drag: 0.96 + Math.random() * 0.02,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.05 + Math.random() * 0.1,
        scale: 0.5 + Math.random() * 1.3,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        life: 1.0,
        decay: 0.006 + Math.random() * 0.01,
      });
    }
    heartParticlesRef.current.push(...newParticles);
    if (!heartAnimRef.current) {
      heartAnimRef.current = true;
      requestAnimationFrame(animateHearts);
    }
  };

  const handleMadeWithLoveMouseEnter = () => {
    if (!madeWithLoveRef.current) return;
    const rect = madeWithLoveRef.current.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Initial big burst of heart confetti
    spawnHeartShower(65, originX, originY, rect.width * 0.9);

    // Continuous heart shower while staying hovered
    if (heartIntervalRef.current) clearInterval(heartIntervalRef.current);
    heartIntervalRef.current = setInterval(() => {
      if (!madeWithLoveRef.current) return;
      const currentRect = madeWithLoveRef.current.getBoundingClientRect();
      spawnHeartShower(16, currentRect.left + currentRect.width / 2, currentRect.top + currentRect.height / 2, currentRect.width * 0.9);
    }, 180);
  };

  const handleMadeWithLoveMouseLeave = () => {
    if (heartIntervalRef.current) {
      clearInterval(heartIntervalRef.current);
      heartIntervalRef.current = null;
    }
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      const REVEAL_PERCENT = 25;

      tl.to(
        topPanelRef.current,
        {
          yPercent: -REVEAL_PERCENT,
          ease: 'power2.inOut',
        },
        0
      ).to(
        bottomPanelRef.current,
        {
          yPercent: REVEAL_PERCENT,
          ease: 'power2.inOut',
        },
        0
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Grid Canvas & Letter Hover Effect behind the footer shutter
  useEffect(() => {
    const CELL_SIZE = 64;
    const BASE_COLOR = { r: 0x40, g: 0x40, b: 0x38 };
    const HIGHLIGHT_COLOR = { r: 0xd6, g: 0xd6, b: 0xb1 };

    const buildGrid = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      const containerRect = container.getBoundingClientRect();
      nameLetterCoordsRef.current = nameLetterRefs.current.map((span) => {
        if (!span) return { x: 0, y: 0 };
        const rect = span.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
    };

    let rafId: number;
    let startTime = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / CELL_SIZE);
      const rows = Math.ceil(height / CELL_SIZE);
      const { x: mx, y: my } = mouseRef.current;

      const hoverRadius = 220;
      const pullStrength = 12;

      for (let i = 0; i < cols * rows; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = col * CELL_SIZE + CELL_SIZE / 2;
        const cy = row * CELL_SIZE + CELL_SIZE / 2;

        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        let mouseStrength = 0;
        let tx = 0;
        let ty = 0;

        if (dist < hoverRadius) {
          mouseStrength = 1 - dist / hoverRadius;
          const angle = Math.atan2(dy, dx);
          const pull = mouseStrength * pullStrength;
          tx = Math.cos(angle) * pull;
          ty = Math.sin(angle) * pull;
        }

        const strength = mouseStrength;

        if (strength > 0.01) {
          const scale = 0.88 + strength * 0.12;
          const opacity = strength * 0.6;

          ctx.save();
          ctx.translate(cx + tx, cy + ty);
          ctx.scale(scale, scale);

          const r = Math.round(BASE_COLOR.r + (HIGHLIGHT_COLOR.r - BASE_COLOR.r) * strength);
          const g = Math.round(BASE_COLOR.g + (HIGHLIGHT_COLOR.g - BASE_COLOR.g) * strength);
          const b = Math.round(BASE_COLOR.b + (HIGHLIGHT_COLOR.b - BASE_COLOR.b) * strength);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fillRect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
          ctx.restore();
        }
      }

      // Letter hover displacement logic
      const textHoverRadius = 150;
      const textPullStrength = -10;

      nameLetterRefs.current.forEach((span, i) => {
        if (!span) return;
        const coords = nameLetterCoordsRef.current[i];
        if (!coords) return;

        const dx = mx - coords.x;
        const dy = my - coords.y;
        const dist = Math.hypot(dx, dy);

        if (dist < textHoverRadius) {
          const strength = 1 - dist / textHoverRadius;
          const angle = Math.atan2(dy, dx);
          const tx = Math.cos(angle) * strength * textPullStrength;
          const ty = Math.sin(angle) * strength * textPullStrength;
          span.style.transform = `translate(${tx}px, ${ty}px)`;
          span.dataset.moved = 'true';
        } else if (span.dataset.moved === 'true') {
          span.style.transform = 'translate(0px, 0px)';
          span.dataset.moved = 'false';
        }
      });

      // Custom icon cursor smooth movement
      if (cursorFollowerRef.current && mouseRef.current.x > -1000) {
        if (cursorPos.current.x < -1000) {
          cursorPos.current = { x: mouseRef.current.x, y: mouseRef.current.y };
        } else {
          cursorPos.current.x += (mouseRef.current.x - cursorPos.current.x) * 0.3;
          cursorPos.current.y += (mouseRef.current.y - cursorPos.current.y) * 0.3;
        }
        cursorFollowerRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    const timer = setTimeout(buildGrid, 100);
    rafId = requestAnimationFrame(animate);

    const handleResize = () => buildGrid();
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      cursorPos.current = { x: -9999, y: -9999 };
      setActiveHover(null);
    };

    window.addEventListener('resize', handleResize);
    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleLinkMouseEnter = (hoverData: ActiveHoverState, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };
      cursorPos.current = { x: mx, y: my };
    }
    setActiveHover(hoverData);
  };

  const handleLinkMouseLeave = () => {
    cursorPos.current = { x: -9999, y: -9999 };
    setActiveHover(null);
  };

  const ActiveIcon = activeHover?.icon;

  return (
    <footer
      id="footer"
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden shadow-2xl mt-4 select-none"
    >
      {/* Dynamic icon cursor active when hovering links */}
      {activeHover && ActiveIcon && (
        <div
          ref={cursorFollowerRef}
          className="pointer-events-none absolute top-0 left-0 z-50 flex items-center justify-center w-20 h-20 rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-opacity duration-150 ease-out animate-in fade-in zoom-in-75"
          style={{
            backgroundColor: activeHover.color,
            transform: `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) translate(-50%, -50%)`,
          }}
        >
          <ActiveIcon className="w-10 h-10 text-white stroke-[2.2]" />
        </div>
      )}

      {/* Name layer — lives behind the footer at all times, centered in the gap between panels */}
      <div
        ref={nameTextRef}
        className="absolute inset-0 z-0 bg-[#3F3F37] flex items-center justify-center pt-[20vh] pointer-events-auto overflow-hidden cursor-none"
      >
        {/* Static grid line pattern */}
        <div
          className="absolute inset-0 z-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #D6D6B1 1px, transparent 1px),
              linear-gradient(to bottom, #D6D6B1 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem',
          }}
        />

        {/* Interactive grid cells canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

        <span className="relative z-10 text-[#E86C60] text-[15vw] font-bold tracking-tighter whitespace-nowrap leading-none px-4 inline-block">
          {'Naitik Chattaraj'.split('').map((char, idx) => (
            <span
              key={idx}
              className="inline-block transition-transform duration-75 will-change-transform"
              style={{ transition: 'transform 0.1s ease-out' }}
              ref={(el) => {
                nameLetterRefs.current[idx] = el;
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </div>

      {/* Top half of the footer plate */}
      <div
        ref={topPanelRef}
        className="absolute top-0 left-0 right-0 h-[62%] z-10 bg-[#E86C60] will-change-transform"
      >
        <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-60" />

        <div className="relative h-full w-full flex justify-between items-start p-6 sm:p-10 md:p-14 lg:p-20 overflow-hidden">
          {/* Sitemap */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-2 lg:mt-4">
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl lg:pt-10 xl:pt-16 pb-2 lg:pb-5 font-normal text-[#F4EADF] tracking-tight">
              Sitemap
            </h3>
            <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
              <a
                href="#hero"
                onMouseEnter={(e) =>
                  handleLinkMouseEnter({ type: 'home', icon: Home, color: '#3F3F37' }, e)
                }
                onMouseLeave={handleLinkMouseLeave}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity cursor-none"
              >
                Home
              </a>
              <a
                href="#projects"
                onMouseEnter={(e) =>
                  handleLinkMouseEnter({ type: 'projects', icon: FolderGit2, color: '#3F3F37' }, e)
                }
                onMouseLeave={handleLinkMouseLeave}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity cursor-none"
              >
                Projects
              </a>
              <a
                href="#contact"
                onMouseEnter={(e) =>
                  handleLinkMouseEnter({ type: 'contact', icon: Mail, color: '#3F3F37' }, e)
                }
                onMouseLeave={handleLinkMouseLeave}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity cursor-none"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-right mt-2 lg:mt-4">
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl lg:pt-10 xl:pt-16 pb-2 lg:pb-5 font-normal text-[#F4EADF] tracking-tight">
              Socials
            </h3>
            <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
              <a
                href="https://linkedin.com/in/naitik-chattaraj"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) =>
                  handleLinkMouseEnter({ type: 'linkedin', icon: LinkedinIcon, color: '#0077B5' }, e)
                }
                onMouseLeave={handleLinkMouseLeave}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity cursor-none"
              >
                Linkedin
              </a>
              <a
                href="https://github.com/Naitik-Chattaraj"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) =>
                  handleLinkMouseEnter({ type: 'github', icon: GithubIcon, color: '#24292E' }, e)
                }
                onMouseLeave={handleLinkMouseLeave}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity cursor-none"
              >
                Github
              </a>
              <a
                href="https://www.instagram.com/naitikchattaraj/"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) =>
                  handleLinkMouseEnter({ type: 'instagram', icon: InstagramIcon, color: '#E1306C' }, e)
                }
                onMouseLeave={handleLinkMouseLeave}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity cursor-none"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom half of the footer plate */}
      <div
        ref={bottomPanelRef}
        className="absolute bottom-0 left-0 right-0 h-[38%] z-10 bg-[#E86C60] will-change-transform"
      >
        <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-60" />

        <div className="relative h-full w-full flex justify-between items-end p-8 md:p-14 lg:p-20">
          {/* Made with ♡ */}
          <span
            ref={madeWithLoveRef}
            onMouseEnter={handleMadeWithLoveMouseEnter}
            onMouseLeave={handleMadeWithLoveMouseLeave}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[6vw] text-[#F4EADF] font-normal tracking-tight filter blur-[1.2px] select-none opacity-90 leading-none mb-2 md:mb-4 cursor-pointer inline-block"
          >
            Made with ♡
          </span>

          {/* ©'26 */}
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] text-[#252523] font-bold tracking-tight filter blur-[1.2px] select-none opacity-90 leading-none mb-2 md:mb-4">
            ©&apos;26
          </span>
        </div>
      </div>

      {/* Heart Confetti Overlay Canvas */}
      <canvas ref={heartCanvasRef} className="pointer-events-none fixed inset-0 z-[99999]" />
    </footer>
  );
}
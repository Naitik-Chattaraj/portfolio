'use client';

import { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectsGrid from '@/components/ProjectsGrid';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

// ── Canvas grid constants ─────────────────────────────────────────────────────
// Larger cell size to match the portfolio grid (64px = 4rem)
const CELL_SIZE = 64; // 4rem — matches portfolio grid
const BASE_COLOR = { r: 0x40, g: 0x40, b: 0x38 };
const HIGHLIGHT_COLOR = { r: 0xd6, g: 0xd6, b: 0xb1 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ── Main exported component ───────────────────────────────────────────────────
export default function ProjectsPageClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);         // Invisible placeholder for measurement
  const overlayCardRef = useRef<HTMLDivElement>(null);  // Fixed overlay that animates
  const labelRef = useRef<HTMLDivElement>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const gridContentRef = useRef<HTMLDivElement>(null);
  const endLabelRef = useRef<HTMLDivElement>(null);

  // ── Build canvas ─────────────────────────────────────────────────────────
  const buildCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = window.innerWidth;
    const height = Math.max(document.documentElement.scrollHeight, window.innerHeight * 5);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // ── Animation loop — mouse hover only, NO wave animation ─────────────────
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const cols = Math.ceil(width / CELL_SIZE);
    const rows = Math.ceil(height / CELL_SIZE);

    // Offset mouse by scroll so canvas cells track correctly
    const scrollY = window.scrollY;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y + scrollY;

    const hoverRadius = 240;
    const pullStrength = 10;

    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = col * CELL_SIZE + CELL_SIZE / 2;
      const cy = row * CELL_SIZE + CELL_SIZE / 2;

      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < hoverRadius) {
        const mouseStrength = 1 - dist / hoverRadius;
        const angle = Math.atan2(dy, dx);
        const pull = mouseStrength * pullStrength;
        const tx = Math.cos(angle) * pull;
        const ty = Math.sin(angle) * pull;

        const scale = 0.88 + mouseStrength * 0.12;
        const opacity = mouseStrength * 0.55;

        ctx.save();
        ctx.translate(cx + tx, cy + ty);
        ctx.scale(scale, scale);
        const r = Math.round(lerp(BASE_COLOR.r, HIGHLIGHT_COLOR.r, mouseStrength));
        const g = Math.round(lerp(BASE_COLOR.g, HIGHLIGHT_COLOR.g, mouseStrength));
        const b = Math.round(lerp(BASE_COLOR.b, HIGHLIGHT_COLOR.b, mouseStrength));
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fillRect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
        ctx.restore();
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => buildCanvas(), 100);
    rafRef.current = requestAnimationFrame(animate);
    const handleResize = () => buildCanvas();
    const handleMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [buildCanvas, animate]);

  // ── GSAP scroll animation ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    const card = cardRef.current;
    const label = labelRef.current;
    const grid = gridWrapRef.current;
    const gridContent = gridContentRef.current;
    const endLabel = endLabelRef.current;
    const hero = heroRef.current;
    const overlay = overlayCardRef.current;
    if (!card || !label || !grid || !gridContent || !endLabel || !hero || !overlay) return;

    // Measure card's position relative to heroRef
    const heroRect = hero.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const initialLeft = cardRect.left - heroRect.left;
    const initialTop = cardRect.top - heroRect.top;
    const initialWidth = cardRect.width;
    const initialHeight = cardRect.height;
    const vw = hero.offsetWidth || window.innerWidth;
    const vh = window.innerHeight;

    // Calculate dynamic scroll distance so all projects are fully scrolled through
    const contentHeight = gridContent.offsetHeight || 1500;
    const maxScroll = Math.max(0, contentHeight - vh + 160);

    // Position overlay inside heroRef to exactly match the placeholder card
    gsap.set(overlay, {
      position: 'absolute',
      left: initialLeft,
      top: initialTop,
      width: initialWidth,
      height: initialHeight,
      borderRadius: '44px',
      opacity: 1,
    });

    // Hide placeholder (overlay takes its place visually)
    gsap.set(card, { opacity: 0 });
    gsap.set(grid, { opacity: 0, pointerEvents: 'none' });
    gsap.set(gridContent, { y: 0 });
    gsap.set(endLabel, { opacity: 0 });

    // Initial label position: vertically centered in card
    gsap.set(label, {
      top: '50%',
      yPercent: -50,
      scale: 1,
      y: 0,
      opacity: 1,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=3800',
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
      },
    });

    // Phase 1 (0 → 0.15): card expands to fullscreen, "PROJECTS" moves to the top of the stretched card
    tl.to(overlay, {
      left: 0,
      top: 0,
      width: vw,
      height: vh,
      borderRadius: '0px',
      ease: 'power2.inOut',
      duration: 0.15,
    }, 0)
    .to(label, {
      top: '2.5rem',
      yPercent: 0,
      scale: 0.65,
      transformOrigin: 'center top',
      ease: 'power2.inOut',
      duration: 0.15,
    }, 0);

    // Phase 2 (0.15): grid fades in with staggered card entrance animation
    tl.to(grid, { opacity: 1, pointerEvents: 'auto', ease: 'power1.out', duration: 0.05 }, 0.15)
      .fromTo(
        '.project-card',
        { opacity: 0, y: 45, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.05, ease: 'power2.out', duration: 0.10 },
        0.15
      )

    // Phase 2 scrolling (0.15 → 0.85): scroll smoothly through all projects!
    .to(gridContent, {
      y: -maxScroll,
      ease: 'none',
      duration: 0.70,
    }, 0.15)
    .to(label, {
      y: -maxScroll,
      ease: 'none',
      duration: 0.70,
    }, 0.15)

    // Phase 3 (0.85 → 1.0): shrink back, end state appears
    .to(grid, { opacity: 0, pointerEvents: 'none', ease: 'power1.in', duration: 0.05 }, 0.85)
    .to(label, { opacity: 0, ease: 'power1.in', duration: 0.06 }, 0.85)
    .to(overlay, {
      left: initialLeft,
      top: initialTop,
      width: initialWidth,
      height: initialHeight,
      borderRadius: '44px',
      ease: 'power2.inOut',
      duration: 0.15,
    }, 0.85)
    .to(endLabel, { opacity: 1, ease: 'power1.out', duration: 0.08 }, 0.90);

    const st = tl.scrollTrigger;

    // Force immediate sync of progress to current scroll position (critical for back navigation & reload)
    ScrollTrigger.refresh();
    if (st) {
      const scrollY = window.scrollY;
      const progress = Math.max(0, Math.min(1, (scrollY - st.start) / (st.end - st.start)));
      tl.progress(progress);

      // If restoring into Phase 2, ensure grid is visible and play fresh entrance animation
      if (progress >= 0.12 && progress < 0.88) {
        gsap.set(grid, { opacity: 1, pointerEvents: 'auto' });
        gsap.fromTo(
          '.project-card',
          { opacity: 0, y: 35, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }
        );
      }
    }

    // Check if returning from a project detail page
    try {
      const returning = sessionStorage.getItem('return_to_projects_grid');
      if (returning) {
        sessionStorage.removeItem('return_to_projects_grid');
        // If scroll is near top, smoothly scroll into Phase 2 (expanded grid)
        if (window.scrollY < 200) {
          setTimeout(() => {
            window.scrollTo({ top: 850, behavior: 'smooth' });
          }, 50);
        }
      }
    } catch {
      // ignore
    }

    // ResizeObserver on gridContent to keep maxScroll accurate as content/videos load
    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    ro.observe(gridContent);

    const timer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      if (st) st.kill(true);
      tl.kill();
    };
  }, []);

  return (
    <div
      className="relative min-h-screen cursor-none projects-grid-region"
      style={{ backgroundColor: 'var(--color-body-bg)', cursor: 'none' }}
    >
      <style>{`
        .cursor-none,
        .cursor-none *,
        .projects-grid-region,
        .projects-grid-region * {
          cursor: none !important;
        }
      `}</style>

      {/* ── Static grid (matches 4rem cell size) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none cursor-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D6D6B1 1px, transparent 1px),
            linear-gradient(to bottom, #D6D6B1 1px, transparent 1px)
          `,
          // 4rem = 64px matches CELL_SIZE — CSS grid and canvas stay in sync
          backgroundSize: '4rem 4rem',
          opacity: 0.22,
          cursor: 'none',
        }}
      />

      {/* ── Interactive canvas (mouse hover highlights only) ── */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-0 pointer-events-none cursor-none"
        style={{ cursor: 'none' }}
      />

      {/* ── Pinned hero section ── */}
      <div
        ref={heroRef}
        className="relative z-10 min-h-screen w-full cursor-none projects-grid-region"
        style={{ cursor: 'none' }}
      >
        {/*
          The hero layout: Projects card centered in the viewport (both vertically and horizontally).
        */}
        <div
          className="relative flex items-center justify-center min-h-screen w-full px-4 md:px-8 cursor-none projects-grid-region"
          style={{ cursor: 'none' }}
        >
          {/*
            Invisible placeholder card — only for getBoundingClientRect measurement.
            The animated overlay card visually replaces this.
          */}
          <div
            ref={cardRef}
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderRadius: '44px',
              width: 'min(84vw, 1150px)',
              height: 'min(76vh, 620px)',
              flexShrink: 0,
            }}
          />
        </div>

        {/*
          Animated card — positioned inside heroRef so it naturally unpins and scrolls away
          with heroRef when the user scrolls past the pinned animation into the Footer.
        */}
        <div
          ref={overlayCardRef}
          className="overflow-hidden shadow-2xl flex items-center justify-center z-20 cursor-none projects-grid-region"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            borderRadius: '0px',
            opacity: 0, // GSAP immediately repositions + makes visible
            cursor: 'none',
          }}
        >
          {/* Noise texture */}
          <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-40 z-0" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.12) 100%)',
            }}
          />

          {/* "PROJECTS" label — travels to top of stretched out card */}
          <div
            ref={labelRef}
            className="absolute inset-x-0 z-30 flex items-center justify-center pointer-events-none select-none cursor-none"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'none',
            }}
          >
            <span
              className="font-bold uppercase text-[#3F3F37] cursor-none"
              style={{
                fontSize: 'clamp(3.5rem, 8.5vw, 7.5rem)',
                letterSpacing: '0.12em',
                lineHeight: 1,
                cursor: 'none',
              }}
            >
              PROJECTS
            </span>
          </div>

          {/* Project grid — hidden initially, shown fullscreen */}
          {/* cursor-none: completely hides cursor in grid region and across all descendants */}
          <div
            ref={gridWrapRef}
            className="absolute inset-0 z-20 overflow-hidden cursor-none projects-grid-region"
            style={{ cursor: 'none' }}
          >
            <div
              ref={gridContentRef}
              className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-24 md:pb-32 cursor-none projects-grid-region"
              style={{ cursor: 'none' }}
            >
              <ProjectsGrid />
            </div>
          </div>

          {/* "and still working…" end state (matches Figma design) */}
          <div
            ref={endLabelRef}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none px-6 text-center"
          >
            <span
              className="font-bold text-[#3F3F37] tracking-tight whitespace-nowrap"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                lineHeight: 1,
              }}
            >
              and still working...
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

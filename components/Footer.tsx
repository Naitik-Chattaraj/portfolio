'use client';

import { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLDivElement>(null);
  const nameLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nameLetterCoordsRef = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

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
      const t = (timestamp - startTime) / 1000;

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

      rafId = requestAnimationFrame(animate);
    };

    const timer = setTimeout(buildGrid, 100);
    rafId = requestAnimationFrame(animate);

    const handleResize = () => buildGrid();
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
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

  return (
    <footer
      id="footer"
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden shadow-2xl mt-4 select-none"
    >
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

        <div className="relative h-full w-full flex justify-between items-start p-8 md:p-14 lg:p-20">
          {/* Sitemap */}
          <div className="flex flex-col gap-3 pt-20 md:gap-4 mt-2 md:mt-4">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#F4EADF] tracking-tight">
              Sitemap
            </h3>
            <div className="flex flex-col gap-1.5 md:gap-2">
              <a
                href="#hero"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity"
              >
                Home
              </a>
              <a
                href="#projects"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity"
              >
                Projects
              </a>
              <a
                href="#contact"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-3 md:gap-4 text-right mt-2 md:mt-4">
            <h3 className="text-4xl sm:text-5xl md:text-6xl pt-20 lg:text-7xl font-normal text-[#F4EADF] tracking-tight">
              Socials
            </h3>
            <div className="flex flex-col gap-1.5 md:gap-2">
              <a
                href="https://linkedin.com/in/naitik-chattaraj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity"
              >
                Linkedin
              </a>
              <a
                href="https://github.com/Naitik-Chattaraj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity"
              >
                Github
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#252523] hover:opacity-75 transition-opacity"
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
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[6vw] text-[#F4EADF] font-normal tracking-tight filter blur-[1.2px] select-none opacity-90 leading-none mb-2 md:mb-4">
            Made with ♡
          </span>

          {/* ©'26 */}
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] text-[#252523] font-bold tracking-tight filter blur-[1.2px] select-none opacity-90 leading-none mb-2 md:mb-4">
            ©&apos;26
          </span>
        </div>
      </div>
    </footer>
  );
}
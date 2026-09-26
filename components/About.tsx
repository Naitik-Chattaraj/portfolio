'use client';

import { useEffect, useRef, useCallback, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CELL_SIZE = 64; // px, matches 4rem grid
const BASE_COLOR = { r: 0x40, g: 0x40, b: 0x38 }; // dim resting color
const HIGHLIGHT_COLOR = { r: 0xd6, g: 0xd6, b: 0xb1 }; // #D6D6B1

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textCoordsRef = useRef<{ x: number; y: number }[]>([]);
  const right001Ref = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const [topPadPx, setTopPadPx] = useState<number>(128);

  // Trigger character blur animation as soon as user enters the About Me section
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const chars = textRefs.current.filter(Boolean);
      if (!chars.length) return;

      gsap.fromTo(
        chars,
        { opacity: 0, filter: "blur(12px)", y: 10 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.012,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          onComplete: () => {
            gsap.set(chars, { clearProps: "filter,y" });
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Build the grid and calculate initial text coordinates & grid-snapped top padding
  const buildGrid = useCallback(() => {
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

    // Grid-snapped vertical centering: calculate top empty rows so text is centered on the page
    const paragraph = paragraphRef.current;
    if (paragraph && height) {
      const totalRows = Math.floor(height / CELL_SIZE);
      const pHeight = paragraph.offsetHeight;
      const pRows = Math.ceil(pHeight / CELL_SIZE);
      const availableRows = Math.max(0, totalRows - 1 - pRows);
      const topEmptyRows = Math.max(1, Math.floor(availableRows / 2));
      setTopPadPx(topEmptyRows * CELL_SIZE);
    }
    
    // Update text coordinates for hover effects
    const containerRect = container.getBoundingClientRect();
    textCoordsRef.current = textRefs.current.map((span) => {
      if (!span) return { x: 0, y: 0 };
      const rect = span.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    });
  }, []);

  // Animation loop: mouse-driven pull/highlight + an ambient wave on the right edge
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const t = (timestamp - startTimeRef.current) / 1000; // seconds elapsed

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Clear canvas for the new frame
    ctx.clearRect(0, 0, width, height);

    const cols = Math.ceil(width / CELL_SIZE);
    const rows = Math.ceil(height / CELL_SIZE);
    const { x: mx, y: my } = mouseRef.current;

    const hoverRadius = 220;
    const pullStrength = 12;

    // Wave config: lives in the last few columns on the right
    const waveCols = 10; // how many columns from the right edge participate
    const waveStartCol = Math.max(0, cols - waveCols);
    const waveSpeed = 1.6; // vertical travel speed
    const waveWidth = 4.0; // rows of falloff around the wave peak

    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = col * CELL_SIZE + CELL_SIZE / 2;
      const cy = row * CELL_SIZE + CELL_SIZE / 2;

      // --- mouse influence ---
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

      // --- ambient wave influence (right edge only) ---
      let waveStrength = 0;
      if (col >= waveStartCol) {
        const colFactor = (col - waveStartCol + 1) / waveCols; // 0..1, stronger toward edge
        const wavePos = (Math.sin(t * waveSpeed + col * 0.5) * 0.5 + 0.5) * (rows - 1);
        const rowDist = Math.abs(row - wavePos);
        const falloff = Math.max(0, 1 - rowDist / waveWidth);
        waveStrength = falloff * colFactor;
      }

      const strength = Math.max(mouseStrength, waveStrength * 1.5);

      if (strength > 0.01) {
        const scale = 0.88 + strength * 0.12;
        const opacity = strength * 0.6;
        
        ctx.save();
        ctx.translate(cx + tx, cy + ty);
        ctx.scale(scale, scale);
        
        const r = Math.round(lerp(BASE_COLOR.r, HIGHLIGHT_COLOR.r, strength));
        const g = Math.round(lerp(BASE_COLOR.g, HIGHLIGHT_COLOR.g, strength));
        const b = Math.round(lerp(BASE_COLOR.b, HIGHLIGHT_COLOR.b, strength));
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fillRect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
        ctx.restore();
      }
    }

    // --- Dynamic color change for top-right 001 when wave hits it ---
    if (right001Ref.current && cols > 0) {
      const rightCol = cols - 1;
      const colFactor = 1.0;
      const wavePosRight = (Math.sin(t * waveSpeed + rightCol * 0.5) * 0.5 + 0.5) * (rows - 1);
      const rowDist = Math.abs(0 - wavePosRight); // row 0 is top row where header 001 lives
      const falloff = Math.max(0, 1 - rowDist / waveWidth);
      const rightWaveStrength = falloff * colFactor;

      // When wave peak reaches row 0, rightWaveStrength is high (~0.7 to 1.0)
      const factor = Math.min(1, Math.max(0, (rightWaveStrength - 0.1) / 0.65));
      const r = Math.round(lerp(0xd6, 0, factor));
      const g = Math.round(lerp(0xd6, 0, factor));
      const b = Math.round(lerp(0xb1, 0, factor));
      right001Ref.current.style.color = `rgb(${r}, ${g}, ${b})`;
    }

    // --- Text Letters Animation ---
    const textHoverRadius = 150;
    const textPullStrength = -10; // negative pushes away, positive pulls in

    textRefs.current.forEach((span, i) => {
      if (!span) return;
      const coords = textCoordsRef.current[i];
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
        span.dataset.moved = "true";
      } else if (span.dataset.moved === "true") {
        // Only reset style if it was previously moved to save DOM operations
        span.style.transform = 'translate(0px, 0px)';
        span.dataset.moved = "false";
      }
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // A small delay to let custom fonts load before calculating coords
    const timer = setTimeout(() => {
      buildGrid();
    }, 100);
    
    rafRef.current = requestAnimationFrame(animate);

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [buildGrid, animate]);

  const renderText = () => {
    const segments = [
      { text: "I enjoy turning ", highlight: false },
      { text: "ambitious ideas", highlight: true },
      { text: " into ", highlight: false },
      { text: "intuitive, interactive products", highlight: true },
      { text: " where every animation has a purpose, every detail tells a story, and every line of code contributes to something people genuinely enjoy using.", highlight: false }
    ];

    let charIndex = 0;
    return segments.map((seg, sIdx) => {
      const words = seg.text.split(/(\s+)/);
      return (
        <span key={sIdx} className={seg.highlight ? "text-[var(--color-primary)]" : ""}>
          {words.map((word, wIdx) => {
            if (word.match(/^\s+$/)) {
              return <span key={wIdx}>{word}</span>;
            }
            return (
              <span key={wIdx} className="inline-block whitespace-pre">
                {word.split('').map((char) => {
                  const idx = charIndex++;
                  return (
                    <span
                      key={idx}
                      className="inline-block transition-transform duration-75 will-change-transform opacity-0"
                      style={{ transition: 'transform 0.1s ease-out, color 0.3s ease' }}
                      ref={(el) => {
                        textRefs.current[idx] = el;
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col mt-4 bg-[var(--color-body-bg)] text-[#D6D6B1] overflow-hidden cursor-none"
    >
      {/* Static grid line pattern */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D6D6B1 1px, transparent 1px),
            linear-gradient(to bottom, #D6D6B1 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* Interactive cells: mouse pull/highlight + ambient right-edge wave via Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Header: h-16 (64px / 4rem = exactly 1 grid row), border-b removed */}
      <div className="relative z-10 flex justify-between items-center px-8 md:px-16 h-16 text-2xl md:text-3xl font-mono tracking-widest pointer-events-none">
        <span>001</span>
        <span>ABOUT ME</span>
        <span ref={right001Ref} className="transition-colors duration-100">001</span>
      </div>

      {/* Content: original font size (text-3xl md:text-5xl lg:text-6xl) with grid-snapped vertical centering, left aligned, and sitting on horizontal grid lines */}
      <div
        className="relative z-10 flex-1 flex items-start px-8 md:px-16 lg:px-16 pb-24 pointer-events-none"
        style={{ paddingTop: `${topPadPx}px` }}
      >
        <p
          ref={paragraphRef}
          className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[4rem] max-w-5xl translate-y-[14px] pointer-events-auto"
        >
          {renderText()}
        </p>
      </div>
    </section>
  );
}
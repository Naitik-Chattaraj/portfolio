'use client';

import { useEffect, useRef, useCallback } from 'react';

const CELL_SIZE = 64; // px, matches 4rem grid
const BASE_COLOR = { r: 0x40, g: 0x40, b: 0x38 }; // dim resting color
const HIGHLIGHT_COLOR = { r: 0xd6, g: 0xd6, b: 0xb1 }; // #D6D6B1

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixColor(t: number) {
  const r = Math.round(lerp(BASE_COLOR.r, HIGHLIGHT_COLOR.r, t));
  const g = Math.round(lerp(BASE_COLOR.g, HIGHLIGHT_COLOR.g, t));
  const b = Math.round(lerp(BASE_COLOR.b, HIGHLIGHT_COLOR.b, t));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textCoordsRef = useRef<{ x: number; y: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  // Build the grid cells to match container size
  const buildGrid = useCallback(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    const cols = Math.ceil(container.offsetWidth / CELL_SIZE);
    const rows = Math.ceil(container.offsetHeight / CELL_SIZE);

    grid.innerHTML = '';
    cellsRef.current = [];
    grid.style.gridTemplateColumns = `repeat(${cols}, ${CELL_SIZE}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${CELL_SIZE}px)`;

    for (let i = 0; i < cols * rows; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.width = `${CELL_SIZE}px`;
      cell.style.height = `${CELL_SIZE}px`;
      cell.style.opacity = '0';
      cell.style.background = mixColor(0);
      cell.style.willChange = 'transform, opacity, background-color';
      cell.style.transition =
        'opacity 0.3s ease, transform 0.25s ease, background-color 0.3s ease';
      grid.appendChild(cell);
      cellsRef.current.push(cell);
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

    const cols = Math.ceil((containerRef.current?.offsetWidth ?? 0) / CELL_SIZE);
    const rows = Math.ceil((containerRef.current?.offsetHeight ?? 0) / CELL_SIZE);
    const { x: mx, y: my } = mouseRef.current;

    const hoverRadius = 220;
    const pullStrength = 12;

    // Wave config: lives in the last few columns on the right
    const waveCols = 10; // how many columns from the right edge participate
    const waveStartCol = Math.max(0, cols - waveCols);
    const waveSpeed = 1.6; // vertical travel speed
    const waveFrequency = 0.9; // how tight the sine ripples are
    const waveWidth = 4.0; // rows of falloff around the wave peak

    cellsRef.current.forEach((cell, i) => {
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
        cell.style.transform = `translate(${tx}px, ${ty}px) scale(${0.88 + strength * 0.12})`;
        cell.style.opacity = `${strength * 0.6}`;
        cell.style.background = mixColor(strength);
      } else {
        cell.style.transform = 'translate(0px, 0px) scale(0.85)';
        cell.style.opacity = '0';
        cell.style.background = mixColor(0);
      }
    });

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
      } else {
        span.style.transform = 'translate(0px, 0px)';
      }
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // A small delay to let custom fonts load before calculating coords
    setTimeout(() => {
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
                {word.split('').map((char, cIdx) => {
                  const idx = charIndex++;
                  return (
                    <span
                      key={idx}
                      className="inline-block transition-transform duration-75 will-change-transform"
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

      {/* Interactive cells: mouse pull/highlight + ambient right-edge wave */}
      <div ref={gridRef} className="absolute inset-0 z-0 grid pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-[#D6D6B1]/20 text-2xl md:text-3xl font-mono tracking-widest pointer-events-none">
        <span>001</span>
        <span>ABOUT ME</span>
        <span>001</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center px-8 md:px-16 lg:px-24 py-24 pointer-events-none">
        <p className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight max-w-5xl pointer-events-auto">
          {renderText()}
        </p>
      </div>
    </section>
  );
}
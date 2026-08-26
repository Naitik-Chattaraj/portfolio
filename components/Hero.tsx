'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextReveal, { type TextRevealHandle } from './TextReveal';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const textRevealWrapperRef = useRef<HTMLDivElement>(null);
  const textRevealHandleRef = useRef<TextRevealHandle>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!textRevealHandleRef.current) return;
      const { chars, words, primaryColor, secondaryColor } =
        textRevealHandleRef.current.getAnimatable();

      gsap.set(textRevealWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
      gsap.set(words, { color: secondaryColor });

      let activeWord: HTMLElement | null = null;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=4000', // total scroll distance for the whole sequence — tune this
          scrub: 1,
          pin: true,
          pinSpacing: true,
          // markers: true,
          onUpdate: (self) => {
            // Only run word-highlight logic during the "reveal" phase window (0.25–0.85 of progress)
            const p = gsap.utils.mapRange(0.3, 0.85, 0, 1, self.progress);
            if (p < 0 || p > 1) return;

            const idx = Math.floor(p * words.length);
            const current = words[Math.min(idx, words.length - 1)];

            if (current !== activeWord) {
              const prev = activeWord;
              activeWord = current;

              if (prev) {
                gsap.to(prev, { color: secondaryColor, duration: 0.3, ease: 'power1.out', overwrite: true });
              }
              gsap.to(current, { color: primaryColor, duration: 0.3, ease: 'power1.out', overwrite: true });
            }
          },
        },
      });

      // Phase 1 (0 → 0.25): crossfade photo/name out, text wrapper in
      tl.to(heroContentRef.current, { opacity: 0, scale: 0.96, ease: 'none' }, 0)
        .to(
          textRevealWrapperRef.current,
          { opacity: 1, pointerEvents: 'auto', ease: 'none' },
          0.1
        )
        // small delay / breathing room before words start revealing (0.25 → 0.3 = dead space)
        .to({}, { duration: 0.05 }, 0.25)
        // Phase 2 (0.3 → 0.85): char-by-char reveal, synced with word-highlight in onUpdate above
        .fromTo(
          chars,
          { opacity: 0.2 },
          { opacity: 1, stagger: 0.03 / (chars.length / 50), ease: 'none' },
          0.3
        )
        // Phase 3 (0.85 → 1): hold — nothing animates, revealed text just stays put
        .to({}, { duration: 0.15 }, 0.85);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-[calc(100vh-0.5rem)] md:min-h-[calc(100vh-0.5rem)] lg:min-h-[calc(100vh-1rem)] rounded-[38px] overflow-hidden flex flex-col bg-[var(--color-card-bg)] shadow-2xl"
    >
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-50 z-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]"></div>

      <div
        ref={heroContentRef}
        className="flex flex-col items-center justify-between min-h-[85vh] relative z-10 w-full pt-16"
      >
        <div className="flex flex-col items-center text-center px-4 w-full">
          <h1 className="text-primary font-bold tracking-tight text-6xl md:text-[9rem] lg:text-[10rem] leading-none whitespace-nowrap text-ellipsis max-w-full">
            Naitik Chattaraj
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-regular tracking-[-7%]">
            Designer · Developer · Storyteller
          </p>
        </div>

        <div className="relative w-full max-w-2xl mt-auto mx-auto flex justify-center">
          <Image
            src="/naitik.png"
            alt="Naitik Chattaraj"
            width={1000}
            height={1000}
            className="object-cover w-full h-auto"
            priority
          />
        </div>
      </div>

      <div
        ref={textRevealWrapperRef}
        className="absolute inset-0 z-20 flex items-center justify-center w-full"
      >
        <TextReveal ref={textRevealHandleRef} />
      </div>
    </div>
  );
}
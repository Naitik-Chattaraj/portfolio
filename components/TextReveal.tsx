'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const text = "I believe the best digital experiences aren't built by accident. They're crafted through curiosity, thoughtful design, and thousands of small decisions that most people never notice.";

export default function TextReveal() {
  const container = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLSpanElement>(null);
  const secondaryRef = useRef<HTMLSpanElement>(null);
  const activeWordRef = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const words = gsap.utils.toArray<HTMLElement>('.word', container.current);
    const chars = gsap.utils.toArray<HTMLElement>('.char', container.current);

    const primaryColor = getComputedStyle(primaryRef.current!).color;
    const secondaryColor = getComputedStyle(secondaryRef.current!).color;

    gsap.set(words, { color: secondaryColor });

    gsap.fromTo(
      chars,
      { opacity: 0.2 },
      {
        opacity: 1,
        stagger: 0.03,
        ease: 'none',
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: '+=2500',
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            const idx = Math.floor(self.progress * words.length);
            const current = words[Math.min(idx, words.length - 1)];

            if (current !== activeWordRef.current) {
              const prevWord = activeWordRef.current;
              activeWordRef.current = current;

              if (prevWord) {
                gsap.to(prevWord, {
                  color: secondaryColor,
                  duration: 0.3,
                  ease: 'power1.out',
                  overwrite: true,
                });
              }

              gsap.to(current, {
                color: primaryColor,
                duration: 0.3,
                ease: 'power1.out',
                overwrite: true,
              });
            }
          },
          onLeaveBack: () => {
            if (activeWordRef.current) {
              gsap.to(activeWordRef.current, {
                color: secondaryColor,
                duration: 0.3,
                overwrite: true,
              });
              activeWordRef.current = null;
            }
          },
        },
      }
    );
  }, { scope: container });

  return (
    <div
      ref={container}
      className="w-full flex items-center justify-center py-24 md:py-32 lg:py-48 px-8 max-w-5xl mx-auto"
    >
      <span ref={primaryRef} className="text-primary hidden">.</span>
      <span ref={secondaryRef} className="text-secondary hidden">.</span>

      <p className="text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight leading-tight">
        {text.split(' ').map((word, i) => (
          <span key={i} className="word inline-block mr-[0.3em]">
            {word.split('').map((char, j) => (
              <span key={j} className="char inline-block opacity-20">
                {char}
              </span>
            ))}
          </span>
        ))}
      </p>
    </div>
  );
}
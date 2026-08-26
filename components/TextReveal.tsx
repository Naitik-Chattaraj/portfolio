'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';

const text =
  "I believe the best digital experiences aren't built by accident. They're crafted through curiosity, thoughtful design, and thousands of small decisions that most people never notice.";

export type TextRevealHandle = {
  getAnimatable: () => {
    chars: HTMLElement[];
    words: HTMLElement[];
    primaryColor: string;
    secondaryColor: string;
  };
};

const TextReveal = forwardRef<TextRevealHandle>((_, ref) => {
  const container = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLSpanElement>(null);
  const secondaryRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    getAnimatable: () => {
      const chars = Array.from(
        container.current?.querySelectorAll<HTMLElement>('.char') ?? []
      );
      const words = Array.from(
        container.current?.querySelectorAll<HTMLElement>('.word') ?? []
      );
      const primaryColor = getComputedStyle(primaryRef.current!).color;
      const secondaryColor = getComputedStyle(secondaryRef.current!).color;
      return { chars, words, primaryColor, secondaryColor };
    },
  }));

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
});

TextReveal.displayName = 'TextReveal';
export default TextReveal;
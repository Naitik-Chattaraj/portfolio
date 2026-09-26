'use client';

import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextReveal, { type TextRevealHandle } from './TextReveal';

gsap.registerPlugin(ScrollTrigger);

const CAROUSEL_ITEMS = [
  { src: '/laptop.png', alt: 'Laptop' },
  { src: '/guitar.png', alt: 'Guitar' },
  { src: '/book.png', alt: 'Book' },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const textRevealWrapperRef = useRef<HTMLDivElement>(null);
  const textRevealHandleRef = useRef<TextRevealHandle>(null);
  const unpinTriggerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [animStage, setAnimStage] = useState<
    'loading' | 'bar_fade' | 'name_slide' | 'photo_reveal' | 'completed'
  >(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).__HAS_LOADED__ || sessionStorage.getItem('portfolio_loaded')) {
        return 'completed';
      }
    }
    return 'loading';
  });

  useEffect(() => {
    const isLoading = animStage !== 'completed';
    (window as any).__HERO_IS_LOADING = isLoading;
    window.dispatchEvent(new CustomEvent('hero-loading-state', { detail: { isLoading } }));
  }, [animStage]);

  useEffect(() => {
    if (animStage === 'completed') {
      (window as any).__HAS_LOADED__ = true;
      try { sessionStorage.setItem('portfolio_loaded', 'true'); } catch (e) {}
      return;
    }

    // Disable body scroll while loading
    document.body.style.overflow = 'hidden';

    let windowLoaded = false;
    if (document.readyState === 'complete') {
      windowLoaded = true;
    } else {
      const handleLoad = () => {
        windowLoaded = true;
      };
      window.addEventListener('load', handleLoad);
    }

    const MIN_DURATION = 2600; // 2.6s total loading progress duration
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(
        Math.floor((elapsed / MIN_DURATION) * 100),
        windowLoaded ? 100 : 90
      );

      setProgress((prev) => {
        const next = Math.max(prev, calculatedProgress);
        if (next >= 100 && windowLoaded) {
          clearInterval(interval);

          // Step 1: Carousel ends at book (100%). Pause briefly then fade out progress bar & carousel
          setTimeout(() => {
            setAnimStage('bar_fade');

            // Step 2: Name slides up & Designer-Developer-Storyteller text comes down
            setTimeout(() => {
              setAnimStage('name_slide');

              // Step 3: naitik.png is revealed at the bottom!
              setTimeout(() => {
                setAnimStage('photo_reveal');

                // Step 4: Loading sequence completed, unlock body scroll & sort/refresh ScrollTrigger
                setTimeout(() => {
                  setAnimStage('completed');
                  (window as any).__HAS_LOADED__ = true;
                  try { sessionStorage.setItem('portfolio_loaded', 'true'); } catch (e) {}
                  document.body.style.overflow = '';
                  ScrollTrigger.sort();
                  ScrollTrigger.refresh();
                }, 700);
              }, 900); // Wait for name to finish sliding up before photo reveal
            }, 450);
          }, 250);
        }
        return next;
      });
    }, 30);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, []);

  useLayoutEffect(() => {
    if (animStage !== 'completed') return;

    const ctx = gsap.context(() => {
      if (!textRevealHandleRef.current) return;
      const { chars, words, primaryColor, secondaryColor } =
        textRevealHandleRef.current.getAnimatable();

      gsap.set(textRevealWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
      gsap.set(words, { color: secondaryColor });


      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=4000', // total scroll distance for sequence
          scrub: 1,
          pin: true,
          pinSpacing: true,
          refreshPriority: 10,
          onUpdate: (self) => {
            // Text reveal starts at 0.1 (0.5s/5.0s) and ends at 0.82 (4.1s/5.0s)
            const p = gsap.utils.mapRange(0.1, 0.82, 0, 1, self.progress);
            if (p < 0 || p > 1) return;

            const exactIdx = p * chars.length;
            const lastWord = words[words.length - 1];

            chars.forEach((char, i) => {
              const dist = exactIdx - i;
              const isLastWord = lastWord && lastWord.contains(char);
              
              let opacity = 0;
              let finalColor = isLastWord ? primaryColor : '#000000'; // Final revealed color
              let color = finalColor;

              if (dist >= 0) {
                opacity = 1;
                if (dist <= 15) {
                  // Fading from red (dist 0) to finalColor (dist 15)
                  const ratio = dist / 15; // 0 is red, 1 is finalColor
                  color = gsap.utils.interpolate(primaryColor, finalColor, ratio);
                }
              } else if (dist >= -3) {
                // Fading in opacity just slightly ahead of the exact index
                opacity = 1 - Math.abs(dist / 3);
                color = primaryColor;
              }

              gsap.set(char, { color, opacity, overwrite: true });
            });
          },
        },
      });

      tl.to(heroContentRef.current, { opacity: 0, scale: 0.96, ease: 'none', duration: 0.5 }, 0)
        .to(
          containerRef.current,
          {
            borderRadius: '0px',
            scaleX: 1.05,
            scaleY: 1.02,
            ease: 'power1.inOut',
            duration: 0.5
          },
          0
        )
        .fromTo(
          textRevealWrapperRef.current,
          { scaleX: 1, scaleY: 1 },
          { 
            opacity: 1, 
            pointerEvents: 'auto', 
            scaleX: 1 / 1.05, 
            scaleY: 1 / 1.02, 
            ease: 'power1.inOut', 
            duration: 0.5 
          },
          0
        )
        .to({}, { duration: 3.6 }, 0.5) // Dummy tween to keep timeline duration synchronized
        .to({}, { duration: 0.9 }, 4.1); // Pad timeline to 5.0s

      // Secondary ScrollTrigger for shrinking the container as it unpins and scrolls out of view
      gsap.timeline({
        scrollTrigger: {
          trigger: unpinTriggerRef.current,
          start: 'top bottom', // When the unpin trigger enters the bottom of the viewport
          end: 'top center',  // Completes when the second section reaches the middle (half visible)
          scrub: 1,
        },
      })
      .to(containerRef.current, {
        borderRadius: '38px',
        scaleX: 1,
        scaleY: 1,
        ease: 'none',
      }, 0)
      .to(textRevealWrapperRef.current, {
        scaleX: 1,
        scaleY: 1,
        ease: 'none',
      }, 0);
    }, containerRef);

    // Sort and refresh all ScrollTriggers after Hero layout settles so downstream sections recalculate positions
    const timer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [animStage]);

  // Carousel item index during loading (0-33%: laptop, 33-66%: guitar, 66-100%: book)
  const currentCarouselIndex = Math.min(
    Math.floor((progress / 100) * CAROUSEL_ITEMS.length),
    CAROUSEL_ITEMS.length - 1
  );

  const showProgressBar = animStage === 'loading';
  const showCarousel = animStage === 'loading';
  const nameIsUp =
    animStage === 'name_slide' ||
    animStage === 'photo_reveal' ||
    animStage === 'completed';
  const showStoryteller =
    animStage === 'name_slide' ||
    animStage === 'photo_reveal' ||
    animStage === 'completed';
  const showNaitikPhoto =
    animStage === 'photo_reveal' || animStage === 'completed';

  return (
    <>
    <div
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-[calc(100vh-0.5rem)] md:min-h-[calc(100vh-0.5rem)] lg:min-h-[calc(100vh-1rem)] rounded-[38px] overflow-hidden flex flex-col bg-[var(--color-card-bg)] shadow-2xl"
    >
      {/* Background Noise & Vignette Layers */}
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-50 z-0" />
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      {/* Top Progress Bar inside container */}
      <div
        className={`absolute top-10 md:top-12 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl md:max-w-4xl px-6 flex items-center gap-3 transition-opacity duration-500 ease-out ${showProgressBar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex-1 bg-[#3A3930] h-4 md:h-5 rounded-full p-1 border border-[#2B2A23] shadow-inner relative overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-100 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[#3A3930] font-semibold text-base md:text-lg w-12 text-right tracking-tighter">
          {progress}%
        </span>
      </div>

      {/* Center Carousel Images (Laptop -> Guitar -> Book) */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none transition-opacity duration-500 ease-out ${showCarousel ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {CAROUSEL_ITEMS.map((item, idx) => (
          <div
            key={item.src}
            className={`absolute transition-all duration-500 ease-in-out transform flex items-center justify-center w-full max-w-3xl md:max-w-4xl ${idx === currentCarouselIndex
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
              }`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={1200}
              height={1200}
              className={`object-contain w-auto drop-shadow-2xl ${item.src === '/guitar.png'
                ? 'max-h-[44vh] md:max-h-[50vh]'
                : 'max-h-[58vh] md:max-h-[66vh]'
                }`}
              priority
            />
          </div>
        ))}
      </div>

      {/* Hero Content Container */}
      <div
        ref={heroContentRef}
        className="flex flex-col items-center justify-between min-h-[85vh] relative z-10 w-full pt-16 h-full flex-1"
      >
        {/* Title & Subtitle Wrapper */}
        <div
          className={`flex flex-col items-center text-center px-4 w-full transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${nameIsUp
            ? 'translate-y-0'
            : 'translate-y-[62vh] md:translate-y-[68vh]'
            }`}
        >
          <h1 className="text-primary font-bold tracking-tight text-6xl md:text-[9rem] lg:text-[10rem] leading-none whitespace-nowrap text-ellipsis max-w-full">
            Naitik Chattaraj
          </h1>
          <p
            className={`mt-4 text-xl md:text-2xl font-regular tracking-[-7%] transition-all duration-700 ease-out ${showStoryteller
              ? 'opacity-100 translate-y-0 delay-200'
              : 'opacity-0 -translate-y-3 pointer-events-none'
              }`}
          >
            Designer · Developer · Storyteller
          </p>
        </div>

        {/* The single existing naitik.png image - Revealed AFTER name slides up */}
        <div
          className={`relative w-full max-w-2xl mt-auto mx-auto flex justify-center transition-all duration-800 ease-out ${showNaitikPhoto
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }`}
        >
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
        className="absolute inset-0 z-20 flex items-center justify-center w-full opacity-0 pointer-events-none"
      >
        <TextReveal ref={textRevealHandleRef} />
      </div>
    </div>
    <div ref={unpinTriggerRef} className="w-full h-px opacity-0 pointer-events-none" />
    </>
  );
}
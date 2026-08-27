'use client';

/**
 * ScrollSnapper
 *
 * Requirements:
 * 1. Allow normal scrolling for the rest of the website (smooth scrolling).
 * 2. Do not hijack wheel/touch events on the body globally.
 * 3. Only apply settling/locking behaviour at the very end of the scroll
 *    (the Contact section at the bottom) or when settling in general,
 *    and ensure the first section (Hero) doesn't get skipped or scrolled all at once.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'contact'];
const SETTLE_DELAY = 300; // ms to wait after scroll stops before settling

export default function ScrollSnapper() {
  const isAnimatingRef = useRef(false);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let snapPoints: number[] = [];

    // Compute dynamically center-aligned snap points for all sections
    const updateSnapPoints = () => {
      ScrollTrigger.refresh();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const points: number[] = [];

      SECTION_IDS.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (!el) return;

        const rawTop = getOffsetTop(el);
        if (idx === 0) {
          points.push(0);
        } else {
          // Query the exact, fresh DOM height of the element
          const elHeight = el.getBoundingClientRect().height || el.offsetHeight;
          const viewportHeight = window.innerHeight;
          
          // Center the section if it is smaller than viewport. Otherwise, snap to its top.
          let centeredScroll = rawTop;
          if (elHeight < viewportHeight) {
            centeredScroll = rawTop - (viewportHeight - elHeight) / 2;
          }
          points.push(Math.max(0, Math.min(centeredScroll, maxScroll)));
        }
      });

      // Add ends of GSAP pinned sections if necessary to navigate out of them
      SECTION_IDS.forEach((id) => {
        if (id === 'hero') return; // Skip hero end snap point so it scrolls naturally
        const triggers = ScrollTrigger.getAll();
        const pinTrigger = triggers.find(st => st.trigger?.id === id && st.pin);
        if (pinTrigger) {
          const rawEnd = pinTrigger.end;
          const el = document.getElementById(id);
          if (el) {
            const elHeight = el.getBoundingClientRect().height || el.offsetHeight;
            const viewportHeight = window.innerHeight;
            let centeredEnd = rawEnd;
            if (elHeight < viewportHeight) {
              centeredEnd = rawEnd - (viewportHeight - elHeight) / 2;
            }
            points.push(Math.max(0, Math.min(centeredEnd, maxScroll)));
          } else {
            points.push(Math.min(rawEnd, maxScroll));
          }
        }
      });

      snapPoints = [...new Set(points)].sort((a, b) => a - b);
    };

    const getOffsetTop = (el: HTMLElement): number => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    const getActivePinTrigger = () => {
      const currentScroll = window.scrollY;
      const triggers = ScrollTrigger.getAll();
      return triggers.find(st => st.pin && currentScroll >= st.start && currentScroll < st.end - 5);
    };

    const isInsidePinnedSection = () => {
      return !!getActivePinTrigger();
    };

    const getClosestIndex = (scrollY: number) => {
      let closestIdx = 0;
      let minDiff = Infinity;
      snapPoints.forEach((point, idx) => {
        const diff = Math.abs(point - scrollY);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      return closestIdx;
    };

    const snapToPoint = (point: number) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const html = document.documentElement;
      const originalScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';

      gsap.to(window, {
        scrollTo: { y: point, autoKill: false },
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          isAnimatingRef.current = false;
          html.style.scrollBehavior = originalScrollBehavior;
        }
      });
    };

    // Settle snap back if offset after scrolling stops (gentle drift back to nearby sections)
    const onScroll = () => {
      if (isAnimatingRef.current) return;

      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }

      settleTimeoutRef.current = setTimeout(() => {
        if (isInsidePinnedSection() || isAnimatingRef.current) return;

        const currentScroll = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Check if we are near the absolute bottom (Contact section)
        // Snapping is forced to lock at the last section to align it perfectly.
        const isNearBottom = (maxScroll - currentScroll) < 180;
        const closestIdx = getClosestIndex(currentScroll);
        const closestPoint = snapPoints[closestIdx];

        if (isNearBottom) {
          snapToPoint(maxScroll);
          return;
        }

        // For other sections, only drift snap if we are already very close (within 70px)
        // to a snap boundary, keeping normal scrolling feeling free and unrestrained.
        if (Math.abs(currentScroll - closestPoint) > 10 && Math.abs(currentScroll - closestPoint) < 70) {
          snapToPoint(closestPoint);
        }
      }, SETTLE_DELAY);
    };

    // Initial setup
    const timer = setTimeout(() => {
      updateSnapPoints();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', updateSnapPoints, { passive: true });
    }, 800);

    return () => {
      clearTimeout(timer);
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateSnapPoints);
    };
  }, []);

  return null;
}

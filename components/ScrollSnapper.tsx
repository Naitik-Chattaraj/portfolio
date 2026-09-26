'use client';

/**
 * ScrollSnapper
 *
 * Provides smooth snap-to-section settling when scrolling stops across all portfolio sections:
 * Hero, About, Projects, Skills, Contact, and Footer.
 *
 * Avoids interfering with active scrolling or inside GSAP pinned animations.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'contact', 'footer'];
const SETTLE_DELAY = 180; // ms to wait after scroll stops before settling

export default function ScrollSnapper() {
  const isAnimatingRef = useRef(false);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let snapPoints: number[] = [];

    // Compute dynamically center-aligned snap points for all sections
    const updateSnapPoints = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const points: number[] = [0];

      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const rawTop = rect.top + window.scrollY;
        const elHeight = rect.height || el.offsetHeight;
        const viewportHeight = window.innerHeight;

        let targetScroll = rawTop;
        // Center the section if it is smaller than or equal to viewport height
        if (elHeight <= viewportHeight + 30) {
          targetScroll = rawTop - Math.max(0, (viewportHeight - elHeight) / 2);
        }

        points.push(Math.max(0, Math.min(targetScroll, maxScroll)));
      });

      // Include end points of GSAP pinned triggers (transitions out of pinned sections)
      const triggers = ScrollTrigger.getAll();
      triggers.forEach((st) => {
        if (st.pin && st.end) {
          points.push(Math.max(0, Math.min(st.end, maxScroll)));
        }
      });

      // Always include absolute bottom
      points.push(maxScroll);

      snapPoints = Array.from(new Set(points.map((p) => Math.round(p)))).sort((a, b) => a - b);
    };

    const getActivePinTrigger = () => {
      const currentScroll = window.scrollY;
      const triggers = ScrollTrigger.getAll();
      return triggers.find(
        (st) => st.pin && currentScroll >= st.start + 10 && currentScroll < st.end - 10
      );
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
        duration: 0.7,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          isAnimatingRef.current = false;
          html.style.scrollBehavior = originalScrollBehavior;
        },
      });
    };

    // Cancel snapping animation immediately if user touches or wheels
    const interruptSnap = () => {
      if (isAnimatingRef.current) {
        gsap.killTweensOf(window);
        isAnimatingRef.current = false;
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };

    const checkAndSnap = () => {
      if (isInsidePinnedSection() || isAnimatingRef.current) return;

      const currentScroll = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Check if near absolute bottom
      if (maxScroll - currentScroll < 120) {
        if (Math.abs(currentScroll - maxScroll) > 10) {
          snapToPoint(maxScroll);
        }
        return;
      }

      const closestIdx = getClosestIndex(currentScroll);
      const closestPoint = snapPoints[closestIdx];

      if (Math.abs(currentScroll - closestPoint) > 10) {
        snapToPoint(closestPoint);
      }
    };

    const onScroll = () => {
      if (isAnimatingRef.current) return;

      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }

      settleTimeoutRef.current = setTimeout(checkAndSnap, SETTLE_DELAY);
    };

    // Initial setup
    updateSnapPoints();
    const timer = setTimeout(updateSnapPoints, 500);

    // Keep snapPoints updated when GSAP triggers or window refresh
    ScrollTrigger.addEventListener('refresh', updateSnapPoints);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', checkAndSnap, { passive: true });
    window.addEventListener('wheel', interruptSnap, { passive: true });
    window.addEventListener('touchstart', interruptSnap, { passive: true });
    window.addEventListener('resize', updateSnapPoints, { passive: true });

    return () => {
      clearTimeout(timer);
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      ScrollTrigger.removeEventListener('refresh', updateSnapPoints);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', checkAndSnap);
      window.removeEventListener('wheel', interruptSnap);
      window.removeEventListener('touchstart', interruptSnap);
      window.removeEventListener('resize', updateSnapPoints);
    };
  }, []);

  return null;
}
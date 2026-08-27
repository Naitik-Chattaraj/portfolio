'use client';

/**
 * ScrollSnapper — revised
 *
 * Behaviour:
 *  • Inside a GSAP-pinned ScrollTrigger (Hero / Skills): completely hands-off.
 *    The native scroll and GSAP scrub run undisturbed.
 *
 *  • Everywhere else: free smooth scrolling.  After the user stops scrolling
 *    for SETTLE_MS milliseconds, if the viewport is not exactly on a snap
 *    point it gently animates to the nearest one ("settle" snap).
 *
 * No wheel events are cancelled, so the browser's native smooth-scroll
 * momentum is preserved during the scroll gesture itself.
 */

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── Tuning constants ─────────────────────────────────────────────────────────

/** ms after last scroll event before we consider the user has "stopped" */
const SETTLE_MS = 220;

/**
 * If the current scroll position is within this many pixels of a snap point
 * we do NOT settle — the user is already there.
 */
const DEAD_ZONE_PX = 6;

/** Section IDs that define the snap points, in DOM order */
const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'contact'];

// ─── Exports ──────────────────────────────────────────────────────────────────

export default function ScrollSnapper() {
  useEffect(() => {
    // Delay init so all GSAP ScrollTriggers (and their pinSpacing) are laid out
    const initTimer = setTimeout(init, 700);
    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, []);

  return null;
}

// ─── Module-level state ───────────────────────────────────────────────────────

let snapPoints: number[] = [];
let isSettling = false;
let tweenRef: gsap.core.Tween | null = null;
let settleTimer: ReturnType<typeof setTimeout> | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Snap-point computation ───────────────────────────────────────────────────

function buildSnapPoints() {
  ScrollTrigger.refresh();

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const points: number[] = [];

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    points.push(Math.min(getOffsetTop(el), maxScroll));
  }

  // Deduplicate, sort, clamp
  snapPoints = [...new Set(points)]
    .sort((a, b) => a - b)
    .map((p) => Math.min(p, maxScroll));
}

/** Accumulates offsetTop up the offsetParent chain. */
function getOffsetTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function closestSnapPoint(scrollY: number): number {
  let best = snapPoints[0] ?? 0;
  let bestDist = Infinity;
  for (const p of snapPoints) {
    const d = Math.abs(p - scrollY);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

// ─── Settle logic ─────────────────────────────────────────────────────────────

/**
 * Returns true when the current scroll position is within any active
 * GSAP-pinned ScrollTrigger's start→end range.  While true we stay
 * completely hands-off.
 */
function isInsidePinnedSection(): boolean {
  for (const st of ScrollTrigger.getAll()) {
    if (st.pin && st.isActive) return true;
  }
  return false;
}

function scheduleSettle() {
  if (settleTimer) clearTimeout(settleTimer);
  settleTimer = setTimeout(doSettle, SETTLE_MS);
}

function doSettle() {
  // Don't interfere with pinned / scrub sections
  if (isInsidePinnedSection()) return;
  // Don't stack settles
  if (isSettling) return;

  const currentY = window.scrollY;
  const target = closestSnapPoint(currentY);

  // Already close enough — nothing to do
  if (Math.abs(currentY - target) <= DEAD_ZONE_PX) return;

  isSettling = true;
  tweenRef?.kill();

  // Temporarily disable CSS smooth-scroll so GSAP's ScrollToPlugin has sole
  // control of the easing (prevents the double-smooth jitter).
  const htmlEl = document.documentElement;
  htmlEl.style.scrollBehavior = 'auto';

  tweenRef = gsap.to(window, {
    scrollTo: { y: target, autoKill: true },
    duration: 0.65,
    ease: 'power2.inOut',
    onComplete: () => {
      htmlEl.style.scrollBehavior = '';
      isSettling = false;
    },
    onInterrupt: () => {
      htmlEl.style.scrollBehavior = '';
      isSettling = false;
    },
  });
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function onScroll() {
  // If a settle tween is running and the user scrolls again, kill it so the
  // native momentum takes over — the settle will reschedule when they stop.
  if (isSettling) {
    tweenRef?.kill();
    isSettling = false;
  }
  scheduleSettle();
}

function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildSnapPoints();
  }, 250);
}

// ─── Init / cleanup ───────────────────────────────────────────────────────────

function init() {
  buildSnapPoints();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
}

function cleanup() {
  tweenRef?.kill();
  if (settleTimer) clearTimeout(settleTimer);
  if (resizeTimer) clearTimeout(resizeTimer);
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onResize);
  isSettling = false;
}

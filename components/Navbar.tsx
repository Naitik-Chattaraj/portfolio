'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  // State for the section being viewed (left pill)
  const [activeSection, setActiveSection] = useState('Hero');
  const [footerVisible, setFooterVisible] = useState(false);

  const pathname = usePathname();

  // Derive the active nav pill from the current URL only (not scroll position)
  const activePage = pathname.startsWith('/projects') ? 'Projects'
    : pathname.startsWith('/contact') ? 'Contact'
      : 'Home';

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'projects', 'skills', 'contact', 'footer'];
      let currentSection = 'Hero';

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = section.charAt(0).toUpperCase() + section.slice(1);
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide navbar when footer is visible
  useEffect(() => {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const navItems = ['Home', 'Projects', 'Contact'];
  const PILL_W = 105;
  const PILL_GAP = 5;
  const activeIdx = navItems.indexOf(activePage);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-between items-end px-8 md:px-16 pb-4 pointer-events-none">
      {/* Left Pill */}
      <div
        className="bg-[#D6D6B1]/50 backdrop-blur-md rounded-full px-8 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-500 ease-out"
        style={{
          opacity: footerVisible ? 0 : 1,
          pointerEvents: footerVisible ? 'none' : 'auto',
          transform: footerVisible ? 'translateX(-40px)' : 'translateX(0)',
        }}
      >
        <span className="text-xl font-medium">
          {pathname.startsWith('/projects/') ? 'Projects' : activeSection}
        </span>
      </div>

      {/* Right Navbar Pill */}
      <div
        className="relative flex bg-[#D6D6B1]/50 backdrop-blur-md rounded-full p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-500 ease-out"
        style={{
          opacity: footerVisible ? 0 : 1,
          pointerEvents: footerVisible ? 'none' : 'auto',
          transform: footerVisible ? 'translateX(40px)' : 'translateX(0)',
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item}
            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
            className={`relative z-10 px-6 py-2 rounded-full text-lg font-medium transition-colors duration-300 ${
              activePage === item ? 'text-[#D6D6B1]' : 'text-gray-800 hover:text-black'
            }`}
            style={{ minWidth: PILL_W }}
          >
            {item}
          </Link>
        ))}
        {/* Sliding Active Background */}
        <div
          className="absolute top-1 bottom-1 bg-[#3F3F37]/80 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: PILL_W,
            left: activeIdx >= 0 ? 4 + activeIdx * (PILL_W + PILL_GAP) : 4,
          }}
        />
      </div>
    </div>
  );
}


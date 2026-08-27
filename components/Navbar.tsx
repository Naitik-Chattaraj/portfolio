'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  // State for the section being viewed (left pill)
  const [activeSection, setActiveSection] = useState('Hero');

  const pathname = usePathname();

  // Derive active nav item from the current URL
  const activePage = pathname.startsWith('/projects') ? 'Projects'
    : pathname === '/' ? 'Home'
      : pathname.startsWith('/contact') ? 'Contact'
        : 'Home';

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'projects', 'skills'];
      let currentSection = 'Hero';

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Check if the section is in the middle of the viewport
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = section.charAt(0).toUpperCase() + section.slice(1);
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Home', 'Projects', 'Contact'];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-between items-end px-8 md:px-16 pb-4">
      {/* Left Pill */}
      <div className="bg-[#D6D6B1]/50 backdrop-blur-md rounded-full px-8 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
        <span className="text-xl font-medium">
          {pathname.startsWith('/projects/') ? 'Projects' : activeSection}
        </span>
      </div>

      {/* Right Navbar Pill */}
      <div className="relative flex bg-[#D6D6B1]/50 backdrop-blur-md rounded-full p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ">
        {navItems.map((item) => (
          <Link
            key={item}
            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
            className={`relative z-10 px-6 py-2 rounded-full text-lg font-medium transition-colors duration-300 ${activePage === item ? 'text-[#D6D6B1]' : 'text-gray-800 hover:text-black'
              }`}
          >
            {item}
          </Link>
        ))}
        {/* Sliding Active Background */}
        <div
          className="absolute top-1 bottom-1 bg-[#3F3F37]/80 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: '100px',
            left: activePage === 'Home' ? '4px' : activePage === 'Projects' ? '109px' : '208px',
          }}
        />
      </div>
    </div>
  );
}


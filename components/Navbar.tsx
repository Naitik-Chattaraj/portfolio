'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  // State for the section being viewed (left pill)
  const [activeSection, setActiveSection] = useState('Hero');
  // State for the page navigation (right pill)
  const [activePage, setActivePage] = useState('Home');

  const navItems = ['Home', 'Projects', 'Contact'];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-between items-end px-8 md:px-16 pb-4">
      {/* Left Pill */}
      <div className="bg-[#D6D6B1]/50 backdrop-blur-md rounded-full px-8 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
        <span className="text-xl font-medium">{activeSection}</span>
      </div>

      {/* Right Navbar Pill */}
      <div className="relative flex bg-[#D6D6B1]/50 backdrop-blur-md rounded-full p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ">
        {navItems.map((item) => (
          <Link
            key={item}
            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
            onClick={() => setActivePage(item)}
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
            width: '100px', // approximate width, in a real app measure element width or use flex box tricks
            left: activePage === 'Home' ? '4px' : activePage === 'Projects' ? '98px' : '198px',
            // A more robust sliding pill would use refs and measure exact width/left of the active element
          }}
        />
      </div>
    </div>
  );
}

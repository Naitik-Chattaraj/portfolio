'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const chars = textRefs.current.filter(Boolean);

      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );

      if (chars.length) {
        gsap.fromTo(
          chars,
          { opacity: 0, filter: "blur(12px)", y: 10 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            stagger: 0.008,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
            onComplete: () => {
              gsap.set(chars, { clearProps: "filter,y" });
            },
          }
        );
      }

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out', delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const segments = [
    { text: "Whether you have an idea waiting to be built, a challenging problem to solve, or simply want to connect, I'd love to hear from you. ", highlight: false },
    { text: "Great products begin with great conversations", highlight: true },
    { text: "—and this might be the start of one.", highlight: false }
  ];

  const renderText = () => {
    let charIndex = 0;
    return segments.map((seg, sIdx) => {
      const words = seg.text.split(/(\s+)/);
      return (
        <span key={sIdx} className={seg.highlight ? "text-[#AA6060]" : ""}>
          {words.map((word, wIdx) => {
            if (word.match(/^\s+$/)) {
              return <span key={wIdx}>{word}</span>;
            }
            return (
              <span key={wIdx} className="inline-block whitespace-pre">
                {word.split('').map((char) => {
                  const idx = charIndex++;
                  return (
                    <span
                      key={idx}
                      className="inline-block will-change-[filter,opacity,transform] opacity-0"
                      ref={(el) => {
                        textRefs.current[idx] = el;
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      );
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:naitikchattaraj11@gmail.com?subject=${subject}&body=${body}`;
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full min-h-[calc(100vh-0.5rem)] md:min-h-[calc(100vh-0.5rem)] lg:min-h-[calc(100vh-1rem)] rounded-[38px] overflow-hidden flex flex-col bg-[#D6D6B1] shadow-2xl mt-4"
    >
      {/* Background Noise & Vignette Layers */}
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-50 z-0" />
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      <div
        ref={headerRef}
        className="relative z-10 w-full flex justify-between items-center px-8 py-6 border-b border-dashed border-[#3F3F37]/30 text-2xl md:text-3xl font-mono tracking-widest opacity-0"
      >
        <span className="text-[#3F3F37]">004</span>
        <span className="text-[#3F3F37]">CONTACT ME</span>
        <span className="text-[#3F3F37]">004</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-8 md:px-16 py-16">

        <div ref={copyRef} className="flex-1 max-w-xl">
          <p className="text-[#3F3F37] text-3xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight">
            {renderText()}
          </p>

          <div className="mt-10 flex gap-4">
            {/* GitHub */}
            <a
              href="https://github.com/Naitik-Chattaraj"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="group relative w-12 h-12 flex items-center justify-center rounded-full border border-[#3F3F37]/40 text-[#3F3F37] overflow-hidden transition-all duration-300 hover:border-[#3F3F37] hover:text-white hover:scale-110"
            >
              <span className="absolute inset-0 bg-[#3F3F37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              <svg className="relative z-10 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/in/naitik-chattaraj"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="group relative w-12 h-12 flex items-center justify-center rounded-full border border-[#3F3F37]/40 text-[#3F3F37] overflow-hidden transition-all duration-300 hover:border-[#0A66C2] hover:text-white hover:scale-110"
            >
              <span className="absolute inset-0 bg-[#0A66C2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              <svg className="relative z-10 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:naitikchattaraj11@gmail.com"
              title="Email"
              className="group relative w-12 h-12 flex items-center justify-center rounded-full border border-[#3F3F37]/40 text-[#3F3F37] overflow-hidden transition-all duration-300 hover:border-[#AA6060] hover:text-white hover:scale-110"
            >
              <span className="absolute inset-0 bg-[#AA6060] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              <Mail className="relative z-10 w-5 h-5" strokeWidth={1.75} />
            </a>
          </div>
        </div>

        <div ref={cardRef} className="w-full max-w-md opacity-0">
          <div className="relative rounded-3xl overflow-hidden bg-[#2e2e28] border border-[#D6D6B1]/15 shadow-[0_0_60px_rgba(0,0,0,0.5)] p-8 flex flex-col gap-6">

            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl border border-[#D6D6B1]/30 flex items-center justify-center text-[#D6D6B1]">
                <Mail size={24} strokeWidth={1.5} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-[#D6D6B1]/60 text-xs font-mono tracking-widest uppercase">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-[#D6D6B1]/25 focus:border-[#D6D6B1]/70 text-[#D6D6B1] placeholder-[#D6D6B1]/30 py-2 text-base outline-none transition-colors duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-[#D6D6B1]/60 text-xs font-mono tracking-widest uppercase">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-b border-[#D6D6B1]/25 focus:border-[#D6D6B1]/70 text-[#D6D6B1] placeholder-[#D6D6B1]/30 py-2 text-base outline-none transition-colors duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-[#D6D6B1]/60 text-xs font-mono tracking-widest uppercase">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or idea..."
                  className="w-full bg-[#D6D6B1]/5 border border-[#D6D6B1]/15 focus:border-[#D6D6B1]/50 rounded-xl text-[#D6D6B1] placeholder-[#D6D6B1]/30 p-3 text-base outline-none resize-none transition-colors duration-200"
                />
              </div>

              <button
                id="contact-submit"
                type="submit"
                disabled={sending || sent}
                className="group relative mt-1 w-full flex items-center justify-center gap-2 rounded-full bg-[#D6D6B1] text-[#3F3F37] py-3.5 font-semibold text-base tracking-wide overflow-hidden transition-all duration-300 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300 rounded-full" />
                <span className="relative z-10 flex items-center gap-2">
                  {sent ? (
                    'Message sent!'
                  ) : sending ? (
                    'Opening mail client...'
                  ) : (
                    <>
                      Send <Send size={16} strokeWidth={2} />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

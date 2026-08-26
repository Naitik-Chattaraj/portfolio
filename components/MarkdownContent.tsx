'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// ── Custom renderers ─────────────────────────────────────────────────────────
// We map every markdown element to styled HTML so we don't need the
// @tailwindcss/typography plugin.

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-bold text-white mt-10 mb-4 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl font-semibold text-white mt-8 mb-3 leading-snug">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-white/90 mt-6 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-white/75 leading-relaxed mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-white/75 mb-4 space-y-1 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-white/75 mb-4 space-y-1 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 my-6 text-white/60 italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    // Fenced code block (has a language className like "language-js")
    if (className) {
      return (
        <code className="block bg-white/5 rounded-xl p-4 text-sm text-white/80 overflow-x-auto mb-4 font-mono">
          {children}
        </code>
      );
    }
    // Inline code
    return (
      <code className="bg-white/10 rounded px-1.5 py-0.5 text-sm text-white/90 font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-white/5 rounded-xl p-4 overflow-x-auto mb-4">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm text-white/75 border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="text-white/40 uppercase text-xs">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-white/10 px-4 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/5 px-4 py-2">{children}</td>
  ),
  hr: () => <hr className="border-white/10 my-8" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      className="w-full rounded-2xl my-6 object-cover shadow-lg"
    />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-white/80">{children}</em>,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}

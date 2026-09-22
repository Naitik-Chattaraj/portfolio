import type { Metadata } from 'next';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact | Naitik Chattaraj',
  description: 'Get in touch with Naitik Chattaraj — available for collaborations, projects, and opportunities.',
};

export default function ContactPage() {
  return (
    <main
      className="min-h-screen flex flex-col pt-3 md:pt-5 lg:pt-6"
      style={{ backgroundColor: 'var(--color-body-bg)' }}
    >
      <div className="w-full px-2 md:px-4 lg:px-6">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}

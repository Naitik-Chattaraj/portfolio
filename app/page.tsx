import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center pt-3 md:pt-5 lg:pt-6">
      <div className="w-full px-2 md:px-4 lg:px-6">
        <Hero />
      </div>
      <About />
      <div className="w-full px-2 md:px-4 lg:px-6">
        <Projects />
      </div>
      <Skills />
      <div className="w-full px-2 md:px-4 lg:px-6">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}


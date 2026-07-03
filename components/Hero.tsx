import Image from 'next/image';
import TextReveal from './TextReveal';

export default function Hero() {
  return (
    <div
      className="relative w-full min-h-[calc(100vh-0.5rem)] md:min-h-[calc(100vh-0.5rem)] lg:min-h-[calc(100vh-1rem)] rounded-[38px] overflow-hidden flex flex-col bg-[var(--color-card-bg)] shadow-2xl"
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-multiply opacity-50 z-0"></div>

      <div className="flex flex-col items-center justify-between min-h-[85vh] relative z-10 w-full pt-16">
        <div className="flex flex-col items-center text-center px-4 w-full">
          {/* Responsive text size to fit screen width, but cap max size */}
          <h1 className="text-primary font-bold tracking-tight text-6xl md:text-[9rem] lg:text-[10rem] leading-none whitespace-nowrap text-ellipsis max-w-full">
            Naitik Chattaraj
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-regular tracking-[-7%]">
            Designer · Developer · Storyteller
          </p>
        </div>

        <div className="relative w-full max-w-2xl mt-auto mx-auto flex justify-center">
          {/* Ensure the image scales properly and anchors to the bottom */}
          <Image
            src="/naitik.png"
            alt="Naitik Chattaraj"
            width={1000}
            height={1000}
            className="object-cover w-full h-auto"
            priority
          />
        </div>
      </div>
      
      {/* Huge scroll-reveal text */}
      <div className="relative z-10 w-full mb-32">
        <TextReveal />
      </div>

    </div>
  );
}

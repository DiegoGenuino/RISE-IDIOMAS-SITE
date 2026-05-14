import { useState, useEffect, useRef } from 'react';
import openLetter from '../../assets/icons/enrollment-letter/open-letter.png';
import closedLetter from '../../assets/icons/enrollment-letter/closed-letter.png';

export default function EnrollmentLetter() {
  const [isOpen, setIsOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Native JS intersection observer to pause the animation when hidden, saving performance inside the Island
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!intervalId) {
              intervalId = setInterval(() => {
                setIsOpen((prev) => !prev);
              }, 600);
            }
          } else {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (intervalId) clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute z-[10] h-max w-[14rem] shrink-0 -translate-y-35 rotate-[-5deg] justify-self-center select-none sm:w-[16rem] md:w-[20rem] md:-translate-y-70 lg:w-[25rem]"
    >
      <img
        src={openLetter.src}
        alt="open letter"
        className={`relative top-0 left-0 h-auto w-full -translate-y-[8rem] transition-opacity duration-300 sm:-translate-y-[9.2rem] md:-translate-y-[11.5rem] lg:-translate-y-[14.2rem] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <img
        src={closedLetter.src}
        alt="closed letter"
        className={`absolute top-0 left-0 h-auto w-full transition-opacity duration-300 ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}

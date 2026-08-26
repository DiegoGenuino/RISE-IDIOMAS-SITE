import Lenis from 'lenis';

/**
 * Scroll suave (Lenis).
 *
 * Deliberadamente sem GSAP: o ScrollTrigger custa ~110 KB e só é preciso na
 * cena da metodologia, que é carregada à parte. Quando essa cena entra em
 * ação regista-se aqui através de `onScroll` — assim o caminho crítico da
 * página fica só com o Lenis.
 */

let lenis: Lenis | null = null;
const listeners = new Set<() => void>();

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Regista um callback chamado a cada frame de scroll (ex.: ScrollTrigger.update). */
export function onScroll(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function initSmoothScroll(): Lenis | null {
  // Sem scroll sintético para quem pediu menos movimento: o browser conduz.
  if (prefersReducedMotion()) return null;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    touchMultiplier: 1.6,
    // O toque no telemóvel mantém o scroll nativo — mais previsível e mais leve.
    syncTouch: false,
  });

  lenis.on('scroll', () => {
    for (const listener of listeners) listener();
  });

  function frame(time: number): void {
    lenis?.raf(time);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return lenis;
}

/** Rola até um elemento respeitando a altura da navbar fixa. */
export function scrollToId(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  const offset = -72;

  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function stopScroll(): void {
  lenis?.stop();
  document.documentElement.classList.add('lenis-stopped');
  document.body.style.overflow = 'hidden';
}

export function startScroll(): void {
  lenis?.start();
  document.documentElement.classList.remove('lenis-stopped');
  document.body.style.overflow = '';
}

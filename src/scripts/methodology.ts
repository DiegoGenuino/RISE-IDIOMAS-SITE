import { scrollToId } from './smoothScroll';

/**
 * Metodologia: liga o índice fixo aos cartões.
 *
 * Sem GSAP e sem listener de scroll — um IntersectionObserver com uma faixa
 * estreita no meio da viewport decide qual o cartão em foco, e o índice
 * acompanha. Todo o custo está no observer, que só corre quando algo cruza a
 * faixa.
 */
export function initMethodology(): void {
  const steps = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-step]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]'));
  if (steps.length === 0 || panels.length === 0) return;

  function activate(index: number): void {
    for (const step of steps) {
      step.setAttribute('aria-current', String(Number(step.dataset.step) === index));
    }
    for (const panel of panels) {
      if (Number(panel.dataset.panel) === index) panel.setAttribute('data-active', '');
      else panel.removeAttribute('data-active');
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // O cartão que ocupa mais da faixa central é o que está a ser lido.
      let best: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      }
      if (best) activate(Number((best.target as HTMLElement).dataset.panel));
    },
    // Faixa de leitura: o terço central da viewport.
    { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.5, 1] }
  );

  for (const panel of panels) observer.observe(panel);

  activate(0);

  for (const step of steps) {
    step.addEventListener('click', () => {
      const target = step.dataset.goto;
      if (target) scrollToId(target);
    });
  }
}

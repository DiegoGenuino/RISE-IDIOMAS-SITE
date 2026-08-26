/**
 * Revelação de blocos ao entrar na viewport.
 *
 * IntersectionObserver em vez de ScrollTrigger para os elementos simples: o
 * observer corre fora da main thread de scroll e cada elemento é desligado
 * assim que aparece, portanto o custo tende a zero à medida que se rola.
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('.ds-reveal');
  if (targets.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const target of targets) target.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
  );

  for (const target of targets) observer.observe(target);
}

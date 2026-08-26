/**
 * Revelação de blocos ao entrar na viewport.
 *
 * Duas regras que valem mais do que a animação em si:
 *
 *  1. O estado escondido só existe depois do JS armar (`html.ds-reveal-armed`).
 *     Sem isso, qualquer falha antes desta função — um erro noutro módulo, JS
 *     desativado, um bundle que não chega — deixaria a página com metade do
 *     conteúdo a opacidade zero. O padrão tem de ser "visível".
 *
 *  2. Há uma rede de segurança temporal: o que não tiver sido revelado em 3s
 *     é revelado à força. Um IntersectionObserver que não dispara nunca não
 *     pode significar conteúdo perdido.
 */
export function initReveal(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.ds-reveal'));
  if (targets.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll(): void {
    for (const target of targets) target.classList.add('is-visible');
  }

  if (reduced) {
    revealAll();
    return;
  }

  // Só agora é seguro esconder.
  document.documentElement.classList.add('ds-reveal-armed');

  const pending = new Set(targets);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        pending.delete(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
  );

  for (const target of targets) observer.observe(target);

  window.setTimeout(() => {
    for (const target of pending) {
      const box = target.getBoundingClientRect();
      // Só força o que já devia ter aparecido; o resto continua a aguardar scroll.
      if (box.top < window.innerHeight * 1.2) {
        target.classList.add('is-visible');
        pending.delete(target);
        observer.unobserve(target);
      }
    }
  }, 3000);
}

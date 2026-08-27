/**
 * Revelação de títulos com GSAP SplitText.
 *
 * Segue o padrão da documentação do GSAP: `SplitText.create()` com `onSplit`
 * devolvendo o tween. Os caracteres entram desfocados e resolvem em cascata.
 *
 * A ordem dentro do `onSplit` é o que evita o lampejo: o tween é criado
 * primeiro (e o `gsap.from` já põe os caracteres invisíveis no mesmo instante),
 * e só depois o título é revelado. Até aí ele esteve `visibility: hidden` por
 * CSS, portanto o texto inteiro nunca chega a ser pintado.
 */

import type { gsap as GsapType } from 'gsap';

type Gsap = typeof GsapType;

export async function initTextReveal(): Promise<void> {
  const root = document.documentElement;

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-split]'));
    if (targets.length === 0) return;

    const [{ gsap }, { SplitText }] = await Promise.all([import('gsap'), import('gsap/SplitText')]);

    gsap.registerPlugin(SplitText);

    // Partir o texto antes das fontes carregarem mediria os caracteres na
    // fonte de fallback, e a troca deslocaria tudo a meio da animação.
    await document.fonts?.ready;

    const reveal = (target: HTMLElement) => split(gsap, SplitText, target);

    for (const target of targets) {
      if (target.dataset.split === 'hero') reveal(target);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    for (const target of targets) {
      if (target.dataset.split !== 'hero') observer.observe(target);
    }

    // A troca de perfil revela um título diferente — vale reanimar.
    window.addEventListener('rise:audiencechange', () => {
      for (const target of targets) {
        if (target.dataset.split !== 'hero') continue;
        target.dataset.splitDone = '';
        reveal(target);
      }
    });
  } catch {
    // Sem GSAP não há animação — mas o texto tem de aparecer.
    root.classList.add('ds-split-off');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function split(gsap: Gsap, SplitText: any, target: HTMLElement): void {
  if (target.dataset.splitDone === 'true') return;
  if (target.offsetParent === null && target.getClientRects().length === 0) return;

  const isHero = target.dataset.split === 'hero';
  const after = Array.from(
    (target.closest<HTMLElement>('[data-split-group]') ?? target).querySelectorAll<HTMLElement>(
      '[data-split-follow]'
    )
  );

  SplitText.create(target, {
    // `words` além de `chars`: cada caractere é um inline-block, e um
    // inline-block é ponto de quebra de linha. Sem a palavra a agrupá-los, o
    // título parte no meio das palavras.
    type: 'words,chars',
    wordsClass: 'ds-word',
    charsClass: 'ds-char',
    aria: 'auto',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSplit: (self: any) => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline.from(self.chars, {
        opacity: 0,
        filter: `blur(${isHero ? 14 : 10}px)`,
        yPercent: isHero ? 40 : 28,
        duration: isHero ? 0.9 : 0.7,
        stagger: 0.015,
      });

      if (after.length > 0) {
        timeline.from(after, { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, '-=0.5');
      }

      // Revelar só agora: os caracteres já estão no DOM e já estão invisíveis,
      // porque `from` aplica o estado inicial imediatamente.
      target.dataset.splitDone = 'true';

      return timeline;
    },
  });
}

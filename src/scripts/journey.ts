/**
 * Trilha de níveis: scroll horizontal conduzido pelo scroll vertical.
 *
 * O trilho é deslocado em `x` enquanto o bloco externo é percorrido. A distância
 * é recalculada em cada refresh (`invalidateOnRefresh`), porque a largura do
 * trilho depende da fonte carregada e da largura da janela — fixá-la no início
 * daria um deslocamento errado depois de um resize.
 *
 * Partilha o mesmo import dinâmico de GSAP das outras cenas: quando esta corre,
 * o módulo já está em cache.
 */

const DESKTOP = '(min-width: 940px)';

export async function initJourney(): Promise<void> {
  const block = document.querySelector<HTMLElement>('[data-journey-block]');
  if (!block) return;

  if (
    !window.matchMedia(DESKTOP).matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
    const track = block.querySelector<HTMLElement>('[data-journey-track]');
    const fill = block.querySelector<HTMLElement>('[data-journey-fill]');
    const viewport = block.querySelector<HTMLElement>('.ds-journey-viewport');
    if (!track || !viewport) return;

    block.setAttribute('data-journey-ready', '');
    ScrollTrigger.refresh();

    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: block,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (fill) fill.style.setProperty('--progress', String(self.progress));
        },
      },
    });

    return () => {
      block.removeAttribute('data-journey-ready');
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'all' });
      fill?.style.removeProperty('--progress');
    };
  });
}

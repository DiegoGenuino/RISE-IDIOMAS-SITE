import { onScroll } from './smoothScroll';

/**
 * Cena da metodologia conduzida por scroll.
 *
 * O bloco externo (425vh) é a linha do tempo; o palco fica `sticky` e a
 * timeline é escrubada contra o progresso do bloco. Todas as tweens tocam
 * apenas em `transform` e `opacity` — nenhuma propriedade que force reflow.
 *
 * Mapa do scrub (fração do bloco):
 *   0.00 – 0.45  entrada das colunas com deslocamento vertical alternado
 *   0.45 – 0.90  zoom da grelha e deriva nos eixos X/Y
 *   0.60 – 0.90  véu escurece a cena
 *   0.74 – 0.88  cabeçalho sai de cena
 *   0.88 – 0.98  camada textual central e CTAs entram
 *   0.98 – 1.00  estabilização e libertação do scroll
 *
 * O GSAP (~110 KB) é importado dinamicamente e só quando a seção se aproxima
 * da viewport, num viewport grande e sem `prefers-reduced-motion`. Em todos os
 * outros casos a seção fica no layout empilhado, que é um estado desenhado.
 */

const DESKTOP = '(min-width: 1024px)';
const STATIC_OK = '(prefers-reduced-motion: reduce)';

let started = false;

export function initStickyGrid(): void {
  const block = document.querySelector<HTMLElement>('[data-sticky-block]');
  if (!block) return;

  const desktop = window.matchMedia(DESKTOP);
  const reduced = window.matchMedia(STATIC_OK);

  function maybeArm(): void {
    if (started || !desktop.matches || reduced.matches) return;
    started = true;

    // rootMargin generoso: o download do GSAP arranca ~1 viewport antes,
    // portanto a cena já está pronta quando o utilizador lá chega.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void buildScene(block!);
      },
      { rootMargin: '100% 0px' }
    );

    observer.observe(block!);
  }

  maybeArm();

  // Quem começa em mobile e alarga a janela ainda recebe a cena.
  desktop.addEventListener('change', maybeArm);
  reduced.addEventListener('change', maybeArm);
}

async function buildScene(block: HTMLElement): Promise<void> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  gsap.registerPlugin(ScrollTrigger);

  // A partir daqui o ScrollTrigger precisa de saber do scroll sintético do Lenis
  onScroll(() => ScrollTrigger.update());

  const mm = gsap.matchMedia();

  mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
    const field = block.querySelector<HTMLElement>('[data-pillar-field]');
    const head = block.querySelector<HTMLElement>('[data-sticky-head]');
    const scrim = block.querySelector<HTMLElement>('[data-sticky-scrim]');
    const copy = block.querySelector<HTMLElement>('[data-sticky-copy]');
    const cards = gsap.utils.toArray<HTMLElement>('[data-pillar]', block);

    if (!field || !copy || cards.length === 0) return;

    // Liga o layout sticky só agora: até aqui a seção estava empilhada.
    block.setAttribute('data-scene-ready', '');
    ScrollTrigger.refresh();

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: block,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Só liberta o clique nos CTAs depois da camada textual aparecer
          if (self.progress > 0.9) copy.setAttribute('data-active', '');
          else copy.removeAttribute('data-active');
        },
      },
    });

    // Espinha de duração 1 → as posições abaixo são frações exatas do bloco
    timeline.to({}, { duration: 1 }, 0);

    // ── 0.00 – 0.45 · revelação escalonada com offset alternado ─────────
    timeline.fromTo(
      cards,
      { yPercent: (index: number) => 26 * (index % 2 === 0 ? 1 : 1.55), opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.45, stagger: 0.055, ease: 'power2.out' },
      0
    );

    // ── 0.45 – 0.90 · zoom e deriva da grelha ───────────────────────────
    timeline.fromTo(
      field,
      { scale: 1, xPercent: 0, yPercent: 0 },
      { scale: 1.3, xPercent: -3, yPercent: -7, duration: 0.45 },
      0.45
    );

    // ── 0.60 – 0.90 · véu ───────────────────────────────────────────────
    if (scrim) {
      timeline.fromTo(scrim, { opacity: 0 }, { opacity: 0.94, duration: 0.3 }, 0.6);
    }

    // ── 0.74 – 0.88 · cabeçalho sai de cena ─────────────────────────────
    if (head) {
      timeline.to(head, { opacity: 0, y: -28, duration: 0.14 }, 0.74);
    }

    // ── 0.88 – 0.98 · camada textual central ────────────────────────────
    timeline.fromTo(
      copy,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: 'power2.out' },
      0.88
    );

    return () => {
      block.removeAttribute('data-scene-ready');
      timeline.scrollTrigger?.kill();
      timeline.kill();
      gsap.set([field, head, scrim, copy, ...cards].filter(Boolean), { clearProps: 'all' });
      copy.removeAttribute('data-active');
    };
  });
}

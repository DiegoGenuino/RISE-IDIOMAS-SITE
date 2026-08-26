import { scrollToId, startScroll, stopScroll } from './smoothScroll';

/**
 * Navbar: estado "descolado do topo", painel mobile e scroll suave dos links.
 *
 * O estado de scroll usa IntersectionObserver sobre uma sentinela de 1px em vez
 * de um listener de scroll — zero trabalho na main thread enquanto se rola.
 * O painel é aberto por atributo; toda a animação (clip-path, stagger) vive no
 * CSS, portanto o JS não toca em geometria.
 */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.querySelector<HTMLElement>('[data-drawer]');

  // ── Estado "stuck" ────────────────────────────────────────────────────
  if (nav) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) nav.removeAttribute('data-stuck');
        else nav.setAttribute('data-stuck', '');
      },
      { threshold: 0 }
    ).observe(sentinel);
  }

  // ── Painel mobile ─────────────────────────────────────────────────────
  let isOpen = false;

  function openDrawer(): void {
    if (!drawer || !toggle || isOpen) return;
    isOpen = true;
    drawer.removeAttribute('inert');
    drawer.setAttribute('data-open', '');
    nav?.setAttribute('data-open', '');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    stopScroll();
  }

  function closeDrawer(): void {
    if (!drawer || !toggle || !isOpen) return;
    isOpen = false;
    drawer.removeAttribute('data-open');
    nav?.removeAttribute('data-open');
    // `inert` tira o painel da ordem de tabulação enquanto está recortado.
    drawer.setAttribute('inert', '');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    startScroll();
  }

  toggle?.addEventListener('click', () => (isOpen ? closeDrawer() : openDrawer()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      closeDrawer();
      toggle?.focus();
    }
  });

  // Voltar ao desktop com o painel aberto deixaria o scroll travado.
  window.matchMedia('(min-width: 940px)').addEventListener('change', (event) => {
    if (event.matches && isOpen) closeDrawer();
  });

  // ── Scroll suave nos alvos internos ───────────────────────────────────
  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-scroll-to]');
    if (!trigger) return;

    const id = trigger.dataset.scrollTo;
    if (!id) return;

    event.preventDefault();
    if (isOpen) closeDrawer();
    scrollToId(id);
  });
}

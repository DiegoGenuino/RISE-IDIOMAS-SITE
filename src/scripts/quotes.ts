/**
 * Slider de depoimentos.
 *
 * O JS faz três coisas e nada mais: marca qual painel está ativo, diz em que
 * sentido a navegação foi, e posiciona o indicador. Toda a coreografia —
 * crossfade, deslize direcional e a cascata dentro do painel — vive no CSS.
 */
export function initQuotes(): void {
  const root = document.querySelector<HTMLElement>('[data-quotes]');
  if (!root) return;

  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-quote]'));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-quote-tab]'));
  const strip = root.querySelector<HTMLElement>('.ds-quote-tabs');
  const indicator = root.querySelector<HTMLElement>('[data-quote-indicator]');
  if (panels.length === 0) return;

  let index = 0;

  /** Mantém a aba ativa à vista mexendo só no scroll horizontal da tira. */
  function keepTabVisible(tab: HTMLElement): void {
    if (!strip) return;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;

    if (left < strip.scrollLeft) {
      strip.scrollTo({ left: left - 16, behavior: 'smooth' });
    } else if (right > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: right - strip.clientWidth + 16, behavior: 'smooth' });
    }
  }

  function placeIndicator(tab: HTMLElement): void {
    if (!indicator || !strip) return;
    indicator.style.setProperty('--ind-w', `${tab.offsetWidth}px`);
    indicator.style.setProperty('--ind-x', `${tab.offsetLeft}px`);
    strip.dataset.ready = 'true';
  }

  function show(next: number, options: { animate?: boolean } = {}): void {
    const { animate = true } = options;
    const total = panels.length;
    const target = (next + total) % total;

    // Sentido do movimento, com a volta ao início a contar como "avançar".
    const forward = (target - index + total) % total <= total / 2;
    root!.dataset.dir = forward ? 'next' : 'prev';

    index = target;

    for (const panel of panels) {
      const active = Number(panel.dataset.quote) === index;
      if (active) panel.setAttribute('data-active', '');
      else panel.removeAttribute('data-active');
      panel.setAttribute('aria-hidden', String(!active));
    }

    for (const tab of tabs) {
      const active = Number(tab.dataset.quoteTab) === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (!active) continue;

      placeIndicator(tab);
      if (animate) keepTabVisible(tab);
    }
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => show(Number(tab.dataset.quoteTab)));
  }

  root
    .querySelector<HTMLButtonElement>('[data-quote-prev]')
    ?.addEventListener('click', () => show(index - 1));
  root
    .querySelector<HTMLButtonElement>('[data-quote-next]')
    ?.addEventListener('click', () => show(index + 1));

  root.querySelector('[role="tablist"]')?.addEventListener('keydown', (event) => {
    const key = (event as KeyboardEvent).key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
    event.preventDefault();
    show(index + (key === 'ArrowRight' ? 1 : -1));
    tabs[index]?.focus();
  });

  // Estado inicial sem mexer em scroll nenhum.
  show(0, { animate: false });

  // O indicador é medido em pixels: reposicionar quando a tira muda de largura
  // ou quando a fonte real substitui a de fallback.
  const reposition = () => {
    const active = tabs[index];
    if (active) placeIndicator(active);
  };

  if (strip) new ResizeObserver(reposition).observe(strip);
  if (document.fonts?.ready) void document.fonts.ready.then(reposition);
}

/**
 * Metodologia — abas.
 *
 * O JS marca o passo ativo e mede onde pôr o indicador. O resto — o indicador
 * a viajar entre os passos e a cascata dentro do painel — é CSS.
 */
export function initMethodology(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-step]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]'));
  const thumb = document.querySelector<HTMLElement>('[data-tab-thumb]');
  const list = tabs[0]?.closest<HTMLElement>('[role="tablist"]');
  if (tabs.length === 0 || panels.length === 0) return;

  let index = 0;

  function placeThumb(tab: HTMLElement): void {
    if (!thumb || !list) return;
    thumb.style.setProperty('--thumb-h', `${tab.offsetHeight}px`);
    thumb.style.setProperty('--thumb-y', `${tab.offsetTop}px`);
    list.dataset.ready = 'true';
  }

  function show(next: number): void {
    index = (next + tabs.length) % tabs.length;

    for (const tab of tabs) {
      const active = Number(tab.dataset.step) === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) placeThumb(tab);
    }

    for (const panel of panels) {
      const active = Number(panel.dataset.panel) === index;
      if (active) panel.setAttribute('data-active', '');
      else panel.removeAttribute('data-active');
      panel.setAttribute('aria-hidden', String(!active));
    }
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => show(Number(tab.dataset.step)));
  }

  list?.addEventListener('keydown', (event) => {
    const key = (event as KeyboardEvent).key;
    if (key !== 'ArrowDown' && key !== 'ArrowUp') return;
    event.preventDefault();
    show(index + (key === 'ArrowDown' ? 1 : -1));
    tabs[index]?.focus();
  });

  show(0);

  // O indicador é medido em pixels: reposicionar quando a coluna muda de
  // largura (os rótulos podem passar a ocupar duas linhas) ou quando a fonte
  // real substitui a de fallback.
  const reposition = () => {
    const active = tabs[index];
    if (active) placeThumb(active);
  };

  if (list) new ResizeObserver(reposition).observe(list);
  if (document.fonts?.ready) void document.fonts.ready.then(reposition);
}

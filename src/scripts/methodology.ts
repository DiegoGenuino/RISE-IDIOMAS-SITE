/**
 * Metodologia — abas.
 *
 * A versão anterior tentava adivinhar o passo ativo a partir do scroll, e o
 * indicador saltava sempre que dois cartões entravam na faixa de leitura ao
 * mesmo tempo. Aqui o estado é o que o utilizador escolheu: nada a inferir,
 * nada a piscar.
 */
export function initMethodology(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-step]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]'));
  if (tabs.length === 0 || panels.length === 0) return;

  let index = 0;

  function show(next: number): void {
    index = (next + tabs.length) % tabs.length;

    for (const tab of tabs) {
      const active = Number(tab.dataset.step) === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
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

  tabs[0]?.parentElement?.addEventListener('keydown', (event) => {
    const key = (event as KeyboardEvent).key;
    if (key !== 'ArrowDown' && key !== 'ArrowUp') return;
    event.preventDefault();
    show(index + (key === 'ArrowDown' ? 1 : -1));
    tabs[index]?.focus();
  });

  show(0);
}

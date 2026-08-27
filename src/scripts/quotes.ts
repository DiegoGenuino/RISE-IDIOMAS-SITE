/**
 * Slider de depoimentos.
 *
 * O crossfade vive todo no CSS; aqui só se move o atributo `data-active` e o
 * `aria-selected`. Nada é medido nem re-renderizado, portanto a troca custa
 * uma transição de opacidade e nada mais.
 */
export function initQuotes(): void {
  const root = document.querySelector<HTMLElement>('[data-quotes]');
  if (!root) return;

  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-quote]'));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-quote-tab]'));
  if (panels.length === 0) return;

  const strip = root.querySelector<HTMLElement>('.ds-quote-tabs');
  let index = 0;

  /**
   * Traz a aba ativa à vista mexendo apenas no scroll horizontal da própria
   * tira. `scrollIntoView` seria mais curto, mas rola todos os antepassados
   * — incluindo a página — e no arranque atirava a home para o meio do
   * documento antes de o utilizador tocar em nada.
   */
  function keepTabVisible(tab: HTMLElement): void {
    if (!strip) return;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    const viewLeft = strip.scrollLeft;
    const viewRight = viewLeft + strip.clientWidth;

    if (left < viewLeft) strip.scrollTo({ left: left - 16, behavior: 'smooth' });
    else if (right > viewRight) {
      strip.scrollTo({ left: right - strip.clientWidth + 16, behavior: 'smooth' });
    }
  }

  function show(next: number, moveFocusIntoView = true): void {
    index = (next + panels.length) % panels.length;

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
      if (active && moveFocusIntoView) keepTabVisible(tab);
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

  // Setas do teclado dentro do tablist
  root.querySelector('[role="tablist"]')?.addEventListener('keydown', (event) => {
    const key = (event as KeyboardEvent).key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
    event.preventDefault();
    show(index + (key === 'ArrowRight' ? 1 : -1));
    tabs[index]?.focus();
  });

  // Estado inicial sem mexer em scroll nenhum.
  show(0, false);
}

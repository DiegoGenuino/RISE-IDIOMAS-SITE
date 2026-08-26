/**
 * Alternador mensal/anual.
 * Os dois valores já estão no HTML — o clique só troca um atributo no container
 * e o CSS resolve a visibilidade. Nada é recalculado nem re-renderizado.
 */
export function initPricing(): void {
  const matrix = document.querySelector<HTMLElement>('[data-pricing]');
  const options = document.querySelectorAll<HTMLButtonElement>('[data-cycle-option]');
  if (!matrix || options.length === 0) return;

  for (const option of options) {
    option.addEventListener('click', () => {
      const cycle = option.dataset.cycleOption;
      if (!cycle || matrix.dataset.cycle === cycle) return;

      matrix.dataset.cycle = cycle;
      for (const other of options) {
        other.setAttribute('aria-checked', String(other === option));
      }
    });
  }
}

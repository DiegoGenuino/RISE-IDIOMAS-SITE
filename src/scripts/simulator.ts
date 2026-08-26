/**
 * Janela de simulação do hero: alternância de painéis + revelação do transcript.
 * Estado local ao componente, sem tocar em nada fora da própria janela.
 */
export function initSimulator(): void {
  const sim = document.querySelector<HTMLElement>('[data-sim]');
  if (!sim) return;

  const tabs = Array.from(sim.querySelectorAll<HTMLButtonElement>('[data-sim-tab]'));
  const panes = Array.from(sim.querySelectorAll<HTMLElement>('[data-sim-pane]'));

  function activate(name: string): void {
    for (const tab of tabs) {
      const selected = tab.dataset.simTab === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const pane of panes) {
      pane.hidden = pane.dataset.simPane !== name;
    }
    if (name === 'live') sim!.setAttribute('data-played', '');
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => activate(tab.dataset.simTab!));
  }

  // Passa sozinho para a sessão ao vivo quando o hero está visível — uma vez.
  // Sem loop: depois de reproduzido, o observer desliga-se.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      window.setTimeout(() => activate('live'), reduced ? 0 : 2200);
    },
    { threshold: 0.35 }
  );

  observer.observe(sim);
}

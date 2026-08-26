/**
 * Holofote que segue o cursor sobre grelhas de cartões.
 *
 * Um único listener por container — nunca um por cartão — e as coordenadas são
 * escritas em custom properties, que o CSS consome num radial-gradient. Não há
 * leitura de layout no handler: `getBoundingClientRect` do cartão é lido dentro
 * de um rAF e só quando o ponteiro se move, e nada é escrito no DOM além de
 * duas propriedades.
 */
export function initSpotlight(): void {
  // Só faz sentido onde existe ponteiro fino; em toque é peso morto.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const containers = document.querySelectorAll<HTMLElement>('[data-spotlight]');
  if (containers.length === 0) return;

  for (const container of containers) {
    let frame = 0;

    container.addEventListener(
      'pointermove',
      (event) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const card = (event.target as HTMLElement).closest<HTMLElement>(
            '.ds-card, .ds-bento-tile'
          );
          if (!card) return;

          const box = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${event.clientX - box.left}px`);
          card.style.setProperty('--my', `${event.clientY - box.top}px`);
        });
      },
      { passive: true }
    );
  }
}

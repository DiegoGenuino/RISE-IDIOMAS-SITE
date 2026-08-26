import { startScroll, stopScroll } from './smoothScroll';

/**
 * Modais de modalidade sobre <dialog> nativo.
 * O elemento nativo já entrega foco preso, fecho por Escape e camada de topo —
 * só falta congelar o scroll de fundo (que é sintético, via Lenis).
 */
export function initModals(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const opener = target.closest<HTMLElement>('[data-open-modal]');
    if (opener) {
      const dialog = document.getElementById(`curso-${opener.dataset.openModal}`);
      if (dialog instanceof HTMLDialogElement) {
        dialog.showModal();
        stopScroll();
      }
      return;
    }

    const closer = target.closest<HTMLElement>('[data-close-modal]');
    if (closer) {
      closer.closest('dialog')?.close();
      return;
    }

    // Clique fora do cartão fecha — o <dialog> em si ocupa só a área do cartão,
    // por isso o alvo ser o próprio dialog significa que foi no backdrop.
    if (target instanceof HTMLDialogElement && target.open) {
      target.close();
    }
  });

  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('close', startScroll);
  }
}

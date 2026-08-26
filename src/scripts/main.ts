import { initAudience } from './audience';
import { initModals } from './modals';
import { initNav } from './nav';
import { initPricing } from './pricing';
import { initReveal } from './reveal';
import { initSimulator } from './simulator';
import { initStickyGrid } from './stickyGrid';
import { initSmoothScroll } from './smoothScroll';

/**
 * Ponto de entrada da home.
 *
 * Ordem importa: o scroll suave tem de existir antes das cenas que dependem do
 * ScrollTrigger, e o seletor de perfil antes da revelação (troca de conteúdo
 * altera alturas e o observer precisa das medidas finais).
 */
export function initHome(): void {
  document.documentElement.classList.remove('no-js');

  initAudience();
  initSmoothScroll();
  initNav();
  initSimulator();
  initModals();
  initPricing();
  initStickyGrid();
  initReveal();
}

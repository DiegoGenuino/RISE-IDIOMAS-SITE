import { initAudience } from './audience';
import { initJourney } from './journey';
import { initMeshGradient } from './meshGradient';
import { initModals } from './modals';
import { initNav } from './nav';
import { initPricing } from './pricing';
import { initReveal } from './reveal';
import { initSimulator } from './simulator';
import { initSpotlight } from './spotlight';
import { initStickyGrid } from './stickyGrid';
import { initTextReveal } from './textReveal';
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
  initMeshGradient();
  initSmoothScroll();
  initNav();
  initSimulator();
  initModals();
  initPricing();
  initSpotlight();
  initStickyGrid();
  void initJourney();
  initReveal();
  void initTextReveal();
}

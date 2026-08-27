import { initAudience } from './audience';
import { initBurst } from './burst';
import { initMethodology } from './methodology';
import { initModals } from './modals';
import { initNav } from './nav';
import { initGlobe } from './globe';
import { initPricing } from './pricing';
import { initReveal } from './reveal';
import { initQuotes } from './quotes';
import { initSpotlight } from './spotlight';
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
  initSmoothScroll();
  initNav();
  initGlobe();
  initModals();
  initPricing();
  initSpotlight();
  initMethodology();
  initQuotes();
  initBurst();
  initReveal();
  void initTextReveal();
}

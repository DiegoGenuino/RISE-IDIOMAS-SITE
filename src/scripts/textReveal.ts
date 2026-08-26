/**
 * Revelação de títulos caractere a caractere (GSAP SplitText).
 *
 * Cada título entra desfocado e deslocado, e os caracteres resolvem em
 * cascata. O hero corre no load; os títulos de seção correm ao entrar na
 * viewport, uma vez só.
 *
 * Três cuidados que o exemplo de referência não tem:
 *
 *  1. `visibility: hidden` é armado por um script inline no <head>, com um
 *     failsafe de 2,5 s que o remove. Sem isso, qualquer falha no bundle
 *     deixaria os títulos permanentemente invisíveis.
 *  2. `aria: 'auto'` mantém o texto legível por leitores de ecrã — sem isso o
 *     título passa a ser uma sopa de <div> por caractere.
 *  3. O split é revertido no fim de cada animação: o `filter: blur()` por
 *     caractere é caro e não faz sentido continuar a existir depois de zerar.
 */

import type { gsap as GsapType } from 'gsap';

const ARMED = 'ds-split-armed';

declare global {
  interface Window {
    /** Posto pelo script inline do <head> quando o failsafe de 2,5 s dispara. */
    __riseSplitTimedOut?: boolean;
  }
}

type Gsap = typeof GsapType;

let gsapRef: Gsap | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SplitTextRef: any = null;

function isVisible(element: HTMLElement): boolean {
  return element.offsetParent !== null || element.getClientRects().length > 0;
}

/** Elementos que entram logo a seguir ao título, sem split. */
function followers(scope: HTMLElement): HTMLElement[] {
  const group = scope.closest<HTMLElement>('[data-split-group]') ?? scope.parentElement;
  if (!group) return [];
  return Array.from(group.querySelectorAll<HTMLElement>('[data-split-follow]'));
}

function animate(target: HTMLElement): void {
  if (!gsapRef || !SplitTextRef || target.dataset.splitDone === 'true') return;
  target.dataset.splitDone = 'true';

  const gsap = gsapRef;
  const isHero = target.dataset.split === 'hero';

  target.style.visibility = 'visible';

  const split = SplitTextRef.create(target, {
    type: 'chars',
    charsClass: 'ds-char',
    aria: 'auto',
  });

  const after = followers(target);

  // O custo de pintura do blur é proporcional ao raio ao quadrado; 12px já
  // entrega a leitura de "foco a resolver" a uma fração do preço de 18px.
  gsap.set(split.chars, {
    opacity: 0,
    filter: `blur(${isHero ? 12 : 9}px)`,
    yPercent: isHero ? 40 : 28,
  });

  if (after.length > 0) gsap.set(after, { opacity: 0, y: 10 });

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      window.clearTimeout(guard);
      // O blur por caractere já cumpriu o papel — devolver o DOM ao normal.
      gsap.set(split.chars, { clearProps: 'filter' });
      split.revert();
      target.style.visibility = '';
    },
  });

  // Rede de segurança: a timeline avança por requestAnimationFrame, e há
  // contextos onde o rAF não corre (aba em segundo plano no momento do load,
  // extensões que o bloqueiam, browsers embutidos). Nesses casos o título
  // ficaria preso a opacidade zero — o que é pior do que não animar de todo.
  const guard = window.setTimeout(() => {
    if (timeline.progress() < 1) timeline.progress(1);
  }, 4000);

  timeline.to(split.chars, {
    opacity: 1,
    filter: 'blur(0px)',
    yPercent: 0,
    duration: isHero ? 0.9 : 0.7,
    stagger: 0.015,
  });

  if (after.length > 0) {
    timeline.to(after, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.5');
  }
}

export async function initTextReveal(): Promise<void> {
  const root = document.documentElement;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.remove(ARMED);
    return;
  }

  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-split]'));
  if (targets.length === 0) {
    root.classList.remove(ARMED);
    return;
  }

  try {
    const [gsapMod, splitMod] = await Promise.all([import('gsap'), import('gsap/SplitText')]);

    gsapRef = gsapMod.gsap;
    SplitTextRef = splitMod.SplitText;
    gsapRef.registerPlugin(SplitTextRef);
  } catch {
    // Sem GSAP não há animação — mas o texto tem de aparecer.
    root.classList.remove(ARMED);
    return;
  }

  // A classe sai agora: daqui em diante quem controla a visibilidade é o GSAP,
  // elemento a elemento, e não mais a regra global do <head>.
  root.classList.remove(ARMED);
  for (const target of targets) {
    if (target.dataset.split !== 'hero') target.style.visibility = 'hidden';
  }

  // Se o failsafe já revelou os títulos, animar agora seria pior do que não
  // animar: o utilizador veria o texto desaparecer e voltar.
  const tooLate = window.__riseSplitTimedOut === true;

  const hero = targets.filter((target) => target.dataset.split === 'hero' && isVisible(target));
  if (!tooLate) {
    for (const target of hero) animate(target);
  } else {
    for (const target of hero) target.dataset.splitDone = 'true';
  }

  const scoped = targets.filter((target) => target.dataset.split !== 'hero');

  // IntersectionObserver em vez de ScrollTrigger: um título que aparece não
  // depende do ciclo de refresh do ScrollTrigger nem de o GSAP estar a tickar,
  // e dispensa carregar o plugin só por causa disto.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        animate(entry.target as HTMLElement);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
  );

  for (const target of scoped) observer.observe(target);

  // Rede de segurança: qualquer título que já devia estar visível e continua
  // escondido passados 5 s é revelado sem animação. Um título invisível é um
  // defeito; um título sem animação é apenas menos bonito.
  window.setTimeout(() => {
    for (const target of scoped) {
      if (target.dataset.splitDone === 'true') continue;
      if (target.getBoundingClientRect().top > window.innerHeight * 1.5) continue;
      observer.unobserve(target);
      target.style.visibility = '';
      target.dataset.splitDone = 'true';
    }
  }, 5000);

  // A troca de perfil revela um título diferente — vale reanimar.
  window.addEventListener('rise:audiencechange', () => {
    for (const target of targets) {
      if (target.dataset.split !== 'hero') continue;
      if (!isVisible(target)) continue;
      target.dataset.splitDone = '';
      animate(target);
    }
  });
}

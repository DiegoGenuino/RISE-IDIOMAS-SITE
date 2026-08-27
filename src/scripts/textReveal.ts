/**
 * Revelação de títulos caractere a caractere (GSAP SplitText).
 *
 * Os títulos nascem `visibility: hidden` por CSS estático — nunca chegam a ser
 * pintados antes do split. Quem os revela é o próprio `animate()`, ao marcar
 * `data-split-done`, que é o atributo que desliga a regra. Não há classe armada
 * por JS nem script no <head>: o estado inicial é do CSS, e o GSAP só o levanta.
 *
 * A regra em global.css já cobre sozinha os casos em que não deve haver
 * animação nenhuma (sem JS, `prefers-reduced-motion`), portanto aqui só é
 * preciso tratar a falha do GSAP.
 */

import type { gsap as GsapType } from 'gsap';

/** Posta em <html> quando o GSAP não vem — desliga a regra de esconder. */
const OFF = 'ds-split-off';

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

  const gsap = gsapRef;
  const isHero = target.dataset.split === 'hero';

  // Este atributo é o que revela o elemento: desliga a regra de CSS que o
  // mantinha invisível. Tudo o que vem a seguir corre na mesma tarefa, sem
  // paint pelo meio, portanto o texto nunca aparece por inteiro antes do split.
  target.dataset.splitDone = 'true';

  const split = SplitTextRef.create(target, {
    type: 'chars',
    charsClass: 'ds-char',
    aria: 'auto',
  });

  const after = followers(target);

  // O custo de pintura do blur cresce com o raio; 12px já entrega a leitura de
  // "foco a resolver" a uma fração do preço de 18px.
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
    },
  });

  // A timeline avança por requestAnimationFrame, e há contextos onde o rAF não
  // corre (aba em segundo plano no load, extensões que o bloqueiam, browsers
  // embutidos). Aí os caracteres ficariam a opacidade zero dentro de um título
  // já revelado — pior do que não animar de todo.
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

  try {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-split]'));
    if (targets.length === 0) return;

    // Com movimento reduzido a regra de CSS nem chega a aplicar-se: os títulos
    // já estão visíveis e não há nada a animar.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const [gsapMod, splitMod] = await Promise.all([import('gsap'), import('gsap/SplitText')]);

    gsapRef = gsapMod.gsap;
    SplitTextRef = splitMod.SplitText;
    gsapRef.registerPlugin(SplitTextRef);

    // O hero anima no load; os restantes esperam entrar na viewport.
    for (const target of targets) {
      if (target.dataset.split === 'hero' && isVisible(target)) animate(target);
    }

    const scoped = targets.filter((target) => target.dataset.split !== 'hero');

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

    // A troca de perfil revela um título diferente — vale reanimar.
    window.addEventListener('rise:audiencechange', () => {
      for (const target of targets) {
        if (target.dataset.split !== 'hero' || !isVisible(target)) continue;
        target.dataset.splitDone = '';
        animate(target);
      }
    });
  } catch {
    // Sem GSAP não há animação — mas o texto tem de aparecer.
    root.classList.add(OFF);
  }
}

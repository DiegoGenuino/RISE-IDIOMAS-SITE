import createGlobe from 'cobe';

/**
 * Globo terrestre do hero (cobe, ~5 KB gzip).
 *
 * Geometria real dos continentes amostrada em pontos, com iluminação difusa e
 * rotação contínua. Escolhido em vez de three.js por uma questão de proporção:
 * um globo com textura fotográfica exigiria a biblioteca (~600 KB) mais os
 * mapas de textura (~1 MB) — cerca de 300× o peso, para um elemento decorativo.
 *
 * A versão anterior era uma esfera quase branca com `mapBrightness: 5.2`: os
 * pontos dos continentes saturavam para branco por cima de uma base clara e o
 * globo lia-se como uma bola lisa. Aqui a base é escura (brand-900) e os
 * pontos claros — o contraste é o que faz os continentes existirem.
 *
 * Marcadores nos três lugares que a página já menciona: a escola, e as duas
 * instituições certificadoras.
 */

const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [-23.5405, -46.5486], size: 0.1 }, // Vila Carrão, São Paulo
  { location: [52.2053, 0.1218], size: 0.06 }, // Cambridge
  { location: [42.2808, -83.743], size: 0.06 }, // Michigan (Ann Arbor)
];

/** Rotação base, em radianos por frame (~26 s por volta a 60 fps). */
const SPIN = 0.004;

function rgb(value: string, fallback: [number, number, number]): [number, number, number] {
  const parts = value.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return fallback;
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export function initGlobe(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-globe]');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Estado mantido entre recriações: trocar de perfil não devolve o globo ao
  // meridiano inicial, continua de onde estava.
  let phi = 4.1; // começa com o Atlântico de frente — Brasil visível
  const theta = 0.24;
  let width = Math.max(1, canvas.clientWidth);

  let pointerStart: number | null = null;
  let dragOffset = 0;
  let dragTarget = 0;
  let globe: { destroy(): void } | null = null;

  function palette() {
    const styles = getComputedStyle(canvas!);
    return {
      base: rgb(styles.getPropertyValue('--globe-base').trim(), [0.11, 0.12, 0.33]),
      marker: rgb(styles.getPropertyValue('--globe-marker').trim(), [1, 1, 1]),
      glow: rgb(styles.getPropertyValue('--globe-glow').trim(), [0.72, 0.74, 0.99]),
    };
  }

  function create(): void {
    const colors = palette();

    globe = createGlobe(canvas!, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: width * 2,
      height: width * 2,
      phi,
      theta,
      dark: 0,
      diffuse: 1.25,
      mapSamples: 22000,
      // `dark: 0` mantém a esfera inteira iluminada — com `dark: 1` o lado
      // que não apanha a luz fica preto e o globo lê-se como um disco. Os
      // pontos do mapa são a base multiplicada por `mapBrightness`: base
      // escura × 4 dá continentes claros sobre azul-marinho.
      mapBrightness: 4,
      baseColor: colors.base,
      markerColor: colors.marker,
      glowColor: colors.glow,
      markers: MARKERS,
      onRender: (state: Record<string, unknown>) => {
        // Loop contínuo: o globo nunca para, o arrasto só o adianta ou atrasa.
        if (!reduced) phi += SPIN;

        // Aproxima o offset do alvo a cada frame: solta o arrasto e ele
        // desacelera sozinho em vez de parar a seco.
        dragOffset += (dragTarget - dragOffset) * 0.08;

        state.phi = phi + dragOffset;
        state.theta = theta;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    canvas!.dataset.globeReady = 'true';
  }

  create();

  // ── Redimensionamento ────────────────────────────────────────────────
  new ResizeObserver(() => {
    width = Math.max(1, canvas.clientWidth);
  }).observe(canvas);

  // ── Arrasto ──────────────────────────────────────────────────────────
  canvas.addEventListener('pointerdown', (event) => {
    pointerStart = event.clientX - dragTarget * 200;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  });

  const release = () => {
    pointerStart = null;
    canvas.style.cursor = 'grab';
  };

  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  canvas.addEventListener('pointermove', (event) => {
    if (pointerStart === null) return;
    dragTarget = (event.clientX - pointerStart) / 200;
  });

  // ── Paleta reativa ao perfil ─────────────────────────────────────────
  // cobe não expõe setter de cor: recriar é mais barato do que manter um
  // segundo globo em memória. Só o contexto WebGL é refeito — os listeners
  // acima ficam onde estão, senão acumulariam um jogo por clique.
  window.addEventListener('rise:audiencechange', () => {
    globe?.destroy();
    create();
  });
}

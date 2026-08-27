import createGlobe from 'cobe';

/**
 * Globo terrestre do hero (cobe, ~5 KB gzip).
 *
 * Geometria real dos continentes amostrada em pontos, com iluminação difusa e
 * rotação contínua. Escolhido em vez de three.js por uma questão de proporção:
 * um globo com textura fotográfica exigiria a biblioteca (~600 KB) mais os
 * mapas de textura (~1 MB) — cerca de 300× o peso, para um elemento decorativo.
 *
 * Marcadores nos três lugares que a página já menciona: a escola, e as duas
 * instituições certificadoras.
 */

const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [-23.5405, -46.5486], size: 0.09 }, // Vila Carrão, São Paulo
  { location: [52.2053, 0.1218], size: 0.055 }, // Cambridge
  { location: [42.2808, -83.743], size: 0.055 }, // Michigan (Ann Arbor)
];

function rgb(value: string, fallback: [number, number, number]): [number, number, number] {
  const parts = value.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return fallback;
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export function initGlobe(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-globe]');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let phi = 4.1; // começa com o Atlântico de frente — Brasil visível
  const theta = 0.22;
  let width = 0;

  // Arrasto: a rotação ganha um empurrão e volta sozinha ao ritmo base.
  let pointerStart: number | null = null;
  let dragOffset = 0;
  let dragTarget = 0;

  function palette() {
    const styles = getComputedStyle(canvas!);
    return {
      base: rgb(styles.getPropertyValue('--globe-base').trim(), [0.86, 0.88, 0.96]),
      marker: rgb(styles.getPropertyValue('--globe-marker').trim(), [0.33, 0.23, 0.99]),
      glow: rgb(styles.getPropertyValue('--globe-glow').trim(), [0.96, 0.96, 1]),
    };
  }

  let colors = palette();

  function measure(): number {
    return Math.max(1, canvas!.clientWidth);
  }

  width = measure();

  const globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width: width * 2,
    height: width * 2,
    phi,
    theta,
    dark: 0,
    diffuse: 1.2,
    mapSamples: 20000,
    // Valores próximos do exemplo claro do cobe, com a base apenas tingida de
    // marca. Nota: o renderizador por software do Chrome headless não amostra
    // a textura do mapa, portanto os continentes não podem ser conferidos por
    // screenshot aqui — só numa GPU real. Se ficarem fracos, é este número
    // que se mexe (mais alto = continentes mais claros).
    mapBrightness: 5.2,
    baseColor: colors.base,
    markerColor: colors.marker,
    glowColor: colors.glow,
    markers: MARKERS,
    onRender: (state: Record<string, unknown>) => {
      if (!reduced) phi += 0.0032;

      // Aproxima o offset do alvo a cada frame: solta o arrasto e ele
      // desacelera sozinho em vez de parar a seco.
      dragOffset += (dragTarget - dragOffset) * 0.08;

      state.phi = phi + dragOffset;
      state.theta = theta;
      state.width = width * 2;
      state.height = width * 2;
    },
  });

  // ── Redimensionamento ────────────────────────────────────────────────
  new ResizeObserver(() => {
    width = measure();
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
  canvas.addEventListener('pointerout', release);

  canvas.addEventListener('pointermove', (event) => {
    if (pointerStart === null) return;
    dragTarget = (event.clientX - pointerStart) / 200;
  });

  // ── Paleta reativa ao perfil ─────────────────────────────────────────
  window.addEventListener('rise:audiencechange', () => {
    colors = palette();
    // cobe não expõe setter de cor: recriar é mais barato do que manter
    // um segundo globo em memória, e acontece uma vez por clique.
    globe.destroy();
    initGlobe();
  });

  // Uma vez pintado, deixa de haver risco de salto de layout.
  canvas.dataset.globeReady = 'true';
}

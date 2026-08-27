/**
 * Algas de luz — o objeto animado da seção "alcance".
 *
 * Antes era um leque de raios retos a partir de um ponto único: todos partiam
 * juntos e baloiçavam juntos, o que se lia como um só objeto rígido. Aqui cada
 * fio é independente — tem a sua própria base, direção, ritmo e ondulação — e
 * o conjunto move-se como uma moita debaixo de água.
 *
 * Canvas 2D e não three.js: são curvas de uma cor só, e a biblioteca custaria
 * ~600 KB para desenhar isso.
 *
 * O rAF pausa fora da viewport e com `prefers-reduced-motion` desenha-se um
 * único frame estático — a forma continua lá, só não respira.
 */

interface Strand {
  /** Base ao longo do fundo, em fração da largura. */
  x: number;
  /** Direção de partida, em radianos (−π/2 é a vertical). */
  angle: number;
  /** Comprimento, em fração do alcance da cena. */
  length: number;
  /** Curvatura constante: é o que dá o arco em vez da linha reta. */
  curl: number;
  /** Amplitude e ritmo da ondulação — próprios de cada fio. */
  sway: number;
  speed: number;
  phase: number;
  /** Comprimento de onda ao longo do fio: quantas curvas cabem nele. */
  wave: number;
  width: number;
  alpha: number;
}

const STRAND_COUNT = 64;
const SEGMENTS = 16;

function buildStrands(): Strand[] {
  const strands: Strand[] = [];

  for (let i = 0; i < STRAND_COUNT; i++) {
    const t = i / (STRAND_COUNT - 1);
    // Base espalhada por toda a largura, com um empurrão para o centro: é o
    // que faz a moita ter um corpo em vez de uma fila.
    const x = 0.5 + (t - 0.5) * (0.55 + Math.random() * 0.45);
    // Sobem quase a direito, abrindo em leque à medida que se afastam do meio.
    const fan = (x - 0.5) * 1.5;
    const angle = -Math.PI / 2 + fan + (Math.random() - 0.5) * 0.35;
    // Os do centro são mais compridos — a silhueta fica em cúpula.
    const centerBias = 1 - Math.abs(x - 0.5) * 1.1;

    strands.push({
      x,
      angle,
      length: (0.45 + centerBias * 0.55) * (0.75 + Math.random() * 0.4),
      curl: (Math.random() - 0.5) * 0.055,
      sway: 0.1 + Math.random() * 0.16,
      // Ritmos irracionais entre si: nenhum par de fios volta a sincronizar.
      speed: 0.16 + Math.random() * 0.42,
      phase: Math.random() * Math.PI * 2,
      wave: 0.5 + Math.random() * 1.1,
      width: Math.random() < 0.18 ? 1.8 : 0.85,
      alpha: 0.45 + Math.random() * 0.55,
    });
  }

  return strands;
}

export function initBurst(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-burst]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const strands = buildStrands();

  let width = 0;
  let height = 0;
  let tint = '255, 255, 255';

  function readTint(): void {
    const raw = getComputedStyle(canvas!).getPropertyValue('--burst-rgb').trim();
    if (raw) tint = raw;
  }

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas!.clientWidth;
    height = canvas!.clientHeight;
    canvas!.width = Math.max(1, Math.round(width * dpr));
    canvas!.height = Math.max(1, Math.round(height * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(time: number): void {
    ctx!.clearRect(0, 0, width, height);
    // Aditivo: onde os fios se cruzam a luz soma, sem ser preciso desenhar
    // brilho nenhum por cima.
    ctx!.globalCompositeOperation = 'lighter';
    ctx!.lineCap = 'round';

    // Só a altura manda no comprimento. Com um termo em largura, num ecrã
    // estreito os fios encolhiam para um terço e a cena virava relva.
    const reach = height * 0.9;

    for (const strand of strands) {
      const ox = strand.x * width;
      const oy = height;
      const total = reach * strand.length;
      const step = total / SEGMENTS;

      let x = ox;
      let y = oy;

      const gradient = ctx!.createLinearGradient(ox, oy, ox, oy - total);
      gradient.addColorStop(0, `rgba(${tint}, 0)`);
      gradient.addColorStop(0.22, `rgba(${tint}, ${0.5 * strand.alpha})`);
      gradient.addColorStop(0.65, `rgba(${tint}, ${0.85 * strand.alpha})`);
      gradient.addColorStop(1, `rgba(${tint}, 0)`);

      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = strand.width;
      ctx!.beginPath();
      ctx!.moveTo(x, y);

      for (let s = 1; s <= SEGMENTS; s++) {
        const along = s / SEGMENTS;
        // A ondulação cresce da base para a ponta: a raiz fica presa e a
        // ponta chicoteia, como uma alga presa ao fundo.
        const wobble =
          Math.sin(time * strand.speed + strand.phase + along * strand.wave * Math.PI * 2) *
          strand.sway *
          along ** 1.6;

        const angle = strand.angle + strand.curl * s + wobble;
        x += Math.cos(angle) * step;
        y += Math.sin(angle) * step;
        ctx!.lineTo(x, y);
      }

      ctx!.stroke();

      // Ponto na ponta — dá a leitura de organismo e não de risco.
      ctx!.fillStyle = `rgba(${tint}, ${0.5 * strand.alpha})`;
      ctx!.beginPath();
      ctx!.arc(x, y, strand.width * 1.3, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  let running = false;
  let rafId = 0;
  let started = 0;

  function frame(now: number): void {
    if (!running) return;
    draw((now - started) / 1000);
    rafId = requestAnimationFrame(frame);
  }

  function play(): void {
    if (running || reduced) return;
    running = true;
    started = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function pause(): void {
    running = false;
    cancelAnimationFrame(rafId);
  }

  readTint();
  resize();
  draw(0);

  new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()), {
    threshold: 0,
  }).observe(canvas);

  new ResizeObserver(() => {
    resize();
    if (!running) draw(0);
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });

  // As abas trocam a cor do feixe através de uma custom property no canvas.
  document.addEventListener('click', (event) => {
    const tab = (event.target as HTMLElement).closest<HTMLElement>('[data-burst-tab]');
    if (!tab) return;

    const group = tab.closest('[data-burst-tabs]');
    for (const other of group?.querySelectorAll<HTMLElement>('[data-burst-tab]') ?? []) {
      other.setAttribute('aria-selected', String(other === tab));
    }

    canvas.dataset.burstTint = tab.dataset.burstTab ?? '';
    readTint();
    if (!running) draw(0);
  });
}

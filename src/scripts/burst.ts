/**
 * Explosão radial animada — o objeto da seção "alcance".
 *
 * Canvas 2D e não three.js: o visual é um feixe de linhas a partir de um
 * ponto, e three.js custaria ~600 KB para desenhar o que aqui são umas
 * dezenas de linhas. Tudo o que se anima é o ângulo e o comprimento.
 *
 * O rAF pausa fora da viewport e com `prefers-reduced-motion` desenha-se um
 * único frame estático — a forma continua lá, só não respira.
 */

interface Ray {
  angle: number;
  length: number;
  speed: number;
  phase: number;
  dots: number[];
  width: number;
}

const RAY_COUNT = 210;

function buildRays(): Ray[] {
  const rays: Ray[] = [];
  for (let i = 0; i < RAY_COUNT; i++) {
    // Distribuição num leque de ~200°, mais densa ao centro: é o que dá a
    // silhueta de explosão em vez de um círculo uniforme.
    const t = i / (RAY_COUNT - 1);
    const spread = Math.PI * 1.12;
    const bias = Math.sin(t * Math.PI) ** 0.55;
    const angle = -Math.PI / 2 - spread / 2 + t * spread;

    const dots: number[] = [];
    const dotCount = 1 + Math.floor(Math.random() * 3);
    for (let d = 0; d < dotCount; d++) dots.push(0.35 + Math.random() * 0.6);

    rays.push({
      angle,
      length: (0.45 + bias * 0.55) * (0.72 + Math.random() * 0.38),
      speed: 0.06 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      dots,
      width: Math.random() < 0.22 ? 1.9 : 0.9,
    });
  }
  return rays;
}

export function initBurst(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-burst]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rays = buildRays();

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
    // Aditivo: onde os raios se cruzam a luz soma, e o núcleo do feixe fica
    // branco sem ser preciso desenhar um brilho por cima.
    ctx!.globalCompositeOperation = 'lighter';

    // Origem no fundo, ao centro: as linhas sobem como um feixe.
    const ox = width / 2;
    const oy = height * 1.02;
    const reach = Math.min(width * 0.68, height * 1.55);

    for (const ray of rays) {
      const breathe = Math.sin(time * ray.speed + ray.phase) * 0.08;
      const len = reach * ray.length * (1 + breathe);
      const angle = ray.angle + Math.sin(time * 0.08 + ray.phase) * 0.012;

      const x = ox + Math.cos(angle) * len;
      const y = oy + Math.sin(angle) * len;

      const gradient = ctx!.createLinearGradient(ox, oy, x, y);
      gradient.addColorStop(0, `rgba(${tint}, 1)`);
      gradient.addColorStop(0.3, `rgba(${tint}, 0.55)`);
      gradient.addColorStop(0.7, `rgba(${tint}, 0.18)`);
      gradient.addColorStop(1, `rgba(${tint}, 0)`);

      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = ray.width;
      ctx!.beginPath();
      ctx!.moveTo(ox, oy);
      ctx!.lineTo(x, y);
      ctx!.stroke();

      // Nós ao longo do raio — é o que dá a leitura de "rede" e não de leque
      for (const at of ray.dots) {
        const dx = ox + Math.cos(angle) * len * at;
        const dy = oy + Math.sin(angle) * len * at;
        ctx!.fillStyle = `rgba(${tint}, ${0.75 * (1 - at)})`;
        ctx!.beginPath();
        ctx!.arc(dx, dy, ray.width * 1.1, 0, Math.PI * 2);
        ctx!.fill();
      }
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

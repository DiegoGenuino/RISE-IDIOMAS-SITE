/**
 * Esfera de conexões do hero — canvas 2D.
 *
 * Pontos distribuídos por espiral de Fibonacci sobre uma esfera, rodados em
 * torno de Y com uma oscilação em X, e ligados por linhas quando ficam
 * próximos na projeção. A profundidade controla opacidade e raio, o que dá o
 * volume sem precisar de 3D a sério.
 *
 * Deliberadamente diferente do feixe da seção "alcance": lá é um leque a
 * partir de um ponto, aqui é um corpo que roda. A linguagem visual é a mesma —
 * linhas finas, nós e composição aditiva — mas não se repete.
 */

interface Point {
  x: number;
  y: number;
  z: number;
}

const COUNT = 130;
/** Distância máxima (em fração do raio) para dois nós se ligarem. */
const LINK_DIST = 0.46;

function fibonacciSphere(n: number): Point[] {
  const points: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }

  return points;
}

export function initOrbit(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-orbit]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const points = fibonacciSphere(COUNT);

  let width = 0;
  let height = 0;
  let core = '127, 125, 252';
  let edge = '69, 209, 255';

  function readPalette(): void {
    const styles = getComputedStyle(canvas!);
    core = styles.getPropertyValue('--orbit-core').trim() || core;
    edge = styles.getPropertyValue('--orbit-edge').trim() || edge;
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
    ctx!.globalCompositeOperation = 'lighter';

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.44;

    const spin = time * 0.16;
    const tilt = Math.sin(time * 0.11) * 0.28;

    const cosSpin = Math.cos(spin);
    const sinSpin = Math.sin(spin);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);

    // Projeta uma vez e reutiliza para nós e ligações.
    const flat: { x: number; y: number; depth: number }[] = [];

    for (const point of points) {
      // rotação em Y
      const rx = point.x * cosSpin - point.z * sinSpin;
      const rz = point.x * sinSpin + point.z * cosSpin;
      // inclinação em X
      const ry = point.y * cosTilt - rz * sinTilt;
      const rz2 = point.y * sinTilt + rz * cosTilt;

      flat.push({
        x: cx + rx * radius,
        y: cy + ry * radius,
        // 0 = atrás, 1 = à frente
        depth: (rz2 + 1) / 2,
      });
    }

    // ── Ligações ───────────────────────────────────────────────────────
    const maxDist = radius * LINK_DIST;

    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        const dx = flat[i].x - flat[j].x;
        const dy = flat[i].y - flat[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) continue;

        const near = (flat[i].depth + flat[j].depth) / 2;
        // Linhas mais fracas quanto mais longe e quanto mais atrás
        const alpha = (1 - dist / maxDist) * near * 0.5;
        if (alpha < 0.01) continue;

        ctx!.strokeStyle = `rgba(${edge}, ${alpha})`;
        ctx!.lineWidth = 0.75;
        ctx!.beginPath();
        ctx!.moveTo(flat[i].x, flat[i].y);
        ctx!.lineTo(flat[j].x, flat[j].y);
        ctx!.stroke();
      }
    }

    // ── Nós ────────────────────────────────────────────────────────────
    for (const node of flat) {
      const size = 0.9 + node.depth * 2.2;
      ctx!.fillStyle = `rgba(${core}, ${0.28 + node.depth * 0.72})`;
      ctx!.beginPath();
      ctx!.arc(node.x, node.y, size, 0, Math.PI * 2);
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

  readPalette();
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

  window.addEventListener('rise:audiencechange', () => {
    readPalette();
    if (!running) draw(0);
  });
}

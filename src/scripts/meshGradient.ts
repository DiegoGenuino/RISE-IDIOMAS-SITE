/**
 * Gradiente mesh animado (WebGL, sem biblioteca).
 *
 * Um triângulo fullscreen e um fragment shader com value-noise em 3 oitavas
 * misturando 4 paradas de cor. As cores vêm de custom properties, portanto o
 * seletor de perfil troca a paleta sem recompilar nada.
 *
 * Custo controlado por três decisões:
 *  - buffer a 0.5 × DPR (é um gradiente suave; resolução alta é desperdício)
 *  - rAF pausado por IntersectionObserver quando o hero sai da viewport
 *  - nunca inicializa com prefers-reduced-motion ou sem WebGL — nesses casos
 *    o gradiente cônico estático do CSS fica visível e basta.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_c0;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform vec3  u_c3;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 p = vec2(uv.x * (u_res.x / max(u_res.y, 1.0)), uv.y) * 1.7;

  float t = u_time * 0.045;
  float n1 = fbm(p + vec2(t, t * 0.55));
  float n2 = fbm(p * 1.35 - vec2(t * 0.7, t * 0.25) + 4.3);

  vec3 col = mix(u_c0, u_c1, smoothstep(-0.28, 0.34, n1));
  col = mix(col, u_c2, smoothstep(-0.30, 0.40, n2) * 0.72);
  col = mix(col, u_c3, smoothstep(0.15, 0.85, n1 * n2 + 0.42) * 0.45);

  // O foco fica à direita, onde está o simulador. A esquerda — onde vive o
  // H1 — permanece limpa, para o contraste do título não depender do ruído.
  float d = distance(uv, vec2(0.60, 0.42));
  float alpha = smoothstep(0.62, 0.06, d);

  gl_FragColor = vec4(col, alpha);
}`;

const STOPS = ['--mesh-0', '--mesh-1', '--mesh-2', '--mesh-3'] as const;

function parseColor(value: string): [number, number, number] {
  const hex = value.trim().replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  const int = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(int)) return [0.32, 0.23, 0.99];
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initMeshGradient(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.querySelector<HTMLCanvasElement>('[data-mesh]');
  if (!canvas) return;

  const gl = (canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  }) ?? null) as WebGLRenderingContext | null;

  // Sem WebGL o fallback cônico do CSS já está pintado — nada a fazer.
  if (!gl) return;

  const vert = compile(gl, gl.VERTEX_SHADER, VERT);
  const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vert || !frag) return;

  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  gl.useProgram(program);

  // Um triângulo que cobre o viewport — mais barato que dois do quad.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_res');
  const uStops = STOPS.map((stop) => gl.getUniformLocation(program, `u_c${STOPS.indexOf(stop)}`));

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function applyPalette(): void {
    const styles = getComputedStyle(canvas!);
    STOPS.forEach((stop, index) => {
      const [r, g, b] = parseColor(styles.getPropertyValue(stop));
      gl!.uniform3f(uStops[index], r, g, b);
    });
  }

  function resize(): void {
    // Metade do DPR: um gradiente suave não ganha nada com mais pixels, e a
    // área de preenchimento cai para um quarto.
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
    const width = Math.max(1, Math.round(canvas!.clientWidth * scale));
    const height = Math.max(1, Math.round(canvas!.clientHeight * scale));
    if (canvas!.width === width && canvas!.height === height) return;
    canvas!.width = width;
    canvas!.height = height;
    gl!.viewport(0, 0, width, height);
    gl!.uniform2f(uRes, width, height);
  }

  applyPalette();
  resize();

  let running = false;
  let rafId = 0;
  let start = performance.now();
  let elapsed = 0;

  function frame(now: number): void {
    if (!running) return;
    elapsed = (now - start) / 1000;
    gl!.uniform1f(uTime, elapsed);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    rafId = requestAnimationFrame(frame);
  }

  function play(): void {
    if (running) return;
    running = true;
    // Retoma de onde parou, para a malha não saltar ao voltar à viewport.
    start = performance.now() - elapsed * 1000;
    rafId = requestAnimationFrame(frame);
  }

  function pause(): void {
    running = false;
    cancelAnimationFrame(rafId);
  }

  new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? play() : pause()),
    { threshold: 0 }
  ).observe(canvas);

  new ResizeObserver(() => {
    resize();
    if (!running) gl.drawArrays(gl.TRIANGLES, 0, 3);
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (canvas.getBoundingClientRect().bottom > 0) play();
  });

  window.addEventListener('rise:audiencechange', () => {
    applyPalette();
    if (!running) gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  canvas.dataset.meshReady = 'true';
}

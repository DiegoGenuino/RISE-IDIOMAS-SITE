import {
  Color,
  FrontSide,
  ShaderMaterial,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function initGlobe(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-globe]');
  if (!canvas || canvas.dataset.globeInitialized) return;
  canvas.dataset.globeInitialized = 'true';

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    canvas.dataset.globeError = 'true';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const brand = new Color(
    getComputedStyle(canvas).getPropertyValue('--color-brand-600').trim() || '#533afd'
  );
  const crtTime = { value: 0 };
  const crtPixelRatio = { value: renderer.getPixelRatio() };
  const brandDisplay = { value: brand.clone().convertLinearToSRGB() };
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 3.8;
  scene.add(new HemisphereLight(0xffffff, 0x35305f, 2));
  const light = new DirectionalLight(0xffffff, 3);
  light.position.set(3, 4, 5);
  scene.add(light);
  const pivot = new Group();
  scene.add(pivot);

  try {
    const gltf = await new GLTFLoader().loadAsync('/models/Globe.glb');
    // Blender's view-dependent Layer Weight halo cannot be baked into a static map.
    // The export carries its original settings as glTF extras.
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      if (object.userData.haloColor === undefined) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!(material instanceof MeshStandardMaterial)) continue;
          material.onBeforeCompile = (shader) => {
            shader.uniforms.crtTime = crtTime;
            shader.uniforms.crtPixelRatio = crtPixelRatio;
            shader.uniforms.brandDisplay = brandDisplay;
            shader.fragmentShader =
              `
              uniform float crtTime;
              uniform float crtPixelRatio;
              uniform vec3 brandDisplay;
            ` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <colorspace_fragment>',
              `
                #include <colorspace_fragment>
                // Preserve the baked coastline/detail while replacing the magenta hue.
                float signal = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
                signal = pow(clamp(signal, 0.0, 1.0), 1.4);
                vec3 phosphor = mix(brandDisplay * 0.075, brandDisplay, signal);
                vec2 pixel = gl_FragCoord.xy / crtPixelRatio;
                float scanline = 0.86 + 0.14 * sin(pixel.y * 2.0943951);
                float grain = fract(sin(dot(floor(pixel), vec2(12.9898, 78.233))
                  + floor(crtTime * 12.0)) * 43758.5453);
                float sweep = pow(0.5 + 0.5 * sin(pixel.y * 0.018 - crtTime * 0.55), 14.0);
                float mask = 0.97 + 0.03 * cos(pixel.x * 2.0943951);
                gl_FragColor.rgb = phosphor * scanline * mask
                  * (0.98 + grain * 0.04 + sweep * 0.055);
              `
            );
          };
          material.customProgramCacheKey = () => 'rise-brand-crt-v1';
        }
        return;
      }
      const settings = object.userData;
      const original = object.material;
      object.material = new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: FrontSide,
        uniforms: {
          haloColor: { value: brand },
          strength: { value: settings.haloStrength },
          blend: { value: settings.haloBlend },
          power: { value: settings.haloPower },
          opacity: { value: settings.haloOpacity },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 positionView = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = -positionView.xyz;
            gl_Position = projectionMatrix * positionView;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          uniform vec3 haloColor;
          uniform float strength, blend, power, opacity;
          void main() {
            float facing = abs(dot(normalize(vNormal), normalize(vView)));
            float exponent = blend < 0.5 ? 2.0 * blend : 0.5 / (1.0 - blend);
            facing = 1.0 - pow(facing, exponent);
            gl_FragColor = vec4(haloColor * strength, clamp(pow(facing, power) * opacity, 0.0, 1.0));
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      });
      for (const material of Array.isArray(original) ? original : [original]) material.dispose();
    });
    const bounds = new Box3().setFromObject(gltf.scene, true);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    gltf.scene.position.sub(center);
    pivot.add(gltf.scene);
    pivot.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
  } catch {
    renderer.dispose();
    canvas.dataset.globeError = 'true';
    return;
  }

  const render = () => renderer.render(scene, camera);
  const resize = new ResizeObserver(() => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(canvas);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let previous = 0;
  let pointerId: number | null = null;
  let lastMoveTime = 0;
  const cruiseSpeed = 0.24;
  const cruiseDirection = new Vector3(0, 1, 0);
  const velocity = new Vector3(); // World-space angular velocity, radians/second.
  const lastPoint = new Vector3();
  const nextPoint = new Vector3();
  const axis = new Vector3();
  const rotation = new Quaternion();
  const events = new AbortController();
  const options = { signal: events.signal };

  // Project the pointer onto a virtual sphere. Quaternions allow unrestricted
  // rotation through the poles, with a natural roll when dragging near the rim.
  const project = (x: number, y: number, point: Vector3) => {
    const bounds = canvas.getBoundingClientRect();
    const radius = Math.min(bounds.width, bounds.height) * 0.42;
    point.set(
      (x - bounds.left - bounds.width / 2) / radius,
      -(y - bounds.top - bounds.height / 2) / radius,
      0
    );
    const distance = point.lengthSq();
    point.z = distance <= 0.5 ? Math.sqrt(1 - distance) : 0.5 / Math.sqrt(distance);
    return point.normalize();
  };
  const rotate = (angularVelocity: Vector3, seconds: number) => {
    const speed = angularVelocity.length();
    if (speed < 0.0001) return;
    axis.copy(angularVelocity).divideScalar(speed);
    rotation.setFromAxisAngle(axis, speed * seconds);
    pivot.quaternion.premultiply(rotation).normalize();
  };
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (pointerId !== null || event.button !== 0 || !event.isPrimary) return;
      pointerId = event.pointerId;
      velocity.set(0, 0, 0);
      lastMoveTime = event.timeStamp;
      project(event.clientX, event.clientY, lastPoint);
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    },
    options
  );
  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerId !== pointerId) return;
      project(event.clientX, event.clientY, nextPoint);
      rotation.setFromUnitVectors(lastPoint, nextPoint);
      pivot.quaternion.premultiply(rotation).normalize();
      const angle = 2 * Math.acos(Math.min(1, Math.max(-1, rotation.w)));
      axis.set(rotation.x, rotation.y, rotation.z);
      if (axis.lengthSq() > 0.000001) {
        const seconds = Math.max((event.timeStamp - lastMoveTime) / 1000, 1 / 240);
        axis.normalize().multiplyScalar(Math.min(angle / seconds, 12));
        velocity.lerp(axis, 0.65);
        if (velocity.lengthSq() > 0.000001) cruiseDirection.copy(velocity).normalize();
      } else {
        velocity.multiplyScalar(0.5);
      }
      lastPoint.copy(nextPoint);
      lastMoveTime = event.timeStamp;
      render();
    },
    options
  );
  const release = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    // A pause before release means "hold here", not another flick.
    if (event.type !== 'pointerup' || event.timeStamp - lastMoveTime > 100 || motion.matches) {
      velocity.set(0, 0, 0);
    }
    pointerId = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerup', release, options);
  canvas.addEventListener('pointercancel', release, options);
  canvas.addEventListener('lostpointercapture', release, options);
  canvas.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || pointerId !== null) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
      axis.set(event.deltaY * unit, event.deltaX * unit, 0).multiplyScalar(0.012);
      axis.clampLength(0, 6);
      if (motion.matches) {
        rotate(axis, 0.12);
        velocity.set(0, 0, 0);
        render();
      } else {
        velocity.add(axis).clampLength(0, 12);
        if (velocity.lengthSq() > 0.000001) cruiseDirection.copy(velocity).normalize();
      }
    },
    { ...options, passive: false }
  );
  const stop = () => {
    velocity.set(0, 0, 0);
    if (pointerId !== null && canvas.hasPointerCapture(pointerId))
      canvas.releasePointerCapture(pointerId);
    pointerId = null;
    canvas.style.cursor = 'grab';
  };
  window.addEventListener('blur', stop, options);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) stop();
    },
    options
  );
  motion.addEventListener('change', stop, options);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  visibility.observe(canvas);
  renderer.setAnimationLoop((time) => {
    const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
    previous = time;
    if (!visible || document.hidden || motion.matches) return;
    crtTime.value = time / 1000;
    if (pointerId === null) {
      const speed = Math.max(velocity.length(), cruiseSpeed);
      if (velocity.lengthSq() > 0.000001) cruiseDirection.copy(velocity).normalize();
      velocity.copy(cruiseDirection).multiplyScalar(speed);
      // Excess momentum decays, but the globe keeps cruising in the last direction.
      const damping = 1.35;
      const decay = Math.exp(-damping * delta);
      const angle = cruiseSpeed * delta + ((speed - cruiseSpeed) * (1 - decay)) / damping;
      rotate(velocity, angle / speed);
      velocity.copy(cruiseDirection).multiplyScalar(cruiseSpeed + (speed - cruiseSpeed) * decay);
    }
    render();
  });
  render();
  canvas.dataset.globeReady = 'true';

  document.addEventListener(
    'astro:before-swap',
    () => {
      events.abort();
      resize.disconnect();
      visibility.disconnect();
      renderer.setAnimationLoop(null);
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material instanceof MeshStandardMaterial) {
            for (const texture of [material.map, material.emissiveMap, material.normalMap]) {
              texture?.dispose();
            }
          }
          material.dispose();
        }
      });
      renderer.dispose();
    },
    { once: true }
  );
}

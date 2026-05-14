export function initKidExpressions() {
  const frames = document.querySelectorAll('[data-kid-frame]');
  if (!frames.length) return;

  let currentFrame = 0;

  setInterval(() => {
    frames.forEach((frame) => frame.classList.add('hidden'));
    currentFrame = (currentFrame + 1) % frames.length;
    frames[currentFrame].classList.remove('hidden');
  }, 400); // speed (ms)
}

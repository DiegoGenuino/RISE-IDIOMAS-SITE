import { gsap } from 'gsap';

export function initExecAnimations() {
  const execKeyboard = document.querySelector('[data-exec-keyboard]');
  if (!execKeyboard) return;

  // ── Expand animation (runs on panel becoming active) ──────────────────────
  function playExecExpand() {
    gsap.fromTo(
      execKeyboard,
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }

  // ── Click easter egg — keyboard key press motion ──────────────────────────
  let isClicking = false;
  execKeyboard.addEventListener('click', () => {
    if (isClicking) return;
    isClicking = true;
    gsap
      .timeline({
        onComplete: () => {
          isClicking = false;
        },
      })
      .to(execKeyboard, {
        y: 6,
        scaleY: 0.96,
        scaleX: 1.01,
        duration: 0.06,
        ease: 'power2.in',
      })
      .to(execKeyboard, {
        y: 0,
        scaleY: 1,
        scaleX: 1,
        duration: 0.35,
        ease: 'elastic.out(1.2, 0.4)',
      });
  });

  // Play expand on initial load
  playExecExpand();

  // Re-trigger expand when switching back to exec panel
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const panel = m.target;
        if (panel.id === 'executivo-panel' && panel.classList.contains('active')) {
          playExecExpand();
        }
      }
    }
  });

  document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
  });
}

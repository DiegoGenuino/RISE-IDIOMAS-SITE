/**
 * Modality Overlay Controller
 * Opens/closes the per-panel "Saiba Mais" overlays and stops tab autoplay.
 *
 * Each overlay is rendered inside its ModalityPanel (Astro component ownership),
 * but portaled to <body> at runtime so `position: fixed` escapes all
 * stacking contexts (GSAP transforms on tab-panels, overflow clipping, etc.).
 */
export function initModalityOverlay() {
  const allOverlays = document.querySelectorAll('[data-modality-overlay]');
  if (!allOverlays.length) return;

  // Portal overlays to <body> so they fill the full viewport
  allOverlays.forEach((overlay) => {
    document.body.appendChild(overlay);
  });

  // ── Open Overlay ──────────────────────────────────────────
  function openOverlay(overlay) {
    overlay.classList.remove('closing');
    overlay.classList.add('active');

    // Stop the tab slideshow autoplay
    document.dispatchEvent(new CustomEvent('modality-overlay-opened'));

    // Focus the close button
    const closeBtn = overlay.querySelector('[data-overlay-close]');
    if (closeBtn) closeBtn.focus();
  }

  // ── Close Overlay ─────────────────────────────────────────
  function closeOverlay(overlay) {
    if (!overlay.classList.contains('active')) return;

    overlay.classList.add('closing');

    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.classList.remove('closing');
    }, 350);
  }

  // ── Wire up each overlay ──────────────────────────────────
  allOverlays.forEach((overlay) => {
    // Close button
    const closeBtn = overlay.querySelector('[data-overlay-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeOverlay(overlay));
    }

    // Backdrop click (disabled in CSS, but fallback if clicked directly)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay(overlay);
      }
    });
  });

  // Close any active overlay on Scroll
  document.addEventListener(
    'scroll',
    () => {
      allOverlays.forEach((overlay) => {
        if (overlay.classList.contains('active')) {
          closeOverlay(overlay);
        }
      });
    },
    { passive: true }
  );

  // Close any active overlay on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      allOverlays.forEach((overlay) => {
        if (overlay.classList.contains('active')) {
          closeOverlay(overlay);
        }
      });
    }
  });

  // ── Wire up all "Saiba Mais" buttons ──────────────────────
  const saibaButtons = document.querySelectorAll('[data-saiba-mais]');

  saibaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Find the closest tab panel ancestor to determine which modality
      const panel = btn.closest('[data-panel]');
      if (panel) {
        const modalityId = panel.getAttribute('data-panel');
        // Find the matching overlay (now living in <body>)
        const overlay = document.querySelector(`[data-modality-overlay="${modalityId}"]`);
        if (overlay) {
          openOverlay(overlay);
        }
      }
    });
  });
}

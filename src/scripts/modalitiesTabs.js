import { gsap } from 'gsap';

export function initModalitiesTabs() {
  const container = document.querySelector('[data-tab-container]');
  const tabs = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  if (!tabs.length || !panels.length || !container) {
    // eslint-disable-next-line no-console
    console.error('Tab elements not found');
    return;
  }

  let currentTab = tabs[0];
  let isAnimating = false;

  // ── Direction-aware crossfade + slide ───────────────────────────────────────
  function switchTab(newTab) {
    if (newTab === currentTab || isAnimating) return;
    isAnimating = true;

    const tabsArray = Array.from(tabs);
    const oldIndex = tabsArray.indexOf(currentTab);
    const newIndex = tabsArray.indexOf(newTab);
    const direction = newIndex > oldIndex ? 1 : -1; // 1 = going right, -1 = going left

    const oldPanel = document.querySelector(`#${currentTab.getAttribute('aria-controls')}`);
    const newPanel = document.querySelector(`#${newTab.getAttribute('aria-controls')}`);

    // Update ARIA + active class
    currentTab.setAttribute('aria-selected', 'false');
    currentTab.classList.remove('active');
    newTab.setAttribute('aria-selected', 'true');
    newTab.classList.add('active');

    // Kill any in-flight tweens
    gsap.killTweensOf([oldPanel, newPanel]);

    const SLIDE_PX = 20; // gentler horizontal drift on exit/enter
    const EXIT_DUR = 0.35; // slower exit speed for smooth crossfade
    const ENTER_DUR = 0.55; // slower enter speed
    const EXIT_EASE = 'power2.inOut';
    const ENTER_EASE = 'power3.out';

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // --- MOBILE ANIMATION: Simple Fade (No Slide) ---
      // 1. Fade old panel out fast
      tl.to(oldPanel, {
        opacity: 0,
        x: 0,
        duration: 0.25,
        ease: 'power2.inOut',
        onStart: () => {
          oldPanel.style.visibility = 'visible';
        },
        onComplete: () => {
          oldPanel.classList.remove('active');
          oldPanel.style.visibility = 'hidden';
        },
      });

      // 2. Prepare new panel
      tl.set(newPanel, {
        visibility: 'visible',
        opacity: 0,
        x: 0,
        y: 10,
      });

      tl.add(() => {
        newPanel.classList.add('active');
      });

      // 3. Fade new panel in and float up slightly
      tl.to(
        newPanel,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
        },
        '>'
      );
    } else {
      // --- DESKTOP ANIMATION: Horizontal Slide Crossfade ---
      // 1. Exit: fade + drift in departure direction
      tl.to(oldPanel, {
        opacity: 0,
        x: -direction * SLIDE_PX,
        duration: EXIT_DUR,
        ease: EXIT_EASE,
        onStart: () => {
          oldPanel.style.visibility = 'visible';
        },
        onComplete: () => {
          oldPanel.classList.remove('active');
          oldPanel.style.visibility = 'hidden';
          gsap.set(oldPanel, { x: 0 });
        },
      });

      // 2. Prepare new panel
      tl.set(newPanel, {
        visibility: 'visible',
        opacity: 0,
        x: direction * SLIDE_PX,
      });

      tl.add(() => {
        newPanel.classList.add('active');
      });

      // 3. Wait for exit to finish, then fade + slide in
      tl.to(
        newPanel,
        {
          opacity: 1,
          x: 0,
          duration: ENTER_DUR,
          ease: ENTER_EASE,
        },
        '>'
      );
    }

    currentTab = newTab;
  }

  // ── Event listeners ─────────────────────────────────────────────────────────
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      stopAutoPlay();
      switchTab(tab);
    });

    tab.addEventListener('keydown', (e) => {
      const tabsArray = Array.from(tabs);
      let index = tabsArray.indexOf(tab);

      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
        stopAutoPlay();
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        index = (index + 1) % tabs.length;
        tabsArray[index].focus();
        switchTab(tabsArray[index]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        index = (index - 1 + tabs.length) % tabs.length;
        tabsArray[index].focus();
        switchTab(tabsArray[index]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabsArray[0].focus();
        switchTab(tabsArray[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        tabsArray[tabs.length - 1].focus();
        switchTab(tabsArray[tabs.length - 1]);
      }
    });
  });

  // ── Autoplay functionality ────────────────────────────────────────────────────
  let autoPlayInterval;
  const AUTOPLAY_DELAY = 5000; // 5 seconds per tab

  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      // Don't auto-advance if tab changes are currently animating
      if (isAnimating) return;

      const tabsArray = Array.from(tabs);
      const currentIndex = tabsArray.indexOf(currentTab);
      // Loop back to the start if we reach the end
      const nextIndex = (currentIndex + 1) % tabsArray.length;

      switchTab(tabsArray[nextIndex]);
    }, AUTOPLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Start the autoplay loop when the script initializes
  startAutoPlay();

  // Stop autoplay when a "Saiba Mais" overlay is opened
  document.addEventListener('modality-overlay-opened', () => {
    stopAutoPlay();
  });
}

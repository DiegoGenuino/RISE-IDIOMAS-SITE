/**
 * Seletor de perfil (Carreiras Tech ↔ Fluência Jovem).
 *
 * O estado vive num único atributo em <html> (`data-audience`) e a troca de
 * conteúdo é resolvida em CSS. Nada é re-renderizado e nenhum nó é criado ou
 * destruído — a única propriedade animada é `transform` no indicador.
 */

const STORAGE_KEY = 'rise:audience';
const VALID = ['tech', 'young'] as const;

type AudienceId = (typeof VALID)[number];

function readStored(): AudienceId | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return VALID.includes(value as AudienceId) ? (value as AudienceId) : null;
  } catch {
    return null;
  }
}

function persist(value: AudienceId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* modo privado / storage bloqueado — o estado apenas não sobrevive ao reload */
  }
}

export function initAudience(): void {
  const root = document.documentElement;
  const switches = Array.from(document.querySelectorAll<HTMLElement>('.ds-audience-switch'));

  let current: AudienceId = readStored() ?? (root.dataset.audience as AudienceId) ?? 'tech';

  function paint(id: AudienceId, animate: boolean): void {
    root.dataset.audience = id;

    for (const shell of switches) {
      const options = Array.from(
        shell.querySelectorAll<HTMLButtonElement>('[data-audience-option]')
      );
      const active = options.find((option) => option.dataset.audienceOption === id);

      for (const option of options) {
        option.setAttribute('aria-selected', String(option === active));
        option.tabIndex = option === active ? 0 : -1;
      }

      if (!active) continue;

      const thumb = shell.querySelector<HTMLElement>('.ds-audience-thumb');
      if (!thumb) continue;

      if (!animate) thumb.style.transition = 'none';
      thumb.style.setProperty('--thumb-w', `${active.offsetWidth}px`);
      thumb.style.setProperty(
        '--thumb-x',
        `${active.offsetLeft - active.parentElement!.clientLeft - 4}px`
      );

      if (!animate) {
        // força um reflow único para que a transição volte a valer no próximo paint
        void thumb.offsetWidth;
        thumb.style.transition = '';
      }

      shell.dataset.ready = 'true';
    }
  }

  function select(id: AudienceId): void {
    if (id === current) return;
    current = id;
    persist(id);
    paint(id, true);
    window.dispatchEvent(new CustomEvent('rise:audiencechange', { detail: { audience: id } }));
  }

  for (const shell of switches) {
    const options = Array.from(shell.querySelectorAll<HTMLButtonElement>('[data-audience-option]'));

    shell.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-audience-option]'
      );
      if (!target) return;
      select(target.dataset.audienceOption as AudienceId);
    });

    // Navegação por setas dentro do tablist
    shell.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const index = options.findIndex((option) => option.getAttribute('aria-selected') === 'true');
      const next =
        options[(index + (event.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length];
      select(next.dataset.audienceOption as AudienceId);
      next.focus();
    });
  }

  paint(current, false);

  // Re-mede o indicador quando as fontes carregam ou a largura muda
  const remeasure = () => paint(current, false);
  window.addEventListener('resize', remeasure, { passive: true });
  if (document.fonts?.ready) void document.fonts.ready.then(remeasure);
}

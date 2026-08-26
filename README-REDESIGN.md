# Redesign v2 — Design System Rise

Refatoração completa da home, com sistema de design inspirado no padrão visual da Stripe.
Copy e dados de negócio extraídos da branch `master`.

---

## ⚠️ Pendências de conteúdo (precisam de decisão da Rise)

A branch `master` não contém esses dados. Nada foi inventado — a UI está pronta e
espera os valores reais.

| O quê                    | Onde preencher                 | Estado atual na página                          |
| ------------------------ | ------------------------------ | ----------------------------------------------- |
| Valores dos planos       | `src/data/pricing.ts`          | "Sob consulta" + CTA de WhatsApp                |
| Logótipos de empresas    | `src/sections/social-proof/SocialProof.astro` (`partnerLogos`) | faixa mostra contextos de uso e métricas factuais |
| Presencial vs. online    | `src/data/faq.ts` (`pending: true`) | resposta encaminha para o WhatsApp         |
| Aula experimental grátis | `src/data/faq.ts` (`pending: true`) | resposta encaminha para o WhatsApp         |

Preenchendo `priceMonthly` / `priceYearly` em `pricing.ts`, o alternador mensal/anual
e o destaque do plano popular passam a funcionar sozinhos — nenhuma alteração de
componente é necessária.

As métricas da faixa de prova social (`src/data/methodology.ts` → `proofStats`) usam
apenas factos verificáveis: 6 modalidades, 3 idiomas, 2 certificadoras e o horário de
funcionamento. Nenhum número de alunos ou taxa de aprovação foi criado.

---

## Sistema de design

Tokens em `src/styles/global.css`, dentro de `@theme` (Tailwind v4) — ficam disponíveis
como utilitários (`bg-brand`, `text-ink`, `shadow-card`, `text-hero`…).

| Categoria       | Token                                   | Valor                       |
| --------------- | --------------------------------------- | --------------------------- |
| Marca           | `--color-brand`                         | `#533AFD`                   |
| Texto           | `--color-ink` / `--color-ink-soft`      | `#061B31` / `#425466`       |
| Imersivo        | `--color-abyss` / `--color-abyss-deep`  | `#1C1E54` / `#101235`       |
| Gradiente quente| `--color-ruby` → `--color-magenta`      | `#EA2261` → `#F96BEE`       |
| Bordas          | `--color-brand-soft` / `--color-brand-deep` | `#D6D9FC` / `#362BAA`   |
| Sombras         | `--shadow-card`, `--shadow-float`, `--shadow-hero` | camadas `rgba(50,50,93,.25)` + `rgba(0,0,0,.1)` |

Duas cores foram acrescentadas ao briefing por necessidade de contraste sobre fundo
escuro, onde `#533AFD` reprova em WCAG:

- `--color-aqua` `#45D1FF` — 7.9:1 sobre `#1C1E54` (AAA)
- `--color-lime` `#B4F461` — sinalização de correção/acerto

### Escala fluida

O briefing pede `html { font-size: calc(100vw / 1440) }`. Aplicado à letra, 1rem = 1px
em 1440px — e como toda a escala de utilitários do Tailwind v4 é baseada em rem, o corpo
do texto ficaria com 1px. A tradução funcional mantém a ideia (layout proporcional à
viewport, sem saltos de media query) ancorada em 16px @ 1440px:

```css
@media (min-width: 1024px) {
  :root {
    font-size: clamp(0.875rem, 1.111vw, 1.125rem);
  }
}
```

`1.111vw × 1440 = 16px`. O `clamp` usa `rem` e não `px` para preservar o tamanho-base
de fonte que o utilizador escolheu no navegador.

---

## Arquitetura

```
src/
  data/          site.ts · courses.ts · methodology.ts · pricing.ts · faq.ts · quiz.ts
  components/
    ui/          Button · SectionHeading · AudienceSwitch
    nav/         Navbar (sticky + backdrop-filter + drawer mobile)
    hero/        HeroSimulator (editor + transcript de aula)
    quiz/        LevelQuiz.tsx (ilha React, client:visible)
    newsletter/  NewsletterForm (mantém o endpoint /api/newsletter)
  sections/      hero · social-proof · methodology · courses · level-quiz
                 pricing · testimonials · faq · cta · footer
  scripts/       main · audience · nav · simulator · modals · pricing
                 reveal · smoothScroll · stickyGrid
```

Toda a copy de negócio vive em `src/data/`. Os componentes não têm texto comercial
hard-coded — mudar uma descrição de curso é editar um único ficheiro.

### Seletor de perfil

O estado vive num atributo em `<html>` (`data-audience="tech" | "young"`) e a troca de
conteúdo é resolvida em CSS:

```css
html[data-audience='tech'] [data-aud='young'],
html[data-audience='young'] [data-aud='tech'] {
  display: none !important;
}
```

Nada re-renderiza, nenhum nó é criado ou destruído, e um script inline bloqueante no
`<head>` restaura a escolha antes do primeiro paint (sem flash de conteúdo errado).

### Cena da metodologia (sticky scroll)

`src/sections/methodology/StickyFeatureGrid.astro` + `src/scripts/stickyGrid.ts`.

Bloco externo de `425vh` como linha do tempo, palco `position: sticky; height: 100vh`.
Mapa do scrub:

| Progresso   | O que acontece                                        |
| ----------- | ----------------------------------------------------- |
| 0.00 – 0.45 | colunas entram com deslocamento vertical alternado    |
| 0.45 – 0.90 | zoom da grelha (`scale 1 → 1.3`) e deriva em X/Y      |
| 0.60 – 0.90 | véu escurece a cena                                   |
| 0.74 – 0.88 | cabeçalho sai                                         |
| 0.88 – 0.98 | camada textual central e CTAs entram                  |
| 0.98 – 1.00 | estabiliza e liberta o scroll                         |

Todas as tweens tocam apenas em `transform` e `opacity`.

O layout sticky depende do atributo `data-scene-ready`, que só o GSAP coloca. Sem JS,
com JS a falhar, em viewport < 1024px, ou com `prefers-reduced-motion: reduce`, a seção
fica no layout empilhado — que é um estado desenhado, não um fallback partido.

---

## Desempenho

- **GSAP + ScrollTrigger (113 KB) fora do caminho crítico.** São importados
  dinamicamente e só quando a seção da metodologia se aproxima da viewport
  (`rootMargin: 100%`), em desktop e sem `prefers-reduced-motion`. O bundle da home
  caiu de **139 KB → 27,5 KB**.
- **Lenis conduz o scroll sozinho**, com o próprio `requestAnimationFrame`. O
  ScrollTrigger regista-se via `onScroll()` só quando chega.
- **Estado da navbar por `IntersectionObserver`** sobre uma sentinela de 1px, em vez de
  um listener de `scroll`.
- **Fontes variable pré-carregadas** com o caminho resolvido pelo Vite (`?url`), corte
  latino apenas, `font-display: swap`.
- **Revelação por `IntersectionObserver`** com `unobserve` por elemento — o custo tende
  a zero à medida que se rola.

### Custo conhecido

`LevelQuiz` é uma ilha React (`client:visible`), o que traz ~186 KB de runtime quando o
quiz entra na viewport. Não afeta LCP nem a interatividade inicial, mas é o maior ativo
da página. Converter para TS puro elimina o React da home — são ~80 linhas. Ficou como
React por ser o padrão já configurado no projeto (`@astrojs/react`, usado também em
`Splash.tsx`).

---

## Acessibilidade

- Contraste: `#061B31` sobre branco = 15.9:1; `#425466` = 8.1:1; `#C3C8F5` sobre
  `#1C1E54` = 8.0:1 — todos AAA.
- `prefers-reduced-motion` desliga scroll sintético, marquee, cena sticky e todas as
  revelações.
- Modais em `<dialog>` nativo (foco preso, Escape, top layer sem custo próprio).
- Seletor de perfil como `role="tablist"` com navegação por setas.
- Link "Ir para o conteúdo" e anel de foco visível que inverte para `--color-aqua`
  sobre fundo escuro.

---

## O que foi removido

Componentes da home antiga, todos substituídos e sem uso restante: `topbar/`,
`modality-navbar/`, `modality-panel/`, `testimonial-card/`, `testimonial-type-bg/`,
`glass/`, `bg-text/`, `student-icon/`, `credits/`, `button/`, `enrollment-letter/`,
`viewport-fallback/`, as seções `about-us/` `location/` `modalities/` e os scripts
`execAnimations` `kidsAnimations` `modalitiesTabs` `modalityOverlay`.

- **`enrollment-letter/`** — a funcionalidade não se perdeu: o formulário de newsletter
  passou para `components/newsletter/NewsletterForm.astro`, no rodapé, mantendo o mesmo
  contrato com `/api/newsletter`.
- **`viewport-fallback/`** — bloqueava viewports estreitos porque o layout antigo
  quebrava. O novo é responsivo por construção, portanto deixou de fazer sentido.

O blog (`/blog`, `/blog/[slug]`), o `/404` e `/s/[slug]` continuam a funcionar; usam
`BaseLayout` e o `Footer`, ambos atualizados para o novo sistema.

Os assets da home antiga (`src/assets/images/modalities-section/`, `cta/`, etc.)
**não** foram apagados. Não são importados por nenhum componente, portanto não entram
no bundle, e ficam disponíveis caso queiram reaproveitar as ilustrações.

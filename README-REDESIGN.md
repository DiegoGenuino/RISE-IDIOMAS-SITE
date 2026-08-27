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

---

## v3 — calibração contra o CSS real da Stripe

A v2 foi construída a partir do briefing. A v3 foi calibrada baixando e
analisando os bundles CSS de produção da `stripe.com` (design system "HDS").
As diferenças eram mensuráveis:

| O quê | v2 | Stripe real (medido) |
| --- | --- | --- |
| Sombras | `rgba(50,50,93,.25)`, 1 camada, 25% | 2 camadas azul-marinho a **4–14%** |
| Motion (transform) | 200–300 ms | **500 ms – 1,2 s**, `cubic-bezier(.165,.84,.44,1)` |
| Grid | flex ad-hoc, 1200 px | **4/8/12 colunas**, container **1264 px** |
| Paleta | 8 valores soltos | rampas `brand 25→975`, `neutral 0→990` |
| Nav | 64 px, blur 8 px | **76 px**, blur **5 px**, breakpoint **940 px** |
| Menu mobile | fade de opacidade | reveal por **`clip-path: inset()`** |
| Raios | 4/6/10/14/20 | **2/4/6/16/32** |

A receita `rgba(50,50,93,.25)` é a Stripe de ~2018, replicada em todo o CodePen —
é 2,5× mais pesada que a atual, e era o que fazia os cartões lerem como
"Bootstrap com box-shadow".

### Tipografia

Instrument Sans (grotesca livre mais próxima da Söhne, que a Stripe licencia da
Klim) + Source Code Pro, a mesma mono que a Stripe usa. Inter foi removido.

### Movimento

Tokens de duração (`--dur-micro` a `--dur-scene`) e quatro curvas extraídas do
HDS. `prefers-reduced-motion` zera os tokens num único bloco — o padrão da
própria Stripe — em vez de espalhar overrides por seletor.

### Seções novas

- **Bento grid** "O que está incluído" — tile grande escuro + malha 2×2.
- **Trilha CEFR A1→C2** — scroll horizontal conduzido pelo scroll vertical.
  Descritores e horas guiadas são do CEFR e do Cambridge Assessment (padrão
  público), rotuladas como referência e não como promessa de prazo.
- **Últimos posts do blog** — usa `getBlogList()`; some sozinha se o Sanity
  falhar ou não houver posts.

### Hero: gradiente mesh em WebGL

Shader próprio (~5 KB, sem biblioteca): value-noise em 3 oitavas misturando 4
paradas de cor. Buffer a 0,5 × DPR, rAF pausado por `IntersectionObserver`, e a
paleta trocada pelo seletor de perfil (fria para tech, quente para jovem). Sem
WebGL ou com movimento reduzido, o canvas nunca é criado e fica o cônico
estático do CSS.

A malha é contida à direita, atrás do simulador: o contraste do H1 não pode
depender de onde o ruído calhou de estar.

### Títulos com GSAP SplitText

Revelação caractere a caractere com blur, como pedido. Três diferenças em
relação ao exemplo de referência:

1. O estado inicial é `visibility: hidden` **estático em CSS**, e quem revela é
   o GSAP ao marcar `data-split-done` no momento em que parte o texto. Assim o
   título nunca chega a ser pintado antes da animação. As três guardas vivem no
   próprio seletor, sem depender de JS nenhum:

   ```css
   @media (prefers-reduced-motion: no-preference) {
     html:not(.no-js):not(.ds-split-off) [data-split]:not([data-split-done]) {
       visibility: hidden;
     }
   }
   ```

   `:not(.no-js)` cobre JS desativado, a media query cobre movimento reduzido, e
   `.ds-split-off` é ligada pelo TS se o GSAP não carregar.
2. `aria: 'auto'` mantém o título legível por leitores de ecrã.
3. O split é revertido no fim e há um failsafe que força `timeline.progress(1)`
   após 4 s — a timeline avança por `requestAnimationFrame`, e há contextos em
   que o rAF não corre.

O acento do H1 passou a ser cor sólida: `background-clip: text` não sobrevive ao
`filter: blur()` por caractere, que cria um novo contexto de pintura. Títulos
sólidos também são mais fiéis à Stripe, que nunca usa gradiente em texto.

### Custo do SplitText (decisão consciente)

GSAP core (70 KB) + SplitText (7 KB) passaram a carregar em todo page view,
porque o título do hero — que é o elemento de LCP — depende deles. O bundle de
entrada é 35 KB; ScrollTrigger (43 KB) continua fora, carregado só quando as
cenas de scroll se aproximam.

O H1 fica invisível até o GSAP chegar, portanto o LCP passa a ser marcado no
momento em que o título aparece. Na prática isso depende de quão rápido o GSAP
carrega — em cache quente é imperceptível. Para tirar o hero da equação sem
perder o resto, basta remover `data-split` do H1 em
`src/sections/hero/Hero.astro` — os títulos de seção continuariam animando sem
custo de LCP, porque só carregam ao entrar na viewport.

### Verificação

Feita com Chrome headless (`--headless=new --screenshot`), em 390 px (via
harness com iframe), 500 px, 1280 px e 1440 px, nos dois perfis e com
`--force-prefers-reduced-motion`.

**Limitação conhecida:** neste ambiente o `requestAnimationFrame` do Chrome
headless dispara no máximo 2 vezes, portanto **nenhuma animação foi verificada
visualmente em movimento** — nem o mesh gradient, nem o SplitText, nem as cenas
sticky. O que foi verificado: layout, tipografia, cor, sombras, os estados
finais, o menu mobile aberto, a troca de perfil, e que o GSAP aplica os estados
iniciais corretos. O movimento em si precisa de um olhar num browser real.

---

## v5 — bento, metodologia, depoimentos e a seção "alcance"

### SplitText simplificado

Passou a seguir o padrão da documentação do GSAP: `SplitText.create()` com
`onSplit` a devolver o tween. O que evita o lampejo é a ordem lá dentro — o
tween é criado primeiro (e `gsap.from` aplica o estado inicial no mesmo
instante), e só depois o título é revelado. Até aí esteve `visibility: hidden`
por CSS estático, portanto o texto nunca chega a ser pintado.

`type: 'words,chars'` continua obrigatório: com `chars` sozinho cada caractere
é um inline-block, e um inline-block é ponto de quebra de linha — o título
partia no meio das palavras.

### Bento grid

Cartões no estilo da Stripe: cantos vivos (sem `border-radius`), fios de 1px a
separar num bloco único, e um lavado de gradiente que entra por um canto
diferente em cada cartão — todos das rampas do sistema. Cada cartão tem um
ícone SVG animado (`src/components/ui/BentoIcon.astro`) que anima só
`transform`, `opacity` ou `stroke-dashoffset`.

### Metodologia — novo formato

A cena de zoom foi substituída por coluna fixa à esquerda com o índice dos
passos e cartões a passar à direita. O problema do formato anterior era de
narrativa: a grelha dava zoom e derivava durante quase toda a seção, e o texto
que explicava a metodologia só entrava no fim — o utilizador via movimento sem
saber o que estava a ler.

Também ficou mais barato: sem GSAP. A coluna prende-se com `position: sticky` e
o passo ativo sai de um `IntersectionObserver` sobre o terço central da
viewport. `src/scripts/stickyGrid.ts` foi removido.

### Depoimentos — slider

Um depoimento grande de cada vez com abas por aluno, como na Stripe. Os painéis
vivem todos na mesma célula de grid, portanto a altura é a do maior e a troca é
um crossfade sem salto de layout (verificado: os 7 painéis medem o mesmo).

### "O alcance de um idioma"

Adaptação da seção *The backbone of global commerce*: título, as métricas
factuais em linha com fios a separar, e um feixe de luz animado ao fundo com
abas que trocam a cor por idioma.

O objeto é **canvas 2D, não three.js** — são 210 linhas a partir de um ponto,
com composição aditiva para o núcleo saturar em branco. three.js custaria
~600 KB para desenhar isto. O rAF pausa fora da viewport e com movimento
reduzido desenha-se um único frame estático.

Substituiu a antiga faixa de prova social, levando as mesmas métricas
verificáveis para um formato com muito mais presença.

### Defeitos encontrados na verificação

- **A página abria rolada ~7000px.** O slider de depoimentos chamava
  `scrollIntoView` no arranque para manter a aba ativa à vista, e esse método
  rola todos os antepassados — incluindo o documento. Passou a mexer só no
  `scrollLeft` da própria tira de abas, e nunca no primeiro render.
- **Faixa branca entre duas seções escuras.** As costuras (`ds-seam-t`) assumem
  a cor da seção anterior; com a nova ordem, metodologia passou a vir depois de
  uma seção escura. Costura removida daí e dos depoimentos.

---

## v6 — correções e ajuste de seções

### Bug: metade inferior do ecrã não recebia cliques (mobile)

Não era o menu. Era o **FAB do WhatsApp**, herdado da branch `master`: o cartão
fechado é `opacity: 0` mas continua a ocupar o seu lugar dentro do wrapper
`position: fixed`, que por isso mede ~300×333 px mesmo sem nada visível. Num
telemóvel de 390 px isso cobre de ~55% da altura para baixo e engolia todos os
cliques.

Correção: `pointer-events: none` no wrapper, `auto` no botão e no cartão aberto.
Medido com `elementFromPoint` a 60%, 75% e 90% da altura — antes devolvia
`div.min-wa-wrapper` nos três, agora devolve o conteúdo da página.

### Navbar que se esconde

Sai de cena ao descer, volta ao subir, e está sempre visível nos primeiros
80 px e com o menu aberto. Só `transform`. Sem `requestAnimationFrame` a
intermediar: ler `scrollY` dentro de um evento de scroll não força layout, e o
rAF só acrescentava um ponto de falha onde ele é estrangulado.

### Hero: objeto em vez do cartão

O simulador de código deu lugar a uma esfera de conexões em canvas 2D — pontos
por espiral de Fibonacci, rodados em Y com oscilação em X, ligados por linhas
quando ficam próximos na projeção. `HeroSimulator.astro` e `simulator.ts` foram
removidos.

Deliberadamente diferente do feixe da seção "alcance": lá é um leque a partir
de um ponto, aqui é um corpo que roda.

### "Alcance": movimento vivo

A origem do feixe vagueia e o conjunto baloiça, somando senos de períodos
incomensuráveis (0.13 / 0.071 / 0.097…) para o percurso nunca fechar num ciclo
percetível. Fundo mudado para `--color-abyss-deep` (#0D1738), o que faz a luz
saltar mais.

### Metodologia: abas a sério

Eram cartões empilhados com um índice a acompanhar o scroll — e o indicador
errava sempre que dois cartões entravam na faixa de leitura ao mesmo tempo.
Agora são abas: o passo ativo é o que o utilizador escolheu, e não há nada a
adivinhar. Só um painel de cada vez, com número, título e descrição — os chips
de detalhe saíram. Fundo claro (`--color-surface-alt`).

### Trilha: escada vertical

O scroll horizontal prendia a página por quatro viewports para mostrar seis
painéis que cabem numa lista. Agora é uma escada: uma linha por nível, fios a
separar, e um degrau que cresce à esquerda. `journey.ts` removido.

**Com isto o ScrollTrigger saiu do projeto** — nenhuma seção depende mais dele.
Restam GSAP core e SplitText, só para os títulos.

### FAQ

Numeração mono, barra de acento a crescer no item aberto, e um cartão "ainda
com dúvida?" na coluna fixa para quem chega ao fim sem resposta.

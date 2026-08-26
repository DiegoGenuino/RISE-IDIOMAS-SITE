/**
 * Pilares metodológicos exibidos na Sticky Feature Grid.
 * Cada item é rastreável a conteúdo já publicado na branch `master`:
 *  - "imersao"   → SEO da home ("moderna e imersiva") + depoimento de Bruna Siciliano
 *                  ("as aulas 100% em inglês pareciam loucura, mas foram a melhor escolha")
 *  - "trilha"    → seção Quem Somos ("cursos cuidadosamente planejados... nível ideal")
 *  - "confianca" → seção Quem Somos ("desenvolver sua confiança e autonomia")
 *  - "certificacao" → modalidade Cursos Preparatórios (Cambridge e Michigan)
 */

export interface Pillar {
  id: string;
  index: string;
  title: string;
  description: string;
  /** Linhas curtas exibidas no cartão 3D — leem-se como saída de terminal. */
  bullets: string[];
}

export const pillars: Pillar[] = [
  {
    id: 'imersao',
    index: '01',
    title: 'Imersão desde a primeira aula',
    description:
      'Aulas conduzidas 100% no idioma-alvo. O bloqueio de falar cai porque não existe rota de fuga para o português — e é exatamente isso que acelera a fluidez.',
    bullets: ['input 100% no idioma', 'correção em tempo real', 'zero tradução literal'],
  },
  {
    id: 'trilha',
    index: '02',
    title: 'Trilha planejada para o seu nível',
    description:
      'Nossos cursos são cuidadosamente planejados para que você alcance seu nível ideal com clareza e segurança — sem pular etapas e sem repetir o que você já domina.',
    bullets: ['diagnóstico inicial', 'plano por objetivo', 'progresso mensurável'],
  },
  {
    id: 'confianca',
    index: '03',
    title: 'Confiança e autonomia',
    description:
      'O objetivo não é decorar regras: é você sustentar uma reunião, uma entrevista ou uma viagem sozinho. Aprendizado prático e direcionado, com foco em você e no seu crescimento.',
    bullets: ['prática dirigida', 'vocabulário do seu contexto', 'autonomia real'],
  },
  {
    id: 'certificacao',
    index: '04',
    title: 'Certificação internacional',
    description:
      'Sua proficiência comprovada pelas instituições mais respeitadas do mundo, com simulados, técnicas de prova e material didático oficial das certificadoras.',
    bullets: ['Cambridge', 'Michigan', 'simulados reais'],
  },
];

/**
 * Faixa de prova social. Apenas fatos verificáveis na branch `master`
 * (modalidades, idiomas, certificadoras, endereço e horários).
 * Nenhum número de alunos/aprovação foi inventado — ver README-REDESIGN.md.
 */
export const proofStats = [
  { value: '06', label: 'modalidades', hint: 'Kids a Executivo' },
  { value: '03', label: 'idiomas', hint: 'Inglês · Espanhol · Português' },
  { value: '02', label: 'certificadoras', hint: 'Cambridge · Michigan' },
  { value: '13h', label: 'por dia', hint: 'Seg–Sex, 08:00 às 21:00' },
];

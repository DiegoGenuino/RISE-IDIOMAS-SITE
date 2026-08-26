/**
 * Trilha de níveis A1 → C2.
 *
 * Os descritores de competência e as horas guiadas de referência são do Quadro
 * Comum Europeu (CEFR) e das tabelas públicas do Cambridge Assessment — padrão
 * do setor, não uma promessa da Rise. As horas aparecem rotuladas como
 * referência justamente para não serem lidas como prazo garantido.
 *
 * O campo `course` aponta para uma modalidade real (ver src/data/courses.ts).
 */

export interface JourneyStage {
  level: string;
  name: string;
  /** O que a pessoa passa a conseguir fazer neste nível. */
  can: string;
  /** Três marcos concretos, em linguagem de uso e não de gramática. */
  milestones: string[];
  /** Horas guiadas acumuladas de referência (Cambridge). */
  hours: string;
  courseId: string;
  courseLabel: string;
}

export const journey: JourneyStage[] = [
  {
    level: 'A1',
    name: 'Primeiro contato',
    can: 'Você se apresenta, pede informação básica e entende frases simples ditas devagar.',
    milestones: [
      'Apresentar-se e falar de onde vem',
      'Pedir comida, direções e ajuda',
      'Entender avisos e placas',
    ],
    hours: '~90–100 h',
    courseId: 'kids',
    courseLabel: 'Kids · Teens',
  },
  {
    level: 'A2',
    name: 'Sobrevivência',
    can: 'Você descreve a sua rotina, o seu trabalho e viaja sem depender de tradutor.',
    milestones: [
      'Contar o que faz no trabalho',
      'Resolver check-in, compras e imprevistos',
      'Escrever mensagens curtas com clareza',
    ],
    hours: '~180–200 h',
    courseId: 'teens',
    courseLabel: 'Teens · Acadêmico',
  },
  {
    level: 'B1',
    name: 'Independência',
    can: 'Você sustenta uma conversa sobre temas conhecidos e acompanha uma reunião com apoio.',
    milestones: [
      'Acompanhar uma daily e responder',
      'Explicar um problema do começo ao fim',
      'Ler documentação técnica sem travar',
    ],
    hours: '~350–400 h',
    courseId: 'academico',
    courseLabel: 'Acadêmico',
  },
  {
    level: 'B2',
    name: 'Autonomia',
    can: 'Você participa de reuniões, defende um ponto de vista e encara uma entrevista técnica.',
    milestones: [
      'Discordar e argumentar em reunião',
      'Passar por entrevista técnica em inglês',
      'Escrever RFC, e-mail e post-mortem',
    ],
    hours: '~500–600 h',
    courseId: 'executivo',
    courseLabel: 'Executivo',
  },
  {
    level: 'C1',
    name: 'Domínio operacional',
    can: 'Você negocia, apresenta para uma audiência internacional e redige documentos formais.',
    milestones: [
      'Conduzir negociação com nuance',
      'Apresentar para audiência global',
      'Interpretar contratos internacionais',
    ],
    hours: '~700–800 h',
    courseId: 'juridico',
    courseLabel: 'Executivo · Jurídico',
  },
  {
    level: 'C2',
    name: 'Proficiência',
    can: 'Você lida com ironia, humor e argumentação complexa com a naturalidade de um nativo.',
    milestones: [
      'Certificar o nível em prova oficial',
      'Sustentar debate técnico longo',
      'Escrever com registro e estilo próprios',
    ],
    hours: '~1.000–1.200 h',
    courseId: 'preparatorio',
    courseLabel: 'Cursos Preparatórios',
  },
];

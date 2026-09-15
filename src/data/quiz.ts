/**
 * Triagem rápida de nível.
 *
 * O CEFR descreve perfis por atividade (recepção, produção, interação e
 * mediação), não uma única nota de gramática. Por isso:
 * - objetivo nunca soma pontos de proficiência;
 * - itens objetivos são ordenados de A1 a C1 e têm travas por faixa;
 * - escuta e interação entram como autoavaliação, claramente identificadas;
 * - o resultado termina em C1. Um quiz sem produção observada não atribui C2.
 */

export type QuizKind = 'profile' | 'objective' | 'self';
export type QuizLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface QuizOption {
  label: string;
  value: string;
  /** Apenas itens objetivos: 1 = resposta correta. */
  score?: 0 | 1;
  /** Apenas autoavaliação: A1=0 ... C1=4. */
  selfLevel?: 0 | 1 | 2 | 3 | 4;
}

export interface QuizStep {
  id: string;
  kind: QuizKind;
  band: string;
  prompt: string;
  context?: string;
  level?: QuizLevel;
  skill?: 'language-use' | 'reading' | 'listening' | 'interaction';
  options: QuizOption[];
}

export interface QuizAnswer {
  stepId: string;
  value: string;
}

export const quizSteps: QuizStep[] = [
  {
    id: 'goal',
    kind: 'profile',
    band: 'Perfil · não altera o nível',
    prompt: 'Qual é o seu principal objetivo com o inglês?',
    options: [
      { label: 'Trabalhar com times internacionais', value: 'work' },
      { label: 'Fazer Cambridge ou Michigan', value: 'exam' },
      { label: 'Estudar fora ou fazer intercâmbio', value: 'study' },
      { label: 'Conversar com mais confiança', value: 'conversation' },
    ],
  },
  {
    id: 'language-a1',
    kind: 'objective',
    band: 'Uso da língua · A1',
    level: 'A1',
    skill: 'language-use',
    prompt: 'Complete a frase:',
    context: '“I ___ from Brazil, but my manager ___ in Canada.”',
    options: [
      { label: 'am · lives', value: 'correct', score: 1 },
      { label: 'is · live', value: 'is-live', score: 0 },
      { label: 'am · live', value: 'am-live', score: 0 },
      { label: 'are · lives', value: 'are-lives', score: 0 },
    ],
  },
  {
    id: 'reading-a2',
    kind: 'objective',
    band: 'Leitura · A2',
    level: 'A2',
    skill: 'reading',
    prompt: 'O que você precisa fazer?',
    context:
      '“The meeting has moved from 10:00 to 11:30. Please send your notes before it starts.”',
    options: [
      { label: 'Enviar as anotações antes das 11h30', value: 'correct', score: 1 },
      { label: 'Entrar na reunião às 10h', value: 'at-ten', score: 0 },
      { label: 'Cancelar a reunião', value: 'cancel', score: 0 },
      { label: 'Enviar as anotações depois da reunião', value: 'after', score: 0 },
    ],
  },
  {
    id: 'language-b1',
    kind: 'objective',
    band: 'Uso da língua · B1',
    level: 'B1',
    skill: 'language-use',
    prompt: 'Complete a frase:',
    context: '“If we ___ the deploy now, the team would be blocked.”',
    options: [
      { label: 'cancel', value: 'cancel', score: 0 },
      { label: 'cancelled', value: 'correct', score: 1 },
      { label: 'will cancel', value: 'will-cancel', score: 0 },
      { label: 'have cancelled', value: 'have-cancelled', score: 0 },
    ],
  },
  {
    id: 'reading-b1',
    kind: 'objective',
    band: 'Leitura · B1',
    level: 'B1',
    skill: 'reading',
    prompt: 'Qual é a mensagem principal?',
    context:
      '“I’ve reviewed the draft. The main points are clear, but the opening needs more context before we send it to the client.”',
    options: [
      { label: 'O texto está pronto para o cliente', value: 'ready', score: 0 },
      { label: 'O início precisa ser revisado antes do envio', value: 'correct', score: 1 },
      { label: 'Os pontos principais devem ser removidos', value: 'remove', score: 0 },
      { label: 'O cliente já pediu mais contexto', value: 'client-asked', score: 0 },
    ],
  },
  {
    id: 'reading-b2',
    kind: 'objective',
    band: 'Leitura · B2',
    level: 'B2',
    skill: 'reading',
    prompt: 'O que a pessoa pensa sobre a proposta?',
    context: '“The proposal is sound; nevertheless, its timeline is unrealistic.”',
    options: [
      { label: 'A ideia é boa, mas o prazo não é viável', value: 'correct', score: 1 },
      { label: 'A proposta e o prazo estão adequados', value: 'all-good', score: 0 },
      { label: 'A ideia é ruim, mas o prazo é viável', value: 'bad-idea', score: 0 },
      { label: 'Ainda não existe uma proposta', value: 'none', score: 0 },
    ],
  },
  {
    id: 'language-b2',
    kind: 'objective',
    band: 'Uso da língua · B2',
    level: 'B2',
    skill: 'language-use',
    prompt: 'Complete a frase:',
    context: '“The issue could have been avoided if we ___ the integration earlier.”',
    options: [
      { label: 'tested', value: 'tested', score: 0 },
      { label: 'would test', value: 'would-test', score: 0 },
      { label: 'had tested', value: 'correct', score: 1 },
      { label: 'have tested', value: 'have-tested', score: 0 },
    ],
  },
  {
    id: 'reading-c1',
    kind: 'objective',
    band: 'Precisão de sentido · C1',
    level: 'C1',
    skill: 'reading',
    prompt: 'Na frase abaixo, “stops short of” indica que o relatório:',
    context:
      '“The report criticises the current process but stops short of recommending a full redesign.”',
    options: [
      { label: 'Recomenda explicitamente um redesenho completo', value: 'recommends', score: 0 },
      { label: 'Evita chegar a recomendar um redesenho completo', value: 'correct', score: 1 },
      { label: 'Interrompe a análise antes de criticar o processo', value: 'interrupts', score: 0 },
      { label: 'Foi escrito depois do redesenho', value: 'after', score: 0 },
    ],
  },
  {
    id: 'listening-self',
    kind: 'self',
    band: 'Autoavaliação · Escuta',
    skill: 'listening',
    prompt: 'Sem legenda, qual situação melhor descreve sua compreensão?',
    options: [
      {
        label: 'Reconheço palavras e frases bem básicas quando falam devagar',
        value: 'a1',
        selfLevel: 0,
      },
      {
        label: 'Entendo recados curtos, claros e sobre assuntos do dia a dia',
        value: 'a2',
        selfLevel: 1,
      },
      {
        label: 'Acompanho os pontos principais de falas claras sobre temas conhecidos',
        value: 'b1',
        selfLevel: 2,
      },
      {
        label: 'Acompanho falas longas e argumentos complexos quando conheço o tema',
        value: 'b2',
        selfLevel: 3,
      },
      {
        label: 'Entendo falas longas mesmo quando ideias ficam implícitas',
        value: 'c1',
        selfLevel: 4,
      },
    ],
  },
  {
    id: 'interaction-self',
    kind: 'self',
    band: 'Autoavaliação · Interação oral',
    skill: 'interaction',
    prompt: 'Ao conversar sem roteiro, o que você consegue fazer com consistência?',
    options: [
      {
        label: 'Troco informações muito simples com ajuda e repetição',
        value: 'a1',
        selfLevel: 0,
      },
      {
        label: 'Lido com trocas curtas e rotineiras sobre assuntos conhecidos',
        value: 'a2',
        selfLevel: 1,
      },
      {
        label: 'Sustento conversas sobre temas familiares e explico opiniões',
        value: 'b1',
        selfLevel: 2,
      },
      {
        label: 'Interajo com espontaneidade e sustento meu ponto de vista',
        value: 'b2',
        selfLevel: 3,
      },
      {
        label: 'Uso o idioma com flexibilidade e precisão em temas complexos',
        value: 'c1',
        selfLevel: 4,
      },
    ],
  },
];

export const QUIZ_OBJECTIVE_COUNT = quizSteps.filter((step) => step.kind === 'objective').length;

export interface QuizResult {
  level: QuizLevel;
  title: string;
  description: string;
  objectiveCorrect: number;
  objectiveTotal: number;
  selfLevel: QuizLevel;
  consistency: 'boa' | 'moderada';
  recommend: string;
  recommendLabel: string;
  recommendReason: string;
}

const LEVELS: QuizLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const RESULT_COPY: Record<QuizLevel, Pick<QuizResult, 'title' | 'description'>> = {
  A1: {
    title: 'Fundamentos iniciais',
    description:
      'Suas respostas indicam que a prioridade é construir estruturas essenciais e segurança em mensagens simples antes de avançar para conversas mais longas.',
  },
  A2: {
    title: 'Base funcional',
    description:
      'Você já lida com linguagem frequente e situações previsíveis. O próximo passo é conectar ideias e responder com menos apoio em contextos reais.',
  },
  B1: {
    title: 'Independência em desenvolvimento',
    description:
      'Você compreende os pontos principais em situações conhecidas e já consegue se comunicar. Agora precisa ampliar precisão, repertório e velocidade de resposta.',
  },
  B2: {
    title: 'Autonomia consistente',
    description:
      'Suas respostas mostram boa autonomia para compreender argumentos e participar de interações mais exigentes. O foco passa a ser nuance, precisão e persuasão.',
  },
  C1: {
    title: 'Proficiência avançada provável',
    description:
      'Há sinais de compreensão avançada e uso flexível do idioma. C1 ainda precisa ser confirmado com produção oral e escrita; este teste rápido não atribui C2.',
  },
};

function selectedOption(step: QuizStep, answers: Map<string, string>): QuizOption | undefined {
  const value = answers.get(step.id);
  return step.options.find((option) => option.value === value);
}

function recommendation(goal: string | undefined, levelIndex: number) {
  if (goal === 'exam') {
    return {
      recommend: 'preparatorio',
      recommendLabel: 'Cursos Preparatórios',
      recommendReason:
        'Seu objetivo é uma certificação; a prova-alvo e o nível de entrada serão confirmados no diagnóstico.',
    };
  }

  if (goal === 'work' && levelIndex >= 2) {
    return {
      recommend: 'executivo',
      recommendLabel: 'Executivo',
      recommendReason:
        'Seu nível provável já permite trabalhar comunicação profissional, reuniões e vocabulário especializado.',
    };
  }

  return {
    recommend: 'academico',
    recommendLabel: 'Acadêmico',
    recommendReason:
      goal === 'work'
        ? 'Antes do inglês profissional avançado, vale consolidar a base e ganhar autonomia de comunicação.'
        : 'A trilha desenvolve compreensão, produção e comunicação para estudo, intercâmbio e situações reais.',
  };
}

export function resolveResult(answerList: QuizAnswer[]): QuizResult {
  const answers = new Map(answerList.map((answer) => [answer.stepId, answer.value]));
  const objectiveSteps = quizSteps.filter((step) => step.kind === 'objective');

  const correctByLevel = new Map<QuizLevel, number>();
  let objectiveCorrect = 0;

  for (const step of objectiveSteps) {
    const correct = selectedOption(step, answers)?.score === 1 ? 1 : 0;
    objectiveCorrect += correct;
    if (step.level) {
      correctByLevel.set(step.level, (correctByLevel.get(step.level) ?? 0) + correct);
    }
  }

  // Faixa bruta por volume de evidência objetiva.
  let objectiveIndex =
    objectiveCorrect <= 1
      ? 0
      : objectiveCorrect === 2
        ? 1
        : objectiveCorrect <= 4
          ? 2
          : objectiveCorrect <= 6
            ? 3
            : 4;
  const rawObjectiveIndex = objectiveIndex;

  // Travas evitam que acertos isolados em itens difíceis (inclusive por acaso)
  // compensem ausência completa de evidência numa faixa anterior.
  if ((correctByLevel.get('A1') ?? 0) + (correctByLevel.get('A2') ?? 0) === 0) {
    objectiveIndex = 0;
  }
  if ((correctByLevel.get('B1') ?? 0) === 0) objectiveIndex = Math.min(objectiveIndex, 1);
  if ((correctByLevel.get('B2') ?? 0) === 0) objectiveIndex = Math.min(objectiveIndex, 2);

  const selfRatings = quizSteps
    .filter((step) => step.kind === 'self')
    .map((step) => selectedOption(step, answers)?.selfLevel)
    .filter((value): value is 0 | 1 | 2 | 3 | 4 => value !== undefined);

  const selfIndex =
    selfRatings.length > 0
      ? Math.round(
          selfRatings.reduce<number>((total, value) => total + value, 0) / selfRatings.length
        )
      : objectiveIndex;

  // Autoavaliação nunca eleva sozinha o resultado. Quando recepção/interação
  // ficam abaixo dos itens escritos, o resultado geral recua no máximo 1 faixa.
  const finalIndex = selfIndex < objectiveIndex ? Math.max(0, objectiveIndex - 1) : objectiveIndex;
  const level = LEVELS[finalIndex];
  const selfLevel = LEVELS[selfIndex];
  const consistency =
    Math.abs(selfIndex - objectiveIndex) <= 1 && rawObjectiveIndex === objectiveIndex
      ? 'boa'
      : 'moderada';

  const profileStep = quizSteps.find((step) => step.id === 'goal');
  const goal = profileStep ? selectedOption(profileStep, answers)?.value : undefined;
  const course = recommendation(goal, finalIndex);

  return {
    level,
    ...RESULT_COPY[level],
    objectiveCorrect,
    objectiveTotal: QUIZ_OBJECTIVE_COUNT,
    selfLevel,
    consistency,
    ...course,
  };
}

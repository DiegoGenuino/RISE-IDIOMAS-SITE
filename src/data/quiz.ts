/**
 * Teste de nível rápido (6 passos).
 * Diagnóstico orientativo — a recomendação final aponta sempre para uma
 * modalidade real da Rise (ver src/data/courses.ts) e é confirmada na aula
 * experimental. Escala de referência: CEFR (A1–C2).
 */

export interface QuizOption {
  label: string;
  /** 0 = não domina · 3 = domina com naturalidade */
  score: 0 | 1 | 2 | 3;
}

export interface QuizStep {
  id: string;
  /** Rótulo mono acima da pergunta. */
  band: string;
  prompt: string;
  hint?: string;
  options: QuizOption[];
}

export const quizSteps: QuizStep[] = [
  {
    id: 'goal',
    band: 'Passo 01 · Objetivo',
    prompt: 'O que você quer destravar com o inglês?',
    options: [
      { label: 'Trabalhar com times internacionais', score: 2 },
      { label: 'Passar numa certificação (Cambridge / Michigan)', score: 3 },
      { label: 'Estudar fora ou fazer intercâmbio', score: 2 },
      { label: 'Conversar sem travar no dia a dia', score: 1 },
    ],
  },
  {
    id: 'grammar-a2',
    band: 'Passo 02 · A2',
    prompt: 'Complete: “She ____ to the office every Monday.”',
    options: [
      { label: 'go', score: 0 },
      { label: 'goes', score: 3 },
      { label: 'going', score: 0 },
      { label: 'is go', score: 0 },
    ],
  },
  {
    id: 'grammar-b1',
    band: 'Passo 03 · B1',
    prompt: 'Complete: “If we ____ the deploy now, the team would be blocked.”',
    options: [
      { label: 'cancel', score: 1 },
      { label: 'cancelled', score: 3 },
      { label: 'will cancel', score: 0 },
      { label: 'have cancelled', score: 0 },
    ],
  },
  {
    id: 'vocab-b2',
    band: 'Passo 04 · B2',
    prompt: 'Numa reunião, “let’s circle back on that” significa:',
    options: [
      { label: 'Vamos retomar esse ponto depois', score: 3 },
      { label: 'Vamos votar agora', score: 0 },
      { label: 'Vamos encerrar a reunião', score: 0 },
      { label: 'Não sei', score: 0 },
    ],
  },
  {
    id: 'grammar-c1',
    band: 'Passo 05 · C1',
    prompt: 'Complete: “Had we known about the outage, we ____ the release.”',
    options: [
      { label: 'would postpone', score: 1 },
      { label: 'would have postponed', score: 3 },
      { label: 'will postpone', score: 0 },
      { label: 'had postponed', score: 0 },
    ],
  },
  {
    id: 'speaking',
    band: 'Passo 06 · Produção oral',
    prompt: 'Como você se sente falando inglês ao vivo, sem preparar antes?',
    options: [
      { label: 'Travo e mudo para o português', score: 0 },
      { label: 'Consigo, mas com muita pausa', score: 1 },
      { label: 'Sustento uma conversa de trabalho', score: 2 },
      { label: 'Falo com naturalidade, incluindo debate', score: 3 },
    ],
  },
];

export interface QuizResult {
  level: string;
  title: string;
  description: string;
  /** id de uma modalidade em src/data/courses.ts */
  recommend: string;
  recommendLabel: string;
}

/** Pontuação máxima possível — usada para a barra de progresso do resultado. */
export const QUIZ_MAX_SCORE = quizSteps.length * 3;

export function resolveResult(score: number): QuizResult {
  if (score <= 4) {
    return {
      level: 'A1 – A2',
      title: 'Base em construção',
      description:
        'Você reconhece estruturas simples, mas ainda depende do português para se apoiar. A trilha começa pela base, com imersão calibrada ao seu ritmo até você sustentar as primeiras conversas sozinho.',
      recommend: 'academico',
      recommendLabel: 'Acadêmico',
    };
  }

  if (score <= 9) {
    return {
      level: 'B1',
      title: 'Comunicação com apoio',
      description:
        'Você se faz entender em situações conhecidas e trava quando o assunto sai do script. O foco agora é ampliar vocabulário e ganhar velocidade de resposta em contextos reais.',
      recommend: 'teens',
      recommendLabel: 'Teens',
    };
  }

  if (score <= 13) {
    return {
      level: 'B2',
      title: 'Autonomia em formação',
      description:
        'Você já participa de conversas de trabalho, mas perde precisão sob pressão. É o ponto ideal para entrar em vocabulário especializado e técnicas de persuasão.',
      recommend: 'executivo',
      recommendLabel: 'Executivo',
    };
  }

  return {
    level: 'C1 – C2',
    title: 'Fluência a certificar',
    description:
      'Seu domínio é alto e o próximo passo é comprovar. A trilha preparatória foca em técnica de prova e simulados para você certificar o nível em Cambridge ou Michigan.',
    recommend: 'preparatorio',
    recommendLabel: 'Cursos Preparatórios',
  };
}

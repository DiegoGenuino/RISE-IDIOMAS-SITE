import type { Audience } from './site';

/**
 * Modalidades da Rise Idiomas.
 * Toda a copy (title / subtitle / description / features) foi extraída
 * literalmente da branch `master` — src/sections/modalities/Modalities.astro.
 * O campo `audiences` é novo e serve apenas ao seletor de perfil da nova home.
 */

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  features: string[];
  audiences: Audience[];
  /** Rótulo mono exibido no cartão (nível/indicador técnico). */
  meta: string;
}

export const courses: Course[] = [
  {
    id: 'executivo',
    title: 'Executivo',
    subtitle: 'Confiança & Destaque.',
    description:
      'Foco em nuances culturais, diplomacia corporativa e técnicas de persuasão em inglês avançado.',
    detail:
      'Esse curso foi desenvolvido para líderes e profissionais que precisam de total confiança em negociações globais. Domine o inglês com foco em nuances culturais e técnicas de persuasão para se destacar no mercado internacional.',
    features: [
      'Nuances culturais e diplomacia corporativa',
      'Técnicas de persuasão em inglês avançado',
      'Preparação para reuniões e apresentações internacionais',
      'Vocabulário especializado para negócios',
    ],
    audiences: ['tech'],
    meta: 'B1 → C2',
  },
  {
    id: 'academico',
    title: 'Acadêmico',
    subtitle: 'Domínio da Linguagem.',
    description: 'Foco no domínio da linguagem técnica para fins escolares e universitários.',
    detail:
      'Pensado exclusivamente para quem busca brilhar no exterior. Esse programa prepara você para a vida internacional, desenvolvendo o domínio da linguagem técnica, produção de artigos e leitura crítica em nível de excelência.',
    features: [
      'Linguagem técnica para fins escolares e universitários',
      'Produção e compreensão de textos acadêmicos',
      'Preparação para intercâmbios e estudos no exterior',
      'Conversação e fluência para o dia a dia acadêmico',
    ],
    audiences: ['tech', 'young'],
    meta: 'A2 → C1',
  },
  {
    id: 'juridico',
    title: 'Jurídico',
    subtitle: 'Precisão Técnica.',
    description:
      'Terminologia jurídica, interpretação de contratos e comunicação profissional para o direito internacional.',
    detail:
      'Criado sob medida para advogados e estudantes de Direito. Aqui você domina a terminologia jurídica essencial, a interpretação de contratos complexos e a comunicação assertiva para atuar com segurança no Direito Internacional.',
    features: [
      'Terminologia jurídica em inglês',
      'Interpretação de contratos internacionais',
      'Comunicação profissional para direito internacional',
      'Redação de documentos jurídicos em inglês',
    ],
    audiences: ['tech'],
    meta: 'B2 → C2',
  },
  {
    id: 'preparatorio',
    title: 'Cursos Preparatórios',
    subtitle: 'Visão Internacional.',
    description: 'Sua proficiência comprovada pelas instituições mais respeitadas do mundo.',
    detail:
      'Projetado para quem precisa certificar seu nível de inglês. Preparamos você com técnicas precisas e simulações reais para garantir sua proficiência nas provas de Cambridge e Michigan, abrindo grandes portas pelo mundo todo.',
    features: [
      'Preparação para Cambridge e Michigan',
      'Proficiência comprovada internacionalmente',
      'Simulados e técnicas de prova avançadas',
      'Material didático oficial das certificadoras',
    ],
    audiences: ['tech', 'young'],
    meta: 'Cambridge · Michigan',
  },
  {
    id: 'teens',
    title: 'Teens',
    subtitle: 'Fluência & Cultura.',
    description:
      'Inglês dinâmico com foco em cultura pop, tecnologia e preparação para o mundo globalizado.',
    detail:
      'Esse programa foi feito para adolescentes que querem se conectar com o mundo de maneira envolvente. Desenvolvemos a fluência explorando cultura pop, tecnologia e temas globais de um jeito dinâmico.',
    features: [
      'Inglês dinâmico com cultura pop e tecnologia',
      'Preparação para o mundo globalizado',
      'Atividades interativas e engajantes',
      'Desenvolvimento de confiança na comunicação',
    ],
    audiences: ['young'],
    meta: '12 – 17 anos',
  },
  {
    id: 'kids',
    title: 'Kids',
    subtitle: 'Lúdico & Natural.',
    description:
      'Metodologia lúdica e interativa para crianças desenvolverem fluência de forma natural e divertida.',
    detail:
      'Desenvolvido com carinho para os pequenos, nosso ensino foca na descoberta. Através de uma abordagem lúdica e 100% interativa, as crianças constroem a fluência de maneira natural, leve e extremamente divertida.',
    features: [
      'Metodologia lúdica e interativa',
      'Fluência desenvolvida de forma natural',
      'Atividades divertidas e educativas',
      'Acompanhamento individualizado do progresso',
    ],
    audiences: ['young'],
    meta: '5 – 11 anos',
  },
];

export function coursesFor(audience: Audience): Course[] {
  return courses.filter((course) => course.audiences.includes(audience));
}

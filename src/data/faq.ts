/**
 * FAQ. Cada resposta é montada a partir de informação já publicada na branch
 * `master` (modalidades, idiomas, certificações, endereço, horários, contacto).
 * Os itens marcados com `pending: true` dependem de confirmação comercial da
 * Rise — o texto atual encaminha para o WhatsApp em vez de afirmar um número.
 */

export interface FaqItem {
  question: string;
  answer: string;
  pending?: boolean;
}

export const faq: FaqItem[] = [
  {
    question: 'Preciso já saber alguma coisa para começar?',
    answer:
      'Não. As trilhas começam do zero e vão até o nível C2. O teste de nível aqui do site indica o ponto de partida em menos de um minuto, e a primeira aula confirma esse diagnóstico antes de definirmos a sua trilha.',
  },
  {
    question: 'Como funcionam as aulas 100% no idioma se eu sou iniciante?',
    answer:
      'O professor calibra o ritmo e o vocabulário ao seu nível — não é imersão sem rede. É justamente a ausência de rota de fuga para o português que quebra o bloqueio de falar, como relatam os nossos alunos do Executivo.',
  },
  {
    question: 'Quais idiomas a Rise ensina?',
    answer:
      'Inglês, espanhol e português. As modalidades Executivo, Acadêmico, Jurídico, Preparatórios, Teens e Kids organizam o conteúdo por objetivo e faixa etária.',
  },
  {
    question: 'A Rise prepara para certificações internacionais?',
    answer:
      'Sim. Os Cursos Preparatórios cobrem Cambridge e Michigan, com simulados, técnicas avançadas de prova e material didático oficial das certificadoras.',
  },
  {
    question: 'As aulas são presenciais ou online?',
    answer:
      'A escola fica na Vila Carrão, em São Paulo, e atende de segunda a sexta das 08:00 às 21:00 e aos sábados das 08:00 às 13:00. Fale com a equipe pelo WhatsApp para confirmar os formatos e horários disponíveis para a sua modalidade.',
    pending: true,
  },
  {
    question: 'Qual é o valor do curso?',
    answer:
      'O investimento varia conforme a modalidade, o formato (turma ou individual) e a frequência semanal. A equipe passa os valores e as condições no WhatsApp, sem compromisso.',
    pending: true,
  },
  {
    question: 'Tem aula experimental?',
    answer:
      'Fale com a equipe pelo WhatsApp para agendar. A conversa serve também para alinhar o seu objetivo — carreira, certificação, intercâmbio ou escola — antes de montar a trilha.',
    pending: true,
  },
];

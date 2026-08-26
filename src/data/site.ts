/**
 * Dados institucionais da Rise Idiomas.
 * Fonte: branch `master` (Location.astro, Footer.astro, CTA.astro, index.astro).
 */

export const WHATSAPP_PHONE = '5511948606841';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export const site = {
  name: 'Rise Idiomas',
  tagline: 'Idiomas para todos',
  email: 'contato@riseidiomas.com.br',
  address: 'Vila Carrão, São Paulo - SP',
  mapsUrl: 'https://maps.app.goo.gl/DaCs2AutkFjybFeV7',
  hours: [
    { days: 'Segunda à Sexta', time: '08:00 - 21:00' },
    { days: 'Sábado', time: '08:00 - 13:00' },
  ],
  languages: ['Inglês', 'Espanhol', 'Português'],
} as const;

export const ctaLinks = {
  english: whatsappLink('Olá, vim pelo site e quero mais informações sobre o curso de inglês.'),
  spanish: whatsappLink('Olá, vim pelo site e quero mais informações sobre o curso de espanhol.'),
  trial: whatsappLink('Olá, vim pelo site e quero agendar uma aula experimental.'),
  plans: whatsappLink('Olá, vim pelo site e quero saber os valores e condições dos planos.'),
} as const;

export const socialLinks = [
  { label: 'Instagram', url: 'https://www.instagram.com/rise.idiomas/' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/riseidiomas/' },
  { label: 'Facebook', url: 'https://www.facebook.com/riseidiomasprep/' },
  { label: 'YouTube', url: 'https://www.youtube.com/@rise.idiomas' },
] as const;

/** Perfis do seletor de público. Controla o realce de conteúdo da página. */
export type Audience = 'tech' | 'young';

export const audiences = [
  {
    id: 'tech' as const,
    label: 'Carreiras Tech',
    short: 'Tech',
    headline: 'O inglês que destrava a sua carreira internacional.',
    sub: 'Daily meetings, code review, entrevista técnica e negociação. Aulas 100% em inglês, focadas no vocabulário que o seu trabalho exige.',
    accent: 'cool' as const,
  },
  {
    id: 'young' as const,
    label: 'Fluência Jovem',
    short: 'Jovens',
    headline: 'O inglês que abre o mundo antes dos 18.',
    sub: 'Cultura pop, tecnologia e temas globais num formato dinâmico. Fluência de verdade para intercâmbio, vestibular e certificação internacional.',
    accent: 'warm' as const,
  },
] as const;

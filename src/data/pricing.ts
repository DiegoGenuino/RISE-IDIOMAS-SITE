import { ctaLinks } from './site';

/**
 * ⚠️ CONTEÚDO PENDENTE — LEIA ANTES DE PUBLICAR
 *
 * A branch `master` não contém nenhuma tabela de preços, valor de mensalidade
 * ou condição comercial. Como inventar valores de um negócio real seria
 * publicar informação falsa, os campos `priceMonthly` / `priceYearly` foram
 * deixados como `null` e a UI renderiza "Sob consulta" + CTA de WhatsApp.
 *
 * Para ativar a matriz de preços transparente descrita no briefing, basta
 * preencher os números abaixo (em BRL, sem símbolo). Toda a UI — alternador
 * mensal/anual, cálculo de desconto e destaque do plano popular — já funciona.
 */

export interface Plan {
  id: string;
  name: string;
  pitch: string;
  /** Mensalidade no ciclo mensal. `null` → renderiza "Sob consulta". */
  priceMonthly: number | null;
  /** Mensalidade equivalente no ciclo anual. `null` → "Sob consulta". */
  priceYearly: number | null;
  highlight?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  /** Itens derivados das modalidades reais descritas na branch `master`. */
  includes: string[];
}

export const billingCycles = [
  { id: 'monthly', label: 'Mensal' },
  { id: 'yearly', label: 'Anual', hint: 'melhor custo por aula' },
] as const;

export type BillingCycle = (typeof billingCycles)[number]['id'];

export const plans: Plan[] = [
  {
    id: 'grupo',
    name: 'Turma',
    pitch: 'Para quem aprende melhor com troca e quer o melhor custo por aula.',
    priceMonthly: null, // TODO: preencher com o valor oficial da Rise
    priceYearly: null, // TODO: preencher com o valor oficial da Rise
    ctaLabel: 'Falar sobre turmas',
    ctaHref: ctaLinks.plans,
    includes: [
      'Aulas conduzidas 100% no idioma',
      'Trilha por nível, do A1 ao C2',
      'Modalidades Kids, Teens e Acadêmico',
      'Acompanhamento de progresso',
    ],
  },
  {
    id: 'individual',
    name: 'Individual',
    pitch: 'Trilha desenhada sobre o seu objetivo — carreira, prova ou intercâmbio.',
    priceMonthly: null, // TODO: preencher com o valor oficial da Rise
    priceYearly: null, // TODO: preencher com o valor oficial da Rise
    highlight: true,
    badge: 'Mais procurado',
    ctaLabel: 'Agendar aula experimental',
    ctaHref: ctaLinks.trial,
    includes: [
      'Tudo do plano Turma',
      'Horário definido por você',
      'Modalidades Executivo e Jurídico',
      'Vocabulário do seu contexto profissional',
      'Preparação para reuniões e entrevistas',
    ],
  },
  {
    id: 'preparatorio',
    name: 'Preparatório',
    pitch: 'Foco total na certificação: Cambridge e Michigan com material oficial.',
    priceMonthly: null, // TODO: preencher com o valor oficial da Rise
    priceYearly: null, // TODO: preencher com o valor oficial da Rise
    ctaLabel: 'Falar sobre certificação',
    ctaHref: ctaLinks.plans,
    includes: [
      'Tudo do plano Individual',
      'Simulados e técnicas de prova',
      'Material didático oficial das certificadoras',
      'Proficiência comprovada internacionalmente',
    ],
  },
];

export function formatPrice(value: number | null): string {
  if (value === null) return 'Sob consulta';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

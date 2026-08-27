import { useMemo, useState } from 'react';
import { QUIZ_MAX_SCORE, quizSteps, resolveResult } from '../../data/quiz';
import { ctaLinks } from '../../data/site';

/**
 * Teste de nível em etapas.
 *
 * Ilha React isolada: todo o estado é local ao componente, portanto responder
 * uma pergunta não re-renderiza nada fora deste cartão. Hidratada com
 * `client:visible` — não custa nada até chegar à viewport.
 */
export default function LevelQuiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  const finished = answers.length === quizSteps.length;
  const score = useMemo(() => answers.reduce((total, value) => total + value, 0), [answers]);
  const result = useMemo(() => resolveResult(score), [score]);

  const progress = finished ? 1 : step / quizSteps.length;

  function answer(value: number) {
    const next = [...answers.slice(0, step), value];
    setAnswers(next);
    if (step < quizSteps.length - 1) setStep(step + 1);
  }

  function back() {
    if (step === 0) return;
    setStep(step - 1);
    setAnswers(answers.slice(0, step - 1));
  }

  function restart() {
    setAnswers([]);
    setStep(0);
  }

  const current = quizSteps[step];

  return (
    <div className="bg-surface shadow-float relative overflow-hidden p-6 sm:p-8">
      {/* Barra de progresso */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className="bg-brand-soft h-1 flex-1 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={quizSteps.length}
          aria-valuenow={finished ? quizSteps.length : step}
          aria-label="Progresso do teste"
        >
          <span
            className="bg-brand block h-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `scaleX(${Math.max(progress, 0.03)})`, width: '100%' }}
          />
        </div>
        <span className="ds-mono text-ink-muted shrink-0">
          {finished ? quizSteps.length : step + 1}/{quizSteps.length}
        </span>
      </div>

      {finished ? (
        <div>
          <span className="ds-mono text-brand">Resultado estimado</span>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="text-ink font-mono text-3xl font-semibold tracking-tight">
              {result.level}
            </span>
            <span className="text-ink-soft text-lg font-semibold">{result.title}</span>
          </div>

          <p className="text-ink-soft mt-4 text-[0.9375rem] leading-relaxed">
            {result.description}
          </p>

          <div className="bg-surface-alt ring-brand-soft/70 mt-6 p-5 ring-1 ring-inset">
            <span className="ds-mono text-ink-muted">Trilha recomendada</span>
            <p className="text-ink mt-2 text-lg font-semibold">{result.recommendLabel}</p>
            <p className="text-ink-soft mt-1 text-sm">
              Pontuação {score} de {QUIZ_MAX_SCORE}. O diagnóstico final é confirmado na aula
              experimental.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={ctaLinks.trial}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand shadow-brand hover:bg-brand-strong inline-flex h-12 cursor-pointer items-center justify-center rounded-sm px-6 text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-px"
            >
              Confirmar meu nível numa aula
            </a>
            <button
              type="button"
              onClick={restart}
              className="text-ink-soft hover:text-brand inline-flex h-12 cursor-pointer items-center justify-center rounded-sm px-4 text-[0.9375rem] font-semibold transition-colors duration-150"
            >
              Refazer teste
            </button>
          </div>
        </div>
      ) : (
        <div>
          <span className="ds-mono text-brand">{current.band}</span>

          <h3 className="text-ink mt-3 text-xl leading-snug font-semibold">{current.prompt}</h3>

          <ul className="mt-6 flex flex-col gap-2">
            {current.options.map((option) => (
              <li key={option.label}>
                <button
                  type="button"
                  onClick={() => answer(option.score)}
                  className="group bg-surface-alt text-ink ring-brand-soft/70 hover:ring-brand flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left text-[0.9375rem] ring-1 transition-[background-color,box-shadow,transform] duration-200 ring-inset hover:-translate-y-px hover:bg-white hover:shadow-xs"
                >
                  <span
                    className="ring-brand-soft group-hover:ring-brand grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 transition-colors duration-200"
                    aria-hidden="true"
                  >
                    <span className="group-hover:bg-brand h-2 w-2 rounded-full bg-transparent transition-colors duration-200" />
                  </span>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>

          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="text-ink-muted hover:text-brand mt-5 cursor-pointer text-sm font-medium transition-colors duration-150"
            >
              ← Voltar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

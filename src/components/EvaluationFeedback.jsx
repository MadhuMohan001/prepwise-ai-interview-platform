import { CheckCircle2, Lightbulb, Target } from 'lucide-react';

const feedbackGroups = [
  { key: 'strengths', label: 'Strengths', Icon: CheckCircle2 },
  { key: 'missingConcepts', label: 'Missing concepts', Icon: Target },
  { key: 'weaknesses', label: 'Areas to improve', Icon: Target },
  { key: 'suggestions', label: 'Suggestions', Icon: Lightbulb },
];

function EvaluationFeedback({ evaluation }) {
  const correctnessColor =
    evaluation.correctness === 'Correct'
      ? 'bg-emerald-50 text-emerald-700'
      : evaluation.correctness === 'Incorrect'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-amber-50 text-amber-800';

  return (
    <section
      aria-labelledby="evaluation-heading"
      aria-live="polite"
      className="mt-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-100/40 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">AI evaluation</p>
          <h2 id="evaluation-heading" className="mt-1 text-lg font-bold text-slate-900">
            Your answer review
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${correctnessColor}`}>
            {evaluation.correctness}
          </span>
          <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700">
            {evaluation.score}/10
          </span>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-5 py-5 sm:grid-cols-2">
        {feedbackGroups.map(({ key, label, Icon }) => (
          <section key={key} aria-labelledby={`${key}-heading`}>
            <h3 id={`${key}-heading`} className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Icon aria-hidden="true" className="text-indigo-500" size={16} />
              {label}
            </h3>
            {evaluation[key].length ? (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
                {evaluation[key].map((item, index) => <li key={`${key}-${index}`}>{item}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">None identified.</p>
            )}
          </section>
        ))}
      </div>

      <section aria-labelledby="improved-answer-heading" className="rounded-xl bg-slate-50 p-4 sm:p-5">
        <h3 id="improved-answer-heading" className="text-sm font-bold text-slate-800">Improved sample answer</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{evaluation.improvedAnswer}</p>
      </section>
    </section>
  );
}

export default EvaluationFeedback;

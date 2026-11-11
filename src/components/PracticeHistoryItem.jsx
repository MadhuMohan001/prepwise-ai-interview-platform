import { ArrowUpRight, Braces, Code2, Coffee, Database } from 'lucide-react';

const topicIcons = { Java: Coffee, React: Code2, SQL: Database, DSA: Braces };

function PracticeHistoryItem({ session, showDetails = false }) {
  const TopicIcon = topicIcons[session.topic] ?? Code2;
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(session.createdAt));
  const scoreColor =
    session.score >= 8 ? 'text-emerald-700 bg-emerald-50' : session.score >= 5 ? 'text-amber-800 bg-amber-50' : 'text-rose-700 bg-rose-50';

  return (
    <li className="border-b border-slate-100 py-4 last:border-b-0 sm:py-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600">
          <TopicIcon aria-hidden="true" size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-800">{session.topic} practice</span>
          <span className="mt-1 block text-xs text-slate-500">
            {session.difficulty} <span aria-hidden="true">·</span> <time dateTime={session.createdAt}>{formattedDate}</time>
          </span>
        </span>
        <span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold ${scoreColor}`}>{session.score}/10</span>
        <ArrowUpRight aria-hidden="true" className="hidden text-slate-300 sm:block" size={16} />
      </div>
      {showDetails && (
        <details className="ml-12 mt-3 sm:ml-14">
          <summary className="w-fit cursor-pointer rounded-md text-xs font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Review question and feedback
          </summary>
          <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Question</h3>
              <p className="mt-1 whitespace-pre-wrap">{session.question}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Your answer</h3>
              <p className="mt-1 whitespace-pre-wrap">{session.answer}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">AI feedback</h3>
              <p className="mt-1 font-medium text-slate-700">
                {session.evaluation.correctness} · {session.score}/10
              </p>
              <p className="mt-1">{session.evaluation.improvedAnswer}</p>
              {session.evaluation.suggestions.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {session.evaluation.suggestions.map((suggestion, index) => (
                    <li key={`${session.id}-suggestion-${index}`}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </details>
      )}
    </li>
  );
}

export default PracticeHistoryItem;

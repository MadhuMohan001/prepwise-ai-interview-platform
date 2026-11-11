import { CalendarDays, Target } from 'lucide-react';

function ProgressSummary({ sessions }) {
  const averageScore = sessions.length
    ? (sessions.reduce((total, session) => total + session.score, 0) / sessions.length).toFixed(1)
    : null;
  const activeDays = new Set(sessions.map((session) => session.createdAt.slice(0, 10))).size;

  return (
    <section aria-labelledby="progress-heading">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">Your progress</p>
          <h2 id="progress-heading" className="mt-1 text-lg font-bold tracking-tight text-slate-900">
            Built from your sessions
          </h2>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <Target aria-hidden="true" size={18} />
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Completed sessions</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{sessions.length}</p>
          <p className="mt-1 text-xs text-slate-500">Saved in this browser</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Average score</p>
          <p className="mt-2 flex items-baseline gap-1 text-2xl font-bold tracking-tight">
            {averageScore ?? '—'}<span className="text-sm font-medium text-slate-500">{averageScore ? '/10' : ''}</span>
          </p>
          {averageScore && (
            <div
              role="progressbar"
              aria-label="Average score"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={Number(averageScore)}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
            >
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Number(averageScore) * 10}%` }} />
            </div>
          )}
          {!averageScore && <p className="mt-1 text-xs text-slate-500">No evaluated sessions yet</p>}
        </article>
        <article className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-medium text-slate-600">Active days</p>
            <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold tracking-tight">
              {activeDays} <span className="text-sm font-medium text-slate-500">{activeDays === 1 ? 'day' : 'days'}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">With a saved session</p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <CalendarDays aria-hidden="true" size={20} />
          </span>
        </article>
      </div>
      <p className="mt-2 text-xs text-slate-500">Your history is stored locally in this browser and is not synced between devices.</p>
    </section>
  );
}

export default ProgressSummary;

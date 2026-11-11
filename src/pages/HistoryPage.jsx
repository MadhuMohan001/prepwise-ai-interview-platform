import { ArrowRight, BookOpen, History, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';
import PracticeHistoryItem from '../components/PracticeHistoryItem.jsx';
import { usePracticeHistory } from '../hooks/usePracticeHistory.js';

function HistoryPage() {
  const { sessions, warning, clearHistory } = usePracticeHistory();
  const [confirmClear, setConfirmClear] = useState(false);

  function handleClearHistory() {
    clearHistory();
    setConfirmClear(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {warning && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {warning}
        </p>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">Your journey</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Practice history</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review your answers, feedback, and scores from previous sessions.
            </p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
            <History aria-hidden="true" size={21} />
          </span>
        </div>
      </div>

      {sessions.length ? (
        <section aria-labelledby="sessions-heading" className="rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-5">
            <div>
              <h2 id="sessions-heading" className="font-bold text-slate-900">Saved sessions</h2>
              <p className="mt-1 text-xs text-slate-500">{sessions.length} stored in this browser</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Sparkles aria-hidden="true" size={13} /> AI evaluations
              </span>
              <Button type="button" variant="secondary" onClick={() => setConfirmClear(true)} className="min-h-9 px-3 py-1.5 text-xs">
                <Trash2 aria-hidden="true" size={14} /> Clear history
              </Button>
            </div>
          </div>
          <ul aria-label="Saved practice sessions">
            {sessions.map((session) => (
              <PracticeHistoryItem key={session.id} session={session} showDetails />
            ))}
          </ul>
          <p className="border-t border-slate-100 py-4 text-xs leading-5 text-slate-500">
            History is stored locally in this browser and is not synchronized between devices.
          </p>
        </section>
      ) : (
        <section className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="max-w-sm">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
              <BookOpen aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Your story starts with one session</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Completed and evaluated sessions will appear here. Your answers stay in this browser.
            </p>
            <Link
              to="/practice"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Start practicing <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </section>
      )}

      {confirmClear && (
        <ConfirmationDialog
          title="Clear all practice history?"
          description="This removes all saved answers and evaluations from this browser. This action cannot be undone."
          confirmLabel="Clear history"
          onCancel={() => setConfirmClear(false)}
          onConfirm={handleClearHistory}
        />
      )}
    </div>
  );
}

export default HistoryPage;

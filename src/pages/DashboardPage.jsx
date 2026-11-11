import { ArrowRight, BookOpenCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DifficultySelector from '../components/DifficultySelector.jsx';
import PracticeHistoryItem from '../components/PracticeHistoryItem.jsx';
import ProgressSummary from '../components/ProgressSummary.jsx';
import TopicCard from '../components/TopicCard.jsx';
import { usePracticeHistory } from '../hooks/usePracticeHistory.js';
import { topics } from '../data/practiceData.js';

function DashboardPage() {
  const [selectedTopic, setSelectedTopic] = useState('React');
  const [difficulty, setDifficulty] = useState('Medium');
  const navigate = useNavigate();
  const { sessions, warning } = usePracticeHistory();

  function startPractice() {
    navigate('/practice', { state: { topic: selectedTopic, difficulty } });
  }

  return (
    <div className="space-y-9">
      {warning && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {warning}
        </p>
      )}
      <section className="relative overflow-hidden rounded-3xl bg-[#20234b] px-6 py-7 text-white sm:px-9 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-20 z-0 size-64 rounded-full border-[36px] border-white/[0.04]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-36 z-0 size-56 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
            <Sparkles aria-hidden="true" size={14} /> Your next opportunity starts here
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to feel confident,<br className="hidden sm:block" /> Alex?
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100/80 sm:text-base">
            Build your interview skills one thoughtful answer at a time. Pick a topic and let&apos;s get started.
          </p>
          <Button
            type="button"
            onClick={startPractice}
            variant="inverse"
            className="mt-6 focus-visible:outline-white"
          >
            Start practicing <ArrowRight aria-hidden="true" size={17} />
          </Button>
        </div>
        <div className="absolute bottom-8 right-10 hidden size-32 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] lg:flex">
          <BookOpenCheck aria-hidden="true" className="text-indigo-200" size={54} strokeWidth={1.2} />
        </div>
      </section>

      <section aria-labelledby="topics-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">Pick your focus</p>
            <h2 id="topics-heading" className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              What would you like to practice?
            </h2>
          </div>
          <span className="text-xs text-slate-500">Choose one topic</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topics.map((topic) => (
            <TopicCard
              key={topic.name}
              topic={topic}
              selected={selectedTopic === topic.name}
              onSelect={() => setSelectedTopic(topic.name)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">Set your pace</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Choose a difficulty</h2>
          </div>
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
          <Button type="button" onClick={startPractice} className="mt-5 w-full sm:w-auto">
            Start {selectedTopic} practice <ArrowRight aria-hidden="true" size={16} />
          </Button>
        </div>
        <ProgressSummary sessions={sessions} />
      </section>

      <section aria-labelledby="recent-heading" className="rounded-2xl border border-slate-200 bg-white px-5 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">
          <div>
            <h2 id="recent-heading" className="text-base font-bold text-slate-900">Recent practice</h2>
            <p className="mt-1 text-xs text-slate-500">A quick look at your latest sessions</p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View all <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
        {sessions.length ? (
          <ul aria-label="Recent practice sessions">
            {sessions.slice(0, 3).map((session) => (
              <PracticeHistoryItem key={session.id} session={session} />
            ))}
          </ul>
        ) : (
          <p className="py-5 text-sm text-slate-500">
            No saved practice sessions yet. Start a session to see your progress here.
          </p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;

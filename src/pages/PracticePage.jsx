import { ArrowLeft, CheckCircle2, CircleHelp, LoaderCircle, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DifficultySelector from '../components/DifficultySelector.jsx';
import EvaluationFeedback from '../components/EvaluationFeedback.jsx';
import TopicCard from '../components/TopicCard.jsx';
import { usePracticeHistory } from '../hooks/usePracticeHistory.js';
import { evaluateAnswer, generateQuestion } from '../services/aiApi.js';
import { topics } from '../data/practiceData.js';

const CLIENT_TIMEOUT_MS = 25_000;

function PracticePage() {
  const location = useLocation();
  const { addSession, warning: historyWarning } = usePracticeHistory();
  const [topic, setTopic] = useState(location.state?.topic ?? 'React');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty ?? 'Medium');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [retryOperation, setRetryOperation] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const requestRef = useRef(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
    };
  }, []);

  async function runRequest(operation, request) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    setPending(operation);
    setError('');
    setRetryOperation('');
    setValidationMessage('');

    try {
      await request(controller.signal);
    } catch (requestError) {
      if (!mountedRef.current) return;
      setError(
        timedOut
          ? 'The request took too long. Please try again.'
          : requestError.name === 'AbortError'
            ? 'The request was cancelled. You can try again.'
            : requestError.message || 'Something went wrong. Please try again.',
      );
      setRetryOperation(operation);
    } finally {
      clearTimeout(timeout);
      inFlightRef.current = false;
      requestRef.current = null;
      if (mountedRef.current) setPending('');
    }
  }

  function runGenerateQuestion() {
    setQuestion('');
    setAnswer('');
    setEvaluation(null);
    return runRequest('generate', async (signal) => {
      const result = await generateQuestion({ topic, difficulty, signal });
      if (mountedRef.current) setQuestion(result.question);
    });
  }

  async function runEvaluation() {
    await runRequest('evaluate', async (signal) => {
      const result = await evaluateAnswer({ topic, difficulty, question, answer: answer.trim(), signal });
      if (!mountedRef.current) return;

      const session = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        topic,
        difficulty,
        question,
        answer: answer.trim(),
        evaluation: result,
        score: result.score,
        createdAt: new Date().toISOString(),
      };
      addSession(session);
      setEvaluation(result);
    });
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (answer.trim().length < 10) {
      setValidationMessage('Please write at least 10 characters before submitting.');
      return;
    }
    if (!evaluation) runEvaluation();
  }

  function practiceAnother() {
    setQuestion('');
    setAnswer('');
    setEvaluation(null);
    setError('');
    setValidationMessage('');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          <ArrowLeft aria-hidden="true" size={16} /> Back to dashboard
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">Practice session</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Let&apos;s work on your answer</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800">
            <Sparkles aria-hidden="true" size={14} /> Gemini AI
          </span>
        </div>
      </div>

      <section aria-labelledby="setup-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4">
          <h2 id="setup-heading" className="text-base font-bold text-slate-900">Set up your question</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a topic and difficulty for this practice.</p>
        </div>
        <fieldset disabled={Boolean(pending)}>
          <legend className="mb-2.5 text-sm font-semibold text-slate-800">Choose a topic</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {topics.map((item) => (
              <TopicCard
                key={item.name}
                topic={item}
                selected={topic === item.name}
                disabled={Boolean(pending)}
                onSelect={() => {
                  setTopic(item.name);
                  setQuestion('');
                  setAnswer('');
                  setEvaluation(null);
                  setError('');
                  setRetryOperation('');
                }}
              />
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-md">
            <DifficultySelector
              value={difficulty}
              disabled={Boolean(pending)}
              onChange={(value) => {
                setDifficulty(value);
                setQuestion('');
                setAnswer('');
                setEvaluation(null);
                setError('');
                setRetryOperation('');
              }}
            />
          </div>
          <Button
            type="button"
            disabled={Boolean(pending)}
            onClick={runGenerateQuestion}
            className="w-full sm:w-auto"
          >
            {pending === 'generate' ? (
              <><LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> Generating...</>
            ) : (
              <><Sparkles aria-hidden="true" size={16} /> Generate question</>
            )}
          </Button>
        </div>
      </section>

      {pending && (
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm font-medium text-indigo-700">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
          {pending === 'generate' ? 'Generating your interview question...' : 'Evaluating your answer...'}
        </p>
      )}
      {error && (
        <div role="alert" aria-live="assertive" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-rose-800">{error}</p>
          {retryOperation && (
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(pending)}
              onClick={retryOperation === 'generate' ? runGenerateQuestion : runEvaluation}
              className="shrink-0 border-rose-200 text-rose-800 hover:bg-rose-100"
            >
              Try again
            </Button>
          )}
        </div>
      )}
      {historyWarning && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {historyWarning}
        </p>
      )}

      {question ? (
        <section aria-labelledby="question-heading" aria-busy={pending === 'evaluate'} className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-100/50 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-indigo-600">AI-generated question</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {topic} <span aria-hidden="true">·</span> {difficulty}
            </span>
          </div>
          <h2 id="question-heading" className="text-xl font-semibold leading-8 tracking-tight text-slate-900">
            {question}
          </h2>

          <form onSubmit={submitAnswer} className="mt-6">
            <label htmlFor="practice-answer" className="mb-2 block text-sm font-semibold text-slate-800">
              Your answer
            </label>
            <textarea
              id="practice-answer"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setValidationMessage('');
                setError('');
                setRetryOperation('');
              }}
              placeholder="Take a moment to structure your thoughts, then write your answer..."
              rows={7}
              minLength={10}
              maxLength={8000}
              required
              disabled={Boolean(pending) || Boolean(evaluation)}
              aria-describedby="answer-guidance answer-count"
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-6 text-slate-800 placeholder:text-slate-500 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <div className="mt-2 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p id="answer-guidance" className="text-xs text-slate-500">At least 10 characters, up to 8,000.</p>
              <span id="answer-count" className="text-xs text-slate-500">{answer.length}/8,000</span>
            </div>
            {validationMessage && <p role="alert" className="mt-2 text-sm text-rose-700">{validationMessage}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              {evaluation && (
                <Button type="button" variant="secondary" onClick={practiceAnother}>
                  Practice another question
                </Button>
              )}
              <Button type="submit" disabled={!answer.trim() || answer.trim().length < 10 || Boolean(pending) || Boolean(evaluation)}>
                {pending === 'evaluate' ? (
                  <><LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> Evaluating...</>
                ) : (
                  <>Submit answer <CheckCircle2 aria-hidden="true" size={16} /></>
                )}
              </Button>
            </div>
          </form>

          {evaluation ? (
            <EvaluationFeedback evaluation={evaluation} />
          ) : (
            <section aria-labelledby="evaluation-heading" className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-500 shadow-sm">
                  <Sparkles aria-hidden="true" size={17} />
                </span>
                <div>
                  <h3 id="evaluation-heading" className="text-sm font-bold text-slate-800">AI feedback appears after submission</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Gemini will provide a score, correctness, strengths, missing concepts, suggestions, and an improved sample answer.
                  </p>
                </div>
              </div>
            </section>
          )}
        </section>
      ) : (
        <section aria-live="polite" className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <div>
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CircleHelp aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-3 font-semibold text-slate-800">Your question will appear here</h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Select a topic and difficulty, then generate a question to begin.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default PracticePage;

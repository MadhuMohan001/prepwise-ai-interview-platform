import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axe from 'axe-core';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { PRACTICE_HISTORY_KEY } from '../services/practiceHistory.js';

const evaluation = {
  score: 8,
  correctness: 'Partially correct',
  strengths: ['The core explanation is accurate.'],
  missingConcepts: ['Mention effect cleanup.'],
  weaknesses: [],
  suggestions: ['Explain the dependency array.'],
  improvedAnswer: 'Use an effect to synchronize with external systems and return cleanup when required.',
};

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  };
}

function renderAt(path = '/') {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('PrepWise application', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('renders a dashboard without fabricated progress or scores', async () => {
    render(<App />);

    await screen.findByRole('heading', { name: /what would you like to practice/i });
    expect(within(screen.getByText('Completed sessions').parentElement).getByText('0')).toBeInTheDocument();
    expect(screen.getByText('No evaluated sessions yet')).toBeInTheDocument();
    expect(screen.getByText(/no saved practice sessions yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/82%/)).not.toBeInTheDocument();
  });

  it('keeps topic and difficulty selections when starting practice', async () => {
    render(<App />);

    await screen.findByRole('heading', { name: /what would you like to practice/i });
    fireEvent.click(screen.getByRole('button', { name: /DSA/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hard/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start DSA practice/i }));

    expect(await screen.findByRole('heading', { name: /let's work on your answer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /DSA/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Hard/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows a loading state and renders an API-generated question', async () => {
    let resolveRequest;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { resolveRequest = resolve; })));
    renderAt('/practice');

    fireEvent.click(await screen.findByRole('button', { name: /generate question/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/generating your interview question/i);
    resolveRequest(jsonResponse({ question: 'How does a React effect synchronize with an external system?' }));

    expect(await screen.findByRole('heading', {
      name: /how does a react effect synchronize with an external system/i,
    })).toBeInTheDocument();
    expect(screen.getByText(/AI-generated question/i)).toBeInTheDocument();
  });

  it('validates empty answers and evaluates successful answers into persistent history', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse({ question: 'When should a React component use an effect?' }))
      .mockResolvedValueOnce(jsonResponse(evaluation)));
    const view = renderAt('/practice');

    fireEvent.click(await screen.findByRole('button', { name: /generate question/i }));
    await screen.findByRole('heading', { name: /when should a react component use an effect/i });

    const answerField = screen.getByRole('textbox', { name: /your answer/i });
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    expect(submitButton).toBeDisabled();
    fireEvent.change(answerField, { target: { value: 'Use an effect to synchronize with an external system.' } });
    fireEvent.click(submitButton);

    expect(await screen.findByRole('heading', { name: /your answer review/i })).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText(/the core explanation is accurate/i)).toBeInTheDocument();

    const saved = JSON.parse(window.localStorage.getItem(PRACTICE_HISTORY_KEY));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      topic: 'React',
      difficulty: 'Medium',
      question: 'When should a React component use an effect?',
      answer: 'Use an effect to synchronize with an external system.',
      evaluation,
      score: 8,
    });
    expect(Date.parse(saved[0].createdAt)).not.toBeNaN();

    fireEvent.click(screen.getAllByRole('link', { name: /practice history/i })[0]);
    expect(await screen.findByText('React practice')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();

    view.unmount();
    const refreshedView = renderAt('/history');
    expect(screen.getByText('React practice')).toBeInTheDocument();
    expect(screen.getByText(/stored in this browser/i)).toBeInTheDocument();
    refreshedView.unmount();
  });

  it('shows a failed API request and lets the user retry', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'The AI service is busy. Please retry.' } }, 429))
      .mockResolvedValueOnce(jsonResponse({ question: 'How does a SQL LEFT JOIN work?' })));
    renderAt('/practice');

    fireEvent.click(await screen.findByRole('button', { name: /generate question/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/ai service is busy/i);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('heading', { name: /how does a sql left join work/i })).toBeInTheDocument();
  });

  it('surfaces network failures and retries without losing the selection', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(jsonResponse({ question: 'What is a Java interface?' })));
    renderAt('/practice');

    fireEvent.click(await screen.findByRole('button', { name: /generate question/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not connect to prepwise/i);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('heading', { name: /what is a java interface/i })).toBeInTheDocument();
  });

  it('aborts an in-flight question request when leaving the practice page', async () => {
    let requestSignal;
    vi.stubGlobal('fetch', vi.fn((_url, options) => {
      requestSignal = options.signal;
      return new Promise((_resolve, reject) => {
        requestSignal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    }));
    const view = renderAt('/practice');

    fireEvent.click(await screen.findByRole('button', { name: /generate question/i }));
    await waitFor(() => expect(requestSignal).toBeDefined());
    view.unmount();

    expect(requestSignal.aborted).toBe(true);
  });

  it('shows an empty history state when there are no saved sessions', async () => {
    renderAt('/history');

    expect(await screen.findByRole('heading', { name: /your story starts with one session/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start practicing/i })).toHaveAttribute('href', '/practice');
  });

  it('clears malformed localStorage data safely and reports the reset in StrictMode', async () => {
    window.localStorage.setItem(PRACTICE_HISTORY_KEY, '{not json');
    window.history.pushState({}, '', '/history');
    render(<StrictMode><App /></StrictMode>);

    expect(await screen.findByRole('status')).toHaveTextContent(/was invalid and has been cleared/i);
    await waitFor(() => expect(window.localStorage.getItem(PRACTICE_HISTORY_KEY)).toBeNull());
    expect(screen.getByRole('heading', { name: /your story starts with one session/i })).toBeInTheDocument();
  });

  it('requires confirmation before clearing saved sessions', async () => {
    window.localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify([{
      id: 'existing',
      topic: 'Java',
      difficulty: 'Easy',
      question: 'What is a Java class?',
      answer: 'A class defines the structure and behavior of objects.',
      evaluation,
      score: 8,
      createdAt: '2026-11-11T00:00:00.000Z',
    }]));
    renderAt('/history');

    fireEvent.click(await screen.findByRole('button', { name: /clear history/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(window.localStorage.getItem(PRACTICE_HISTORY_KEY)).not.toBeNull();

    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /^clear history$/i }));
    await waitFor(() => expect(window.localStorage.getItem(PRACTICE_HISTORY_KEY)).toBe('[]'));
    expect(screen.getByRole('heading', { name: /your story starts with one session/i })).toBeInTheDocument();
  });

  it('supports keyboard dismissal and focus handling in the clear-history dialog', async () => {
    window.localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify([{
      id: 'existing',
      topic: 'Java',
      difficulty: 'Easy',
      question: 'What is a Java class?',
      answer: 'A class defines the structure and behavior of objects.',
      evaluation,
      score: 8,
      createdAt: '2026-11-11T00:00:00.000Z',
    }]));
    renderAt('/history');

    const clearButton = await screen.findByRole('button', { name: /clear history/i });
    clearButton.focus();
    fireEvent.click(clearButton);
    const dialog = screen.getByRole('alertdialog');
    const cancelButton = within(dialog).getByRole('button', { name: /keep history/i });
    const confirmButton = within(dialog).getByRole('button', { name: /^clear history$/i });
    expect(cancelButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(confirmButton).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(clearButton).toHaveFocus();
    expect(window.localStorage.getItem(PRACTICE_HISTORY_KEY)).not.toBeNull();
  });

  it.each(['/', '/practice', '/history'])('has no axe-core WCAG A/AA violations on %s', async (path) => {
    const view = renderAt(path);
    await screen.findByRole('heading', {
      name: path === '/' ? /what would you like to practice/i
        : path === '/practice' ? /let's work on your answer/i
          : /practice history/i,
    });
    const results = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });

    expect(results.violations.map(({ id, help }) => ({ id, help }))).toEqual([]);
    view.unmount();
  });
});

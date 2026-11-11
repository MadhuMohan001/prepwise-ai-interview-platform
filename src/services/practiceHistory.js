export const PRACTICE_HISTORY_KEY = 'prepwise.practice-history.v1';

const validTopics = new Set(['Java', 'React', 'SQL', 'DSA']);
const validDifficulties = new Set(['Easy', 'Medium', 'Hard']);
const validCorrectness = new Set(['Correct', 'Partially correct', 'Incorrect']);
const feedbackFields = ['strengths', 'missingConcepts', 'weaknesses', 'suggestions'];

function validString(value, maxLength = 4000) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function validEvaluation(evaluation) {
  return Boolean(
    evaluation &&
      Number.isInteger(evaluation.score) &&
      evaluation.score >= 0 &&
      evaluation.score <= 10 &&
      validCorrectness.has(evaluation.correctness) &&
      validString(evaluation.improvedAnswer) &&
      feedbackFields.every(
        (field) =>
          Array.isArray(evaluation[field]) &&
          evaluation[field].length <= 8 &&
          evaluation[field].every((item) => validString(item, 500)),
      ),
  );
}

export function isValidPracticeSession(session) {
  return Boolean(
    session &&
      typeof session.id === 'string' &&
      validTopics.has(session.topic) &&
      validDifficulties.has(session.difficulty) &&
      validString(session.question, 1000) &&
      validString(session.answer, 8000) &&
      validEvaluation(session.evaluation) &&
      session.score === session.evaluation.score &&
      typeof session.createdAt === 'string' &&
      Number.isFinite(Date.parse(session.createdAt)),
  );
}

export function readPracticeHistory(storage) {
  let targetStorage;
  let stored;
  try {
    targetStorage = storage ?? globalThis.localStorage;
    stored = targetStorage.getItem(PRACTICE_HISTORY_KEY);
  } catch {
    return { sessions: [], warning: 'Practice history could not be read in this browser.', clearCorrupted: false };
  }

  if (stored === null) return { sessions: [], warning: '', clearCorrupted: false };

  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return {
      sessions: [],
      warning: 'Saved practice history was invalid and will be cleared from this browser.',
      clearCorrupted: true,
    };
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidPracticeSession)) {
    return {
      sessions: [],
      warning: 'Saved practice history was invalid and will be cleared from this browser.',
      clearCorrupted: true,
    };
  }

  return { sessions: parsed, warning: '', clearCorrupted: false };
}

export function writePracticeHistory(sessions, storage) {
  try {
    const targetStorage = storage ?? globalThis.localStorage;
    targetStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}

export function clearPracticeHistory(storage) {
  try {
    const targetStorage = storage ?? globalThis.localStorage;
    targetStorage.removeItem(PRACTICE_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

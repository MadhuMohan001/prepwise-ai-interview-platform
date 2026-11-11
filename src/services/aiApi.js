async function postJson(url, payload, signal) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not connect to PrepWise. Check your connection and try again.', { cause: error });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('PrepWise received an invalid response. Please retry.');
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || 'The request failed. Please try again.');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('PrepWise received an invalid response. Please retry.');
  }

  return data;
}

export function generateQuestion({ topic, difficulty, signal }) {
  return postJson('/api/generate-question', { topic, difficulty }, signal).then((data) => {
    if (typeof data.question !== 'string' || data.question.trim().length < 10) {
      throw new Error('The AI service returned an invalid question. Please retry.');
    }
    return data;
  });
}

export function evaluateAnswer({ topic, difficulty, question, answer, signal }) {
  return postJson('/api/evaluate-answer', { topic, difficulty, question, answer }, signal).then((data) => {
    const validArrays = ['strengths', 'missingConcepts', 'weaknesses', 'suggestions'].every(
      (field) => Array.isArray(data[field]) && data[field].every((item) => typeof item === 'string'),
    );
    if (
      !Number.isInteger(data.score) ||
      data.score < 0 ||
      data.score > 10 ||
      !['Correct', 'Partially correct', 'Incorrect'].includes(data.correctness) ||
      !validArrays ||
      typeof data.improvedAnswer !== 'string' ||
      data.improvedAnswer.trim().length < 10
    ) {
      throw new Error('The AI service returned incomplete feedback. Please retry.');
    }
    return data;
  });
}

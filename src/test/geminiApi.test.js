import { describe, expect, it, vi } from 'vitest';
import { createGeminiHandler } from '../server/gemini.js';

const validEvaluation = {
  score: 8,
  correctness: 'Partially correct',
  strengths: ['Identifies the primary idea.'],
  missingConcepts: ['Mention effect cleanup.'],
  weaknesses: [],
  suggestions: ['Explain when the effect runs.'],
  improvedAnswer: 'Use an effect to synchronize with external systems and return cleanup when needed.',
};

function createResponse(status, payload) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(payload),
  };
}

async function invoke(handler, body, method = 'POST') {
  const res = {
    setHeader: vi.fn(),
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
  await handler({ method, body }, res);
  return res;
}

describe('Gemini serverless handlers', () => {
  it('rejects methods other than POST', async () => {
    const handler = createGeminiHandler('generate', { env: {} });
    const res = await invoke(handler, {}, 'GET');

    expect(res.statusCode).toBe(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
  });

  it('validates topic, difficulty, and answer before making an upstream call', async () => {
    const fetchImpl = vi.fn();
    const handler = createGeminiHandler('evaluate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl,
    });

    const res = await invoke(handler, {
      topic: 'Ruby',
      difficulty: 'Easy',
      question: 'Explain a useful technical concept.',
      answer: 'A sufficiently long answer.',
    });

    expect(res.statusCode).toBe(400);
    expect(res.payload.error.code).toBe('INVALID_TOPIC');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON and over-sized requests', async () => {
    const handler = createGeminiHandler('generate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl: vi.fn(),
    });

    const invalidJson = await invoke(handler, '{invalid');
    const tooLarge = await invoke(handler, {
      topic: 'Java',
      difficulty: 'Easy',
      extra: 'x'.repeat(12_001),
    });

    expect(invalidJson.statusCode).toBe(400);
    expect(invalidJson.payload.error.code).toBe('INVALID_JSON');
    expect(tooLarge.statusCode).toBe(413);
    expect(tooLarge.payload.error.code).toBe('REQUEST_TOO_LARGE');
  });

  it('returns a clear configuration error without exposing secrets', async () => {
    const fetchImpl = vi.fn();
    const handler = createGeminiHandler('generate', { env: {}, fetchImpl });
    const res = await invoke(handler, { topic: 'Java', difficulty: 'Easy' });

    expect(res.statusCode).toBe(503);
    expect(res.payload.error.code).toBe('AI_NOT_CONFIGURED');
    expect(JSON.stringify(res.payload)).not.toContain('GEMINI_API_KEY');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('generates a schema-constrained question using the server-side API key', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createResponse(200, { output_text: JSON.stringify({ question: 'How does a Java interface define a contract?' }) }),
    );
    const handler = createGeminiHandler('generate', {
      env: { GEMINI_API_KEY: 'test-secret' },
      fetchImpl,
    });
    const res = await invoke(handler, { topic: 'Java', difficulty: 'Medium' });

    expect(res.statusCode).toBe(200);
    expect(res.payload.question).toMatch(/interface/);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-goog-api-key': 'test-secret',
          'Api-Revision': '2026-05-20',
        }),
        signal: expect.any(AbortSignal),
      }),
    );
    const upstreamBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(upstreamBody.model).toBe('gemini-3.8-flash');
    expect(upstreamBody.response_format.schema.required).toContain('question');
  });

  it('validates every evaluation field and its score range', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createResponse(200, { output_text: JSON.stringify(validEvaluation) }),
    );
    const handler = createGeminiHandler('evaluate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl,
    });
    const res = await invoke(handler, {
      topic: 'React',
      difficulty: 'Medium',
      question: 'When should a React component use an effect?',
      answer: 'To synchronize the component with an external system.',
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual(validEvaluation);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).response_format.schema.required).toContain('improvedAnswer');
  });

  it('rejects invalid and incomplete model JSON instead of returning a fake score', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createResponse(200, { output_text: JSON.stringify({ ...validEvaluation, score: 14 }) }),
    );
    const handler = createGeminiHandler('evaluate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl,
    });
    const res = await invoke(handler, {
      topic: 'React',
      difficulty: 'Medium',
      question: 'When should a React component use an effect?',
      answer: 'To synchronize the component with an external system.',
    });

    expect(res.statusCode).toBe(502);
    expect(res.payload.error.code).toBe('INVALID_AI_RESPONSE');
    expect(res.payload).not.toHaveProperty('score');
  });

  it('handles malformed upstream JSON and empty model output', async () => {
    const handlerFor = (fetchImpl) => createGeminiHandler('generate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl,
    });
    const input = { topic: 'DSA', difficulty: 'Hard' };

    const malformed = await invoke(handlerFor(vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
    })), input);
    const empty = await invoke(handlerFor(vi.fn().mockResolvedValue(createResponse(200, { output_text: '' }))), input);

    expect(malformed.payload.error.code).toBe('INVALID_AI_RESPONSE');
    expect(empty.payload.error.code).toBe('EMPTY_AI_RESPONSE');
  });

  it('rejects missing evaluation fields and hides network failure details', async () => {
    const invalidEvaluation = await invoke(createGeminiHandler('evaluate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl: vi.fn().mockResolvedValue(
        createResponse(200, { output_text: JSON.stringify({ score: 9, correctness: 'Correct' }) }),
      ),
    }), {
      topic: 'DSA',
      difficulty: 'Hard',
      question: 'How does Dijkstra find a shortest path?',
      answer: 'It repeatedly chooses the nearest unvisited vertex.',
    });
    const unavailable = await invoke(createGeminiHandler('generate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl: vi.fn().mockRejectedValue(new Error('private upstream details')),
    }), { topic: 'SQL', difficulty: 'Easy' });

    expect(invalidEvaluation.statusCode).toBe(502);
    expect(invalidEvaluation.payload.error.code).toBe('INVALID_AI_RESPONSE');
    expect(unavailable.statusCode).toBe(502);
    expect(JSON.stringify(unavailable.payload)).not.toContain('private upstream details');
  });

  it('maps rate limits and request timeouts to safe retryable errors', async () => {
    const input = { topic: 'SQL', difficulty: 'Easy' };
    const rateLimited = await invoke(createGeminiHandler('generate', {
      env: { GEMINI_API_KEY: 'test-key' },
      fetchImpl: vi.fn().mockResolvedValue(createResponse(429, {})),
    }), input);
    const timedOut = await invoke(createGeminiHandler('generate', {
      env: { GEMINI_API_KEY: 'test-key' },
      timeoutMs: 1,
      fetchImpl: vi.fn((_url, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      })),
    }), input);

    expect(rateLimited.statusCode).toBe(429);
    expect(rateLimited.payload.error.code).toBe('RATE_LIMITED');
    expect(timedOut.statusCode).toBe(504);
    expect(timedOut.payload.error.code).toBe('REQUEST_TIMEOUT');
  });
});

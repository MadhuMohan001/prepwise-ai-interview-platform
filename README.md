# PrepWise

PrepWise is an interview-practice app for students and entry-level job seekers. It generates technical questions with Gemini, evaluates written answers, and keeps completed practice sessions in the current browser.

## Problem and audience

Candidates often need a structured way to rehearse technical interview answers and receive actionable feedback. PrepWise provides focused practice for Java, React, SQL, and data structures and algorithms (DSA), with Easy, Medium, and Hard difficulty choices.

## Features

- Dashboard with topic and difficulty selection, saved-session progress, and recent activity.
- Gemini-generated questions and answer evaluations, including a score out of 10, correctness, strengths, missing concepts, weaknesses, suggestions, and an improved sample answer.
- Retryable loading and error states; invalid or incomplete AI output is rejected rather than shown as a score.
- Expandable practice history, confirmation before clearing, and a useful empty state.
- Local history stored in `localStorage`; it is not synchronized between devices.
- Responsive navigation, labeled form controls, visible keyboard focus, and reduced-motion support.

## Technology

- React, JavaScript, and Vite
- Tailwind CSS and Lucide icons
- React Router
- Vercel Node.js serverless functions
- Gemini Interactions REST API (`gemini-3.8-flash`)
- Vitest, React Testing Library, axe-core, and V8 coverage

Gemini is called with server-side `fetch`; no Gemini SDK is required. The model and structured-output examples follow Google's [model documentation](https://ai.google.dev/gemini-api/docs/models), [text generation documentation](https://ai.google.dev/gemini-api/docs/text-generation), and [structured output documentation](https://ai.google.dev/gemini-api/docs/structured-output).

## Screenshots

Screenshots are not included yet.

- Dashboard: `[Add dashboard screenshot]`
- Practice and evaluation: `[Add practice screenshot]`
- History: `[Add history screenshot]`

## Project structure

```text
api/
  generate-question.js       Vercel question-generation function
  evaluate-answer.js         Vercel answer-evaluation function
src/
  components/                Shared layout, form, feedback, and history UI
  data/                      Topic and difficulty choices
  hooks/                     Practice-history React context and hook
  pages/                      Dashboard, practice, and history routes
  server/gemini.js           Shared validation and Gemini REST handler
  services/                  Gemini HTTP client and local history storage
  test/                      UI, API-handler, persistence, and axe tests
vite.config.js               Vite setup and local serverless-function middleware
vercel.json                  SPA route fallback
```

## Run locally

Node.js 22 or later and npm are recommended.

```sh
npm install
Copy-Item .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local` to a Gemini API key you obtained from Google AI Studio. This file is ignored by Git. Never rename it to a `VITE_` variable, include it in frontend code, or commit it.

Then run the full app locally:

```sh
npm run dev
```

The Vite development middleware exposes the same handlers as `/api/generate-question` and `/api/evaluate-answer`, so local practice uses real server-side requests when a key is configured. Without a key, the API responds with a clear configuration error; the UI remains usable and offers a retry. The key is read by Vite's Node-side config and is not exposed as a client environment variable.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite and local API middleware |
| `npm run build` | Create the client production build in `dist/` |
| `npm run preview` | Preview the built client |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run tests and print V8 coverage; also writes `coverage/` |

## Architecture

The browser pages call same-origin `/api/*` endpoints through `src/services/aiApi.js`. Vercel builds the two files in `api/` as serverless functions; local Vite middleware invokes the same handler module for development. `src/server/gemini.js` validates request fields, selects a fixed prompt and JSON schema, sends the secret key only in the upstream server-to-server request, applies a timeout, parses Gemini's structured output, and validates every returned field before responding.

After a valid evaluation, the practice page saves the question, answer, score, full evaluation, topic, difficulty, ID, and timestamp to versioned localStorage. Dashboard progress and history are derived from that stored data. Invalid stored data is cleared with a visible notice. Clearing history requires confirmation.

## Gemini integration and prompt design

The server calls Google's Interactions endpoint with `gemini-3.8-flash` and a JSON response schema. The question prompt constrains topic and difficulty and requests one self-contained question. The evaluation prompt asks for evidence-based correctness and actionable feedback, and explicitly treats the delimited candidate answer as untrusted data rather than instructions. Both prompts require only the schema-conforming response.

Structured output is not treated as trusted: the server parses JSON, checks required keys, enum values, score bounds, array item types/counts, and string lengths. The client also checks the returned shape. Empty, malformed, incomplete, out-of-range, or non-JSON responses become errors; no fallback or sample score is displayed.

## Error handling and privacy

Invalid input, missing configuration, upstream rate limits, upstream failures, malformed responses, network errors, and timeouts have distinct user-facing messages. Requests are disabled while pending, duplicate submissions are guarded, failed requests can be retried, and in-flight browser requests are aborted on unmount. An answer is saved only after a valid evaluation. The Gemini key is never sent to or bundled into the browser.

Practice history contains answers and evaluations and is stored only in this browser profile. Clearing site data removes it; there is no account, cross-device sync, or server-side history. The serverless endpoints are public and have no identity-based rate limiting; configure suitable platform-level abuse controls before a public launch.

## Accessibility

Pages use landmarks, ordered headings, associated labels, keyboard-operable controls, visible focus, live loading/error feedback, and an accessible confirmation alert dialog. Reduced-motion preferences are respected. axe-core WCAG 2.1 A/AA checks run against the Dashboard, Practice, and History pages in jsdom. The test runner reports that jsdom does not implement canvas `getContext`, which limits automated color-contrast computation there; a real-browser contrast audit is still recommended before claiming full WCAG conformance.

## Tests and coverage

Tests use mocked Gemini responses and never need a real key or make paid AI requests. Coverage includes server validation and response failures, topic/difficulty selection, loading, retry, evaluation, local persistence, empty/corrupted history, confirmation, and axe checks.

Latest verification: **24 tests passed** across two files. V8 coverage measured **86.47% statements, 86.64% lines, 92.22% functions, and 83.21% branches**. Shared components measured 97.87% line coverage. Run `npm run test` for watch mode, `npm run test:run` for a single CI-friendly run, or `npm run test:coverage` to reproduce the report.

axe-core 4.14.0 reported zero WCAG 2.1 A/AA violations in a Chromium audit of the three local routes. It returned some contrast checks as incomplete on Dashboard and Practice; the jsdom axe tests disable color-contrast because jsdom lacks the required canvas implementation. These checks do not constitute a complete WCAG conformance assessment.

## Performance check

Routes are lazy-loaded. Compared with the pre-splitting production build, Vite's initial JavaScript entry decreased from 304.62 kB (93.79 kB gzip) to 273.35 kB (87.13 kB gzip), while route chunks are loaded on demand. Lighthouse was not run because no deployment is available; no Lighthouse scores are claimed.

## Vercel deployment

1. Import the Git repository into Vercel and use the Vite preset.
2. Set `GEMINI_API_KEY` as a server environment variable for the intended deployment environments. Do not create a `VITE_GEMINI_API_KEY`.
3. Deploy. Vercel discovers functions under `api/`; `vercel.json` sends unmatched SPA routes to `index.html`.
4. Verify `/`, `/practice`, and `/history`, then test both API endpoints and a complete generate/evaluate/save flow on the deployed URL.
5. Confirm that API responses do not include credentials and that browser assets do not contain the key.

Deployment has not been performed from this workspace; no live URL is claimed. See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for verified and pending items.

## Known limitations and future work

- Vercel credentials, a production Gemini key, and a deployed URL must be supplied/configured by the project owner.
- There is no user account, synchronized history, server-side abuse/rate-limit store, or database.
- AI feedback can be imperfect and should be treated as practice guidance, not an authoritative assessment.
- Complete a real-browser accessibility/color-contrast audit and run Lighthouse against a deployment.
- Future improvements: user accounts and sync, robust rate limiting, session export, additional topics, and a broader browser/device test matrix.

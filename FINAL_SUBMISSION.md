# FlyRank Week 8 capstone submission

## Project brief

PrepWise is an interview-preparation app for students and entry-level job seekers. It generates technical questions and constructive answer feedback for Java, React, SQL, and DSA practice, and stores evaluated sessions locally in the user's browser.

## Application and repository

- **Live application:** `[Not deployed — add a verified Vercel URL after deployment]`
- **GitHub repository:** [MadhuMohan001/prepwise-ai-interview-platform](https://github.com/MadhuMohan001/prepwise-ai-interview-platform)
- **Screenshots:** `[Add dashboard, practice, and history screenshots]`

## Technology stack

React, JavaScript, Vite, Tailwind CSS, React Router, Lucide, Vercel serverless functions, Gemini Interactions REST API (`gemini-3.8-flash`), Vitest, React Testing Library, axe-core, and V8 coverage.

## Main features

- Dashboard with topic and difficulty selection and progress calculated from saved evaluations.
- AI-generated question and answer evaluation flow with retryable loading/error states.
- Feedback includes score out of 10, correctness, strengths, missing concepts, weaknesses, suggestions, and an improved sample answer.
- Browser-local practice history with question/answer detail, empty state, corruption handling, and confirmed clearing.
- Responsive navigation, labeled form controls, visible keyboard focus, and accessible loading/error announcements.

## AI integration

The browser calls `/api/generate-question` and `/api/evaluate-answer`. Vercel serverless handlers make server-to-server requests to Gemini; `GEMINI_API_KEY` is never included in the frontend bundle or exposed through a `VITE_` variable. Mocked tests do not require a key or make paid requests.

## Verification evidence

- `npm run lint`: passed.
- `npm run test`: passed, 24 tests across two files.
- `npm run test:coverage`: 86.47% statements, 86.64% lines, 92.22% functions, 83.21% branches; shared component lines: 97.87%.
- `npm run build`: passed. Initial JS entry: 273.35 kB raw / 87.13 kB gzip; practice and history routes are emitted as separate lazy-loaded chunks.
- Local serverless smoke check without credentials: expected `503 AI_NOT_CONFIGURED`.

## Accessibility and performance

- axe-core 4.14.0 in Chromium reported zero WCAG 2.1 A/AA violations on Dashboard, Practice, and History.
- axe returned some color-contrast checks as incomplete on Dashboard and Practice. The jsdom axe tests disable that rule because jsdom does not provide the required canvas implementation. Complete browser/device contrast and assistive-technology audits remain pending.
- Lighthouse: **not measured**; there is no verified deployment. No performance, accessibility, best-practices, or SEO scores are claimed.
- **Audit-driven improvements:** Browser inspection found white text on a white hero button; the button now has a dedicated inverse variant with readable indigo text. Lazy route loading reduced the initial JS entry from 304.62 kB (93.79 kB gzip) to 273.35 kB (87.13 kB gzip).

## Deployment, fail-safe behavior, and rollback

- **Deployment status:** Not deployed from this workspace. Vercel CLI/authentication and production `GEMINI_API_KEY` configuration are not available here.
- **Checklist status:** Build, tests, local API missing-key behavior, and local axe checks are verified. Production environment, live API, live user flow, Lighthouse, and live URL remain unchecked in [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).
- **Fail-safe behavior:** Input and model output are validated; rate limits, timeouts, malformed responses, and network/configuration failures produce explicit errors. Invalid evaluations are never assigned fallback scores or saved.
- **History privacy:** Practice history is stored in localStorage and is not synchronized between devices.
- **Rollback:** Promote a prior known-good Vercel deployment, or revert the faulty deployment commit with a new `git revert` commit and redeploy. Rotate the Gemini key if exposure is suspected. See the checklist for steps.

## Reflection summary

The main engineering challenge was validating Gemini's structured output across a server-only API boundary. The work reinforced that schema-constrained model output still needs explicit validation, and that request/response contracts should be designed before connecting UI states.

## Owner actions still required

1. Configure `GEMINI_API_KEY` in Vercel's server environment.
2. Deploy and verify the live routes, endpoints, and complete practice flow.
3. Add the verified live URL and screenshots.
4. Complete the remaining accessibility, device, and Lighthouse checks and update this report with measured evidence.

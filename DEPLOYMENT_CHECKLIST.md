# PrepWise deployment checklist

Items are checked only when verified in this workspace. Production-only items remain unchecked until the project owner completes and verifies a Vercel deployment.

## Code and configuration

- [x] Vercel function handlers exist at `api/generate-question.js` and `api/evaluate-answer.js`.
- [x] The shared server handler validates requests and Gemini output.
- [x] `vercel.json` configures the SPA fallback.
- [x] `.env.example` documents `GEMINI_API_KEY` without a real value.
- [x] `.env.local` is ignored by Git; the key is not referenced from React code or a `VITE_` variable.
- [x] Local API route responds with a clear `503 AI_NOT_CONFIGURED` when no key is set.
- [ ] `GEMINI_API_KEY` is configured in the Vercel project for the intended deployment environments.
- [ ] A production Gemini key has been provided and tested. Do not paste it into source files or assessment reports.

## Verification

- [x] `npm run lint` passes.
- [x] `npm run test` passes: 24 tests across two files.
- [x] `npm run test:coverage` passes: 86.47% statements, 86.64% lines, 92.22% functions, and 83.21% branches.
- [x] `npm run build` succeeds.
- [x] API handler tests cover mocked Gemini success, invalid input/output, missing configuration, rate limiting, network errors, and timeouts.
- [x] Mocked application flow covers question generation, evaluation, retry, and history persistence.
- [x] Browser smoke check confirmed the application loads and the local API returns the expected missing-key error.
- [ ] Production API endpoints have been tested on a live Vercel deployment.
- [ ] A complete real-key generate/evaluate/save flow has been verified on the live deployment.
- [x] Error states for missing configuration, invalid requests/responses, rate limits, network errors, and timeouts have automated coverage.

## Accessibility and performance

- [x] axe-core 4.14.0 was run in Chromium on Dashboard, Practice, and History; it reported zero WCAG 2.1 A/AA violations.
- [x] A narrow embedded-browser viewport was checked; no horizontal page overflow was observed.
- [ ] Review axe's incomplete color-contrast checks on Dashboard and Practice in a fully configured browser audit before claiming complete WCAG 2.1 AA conformance.
- [ ] Complete keyboard and screen-reader testing with representative assistive technology.
- [ ] Run Lighthouse against the deployed URL and record actual results. No Lighthouse scores have been measured.
- [ ] Verify desktop and mobile layouts on target physical devices/browsers.

## Release

- [ ] Production deployment is live.
- [ ] The live URL has been opened and verified: `[Add verified Vercel URL]`.
- [ ] Confirm deployed `/`, `/practice`, and `/history` routes load directly.
- [ ] Confirm deployed API endpoints work and never expose the Gemini key.
- [ ] Confirm browser assets contain no secret.
- [x] Rollback procedure is documented below.

## Rollback procedure

1. If a release is unhealthy, open the Vercel project's **Deployments** page and identify the last known-good production deployment.
2. Use Vercel's deployment promotion/rollback action to restore that deployment, then smoke-test the live routes and API.
3. If no suitable previous deployment is available, identify the faulty deployment's Git commit, create a new revert commit with `git revert <commit-sha>`, push it, and deploy that commit. Do not rewrite shared history with a hard reset.
4. If the Gemini key may have been exposed, rotate it in Google AI Studio and update the Vercel server environment variable before redeploying. Never put the replacement key in Git.
5. Record the affected deployment, rollback commit/deployment, and verification results before attempting a new release.

No Vercel deployment or live URL has been verified from this workspace.

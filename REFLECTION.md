# PrepWise reflection

## What was the hardest part and why?

The most involved part was building a trustworthy contract between the browser, the serverless handlers, and Gemini while keeping the API key server-only. A JSON response schema improves consistency, but the model output still needs parsing and field/range validation before it can become a visible score or saved history entry. The browser and server also need to agree on retryable error states and score fields.

## What would I do differently next time?

I would define the request and response schemas, error cases, and local-versus-production runtime behavior before connecting the UI. That contract-first approach makes it easier to test the serverless boundary independently and avoids discovering integration assumptions late.

## What is one surprising thing I learned?

Structured output is a format constraint, not a trust boundary. The application still has to handle empty, malformed, incomplete, and out-of-range model responses explicitly; otherwise an invalid response can look like a real evaluation.

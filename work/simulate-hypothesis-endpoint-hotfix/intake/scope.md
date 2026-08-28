# Corrective increment — simulate-hypothesis frontend dispatch is wired to a route that does not exist

Observed wrong behavior, reported by the human after running the delivered system: on the case
simulation screen (`/cases/{slug}/versions/{version}/simulate`), simulating one hypothesis fails
with an HTTP 404. The browser console shows:

```
POST /v1/cases/{slug}/versions/{version}/simulate-hypothesis 404
{"error":"Not Found","message":"Route POST:/v1/cases/{slug}/versions/{version}/simulate-hypothesis not found","statusCode":404}
```

`frontend/app/src/hooks/use-simulate-hypothesis.ts` dispatches to that nested,
per-case-version URL. Its own header comment documents this as an inference made at delivery
time, before the backend had a live route to read: "POST
/v1/cases/{slug}/versions/{version}/simulate-hypothesis is this task's own inference … Only the
hypothesis name and the assembled subject travel in the body." The task's own `## Notes` says
the same: "The sibling backend initiative has not delivered this route yet; this task's criteria
are demonstrated against the contract's declared shape through a mocked apiFetch, not a live
endpoint."

The sibling backend initiative (`case-simulation-backend`) has since planned and delivered the
real route: flat `POST /v1/simulate/hypothesis`
(`src/src/http/simulate-hypothesis.routes.ts`, `task/case-simulation-pipeline/
simulate-hypothesis-operation`), mirroring the sibling `POST /v1/simulate` for `simulate-case`.
`simulateHypothesisRequestSchema` (`src/src/http/dto/simulate-hypothesis.dto.ts`) requires the
full body `{ case: { slug, version }, subject, requester, hypothesis }` — the case identity and
the requester travel in the body, not the path — and the response is
`{ evidence, evaluation, durations }`, never the narrower `{ evaluation }` shape the frontend
hook currently types.

`work/case-simulation-frontend` and `work/case-simulation-backend` both hold `closure.md`: the
two initiatives were delivered independently and reviewed before either could observe the
other's final wire shape, so this answers to no criterion any task of either plan states.

## What is asked

Fix `use-simulate-hypothesis.ts` (and its call site in `use-case-simulation-cockpit.ts`) so that
simulating a hypothesis on the case simulation screen dispatches the real, delivered backend
route — `POST /v1/simulate/hypothesis`, with the body shape `simulateHypothesisRequestSchema`
requires — instead of the nonexistent nested URL, so the feature works against the live backend.

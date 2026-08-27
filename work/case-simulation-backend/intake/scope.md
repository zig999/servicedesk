# Scope — case-simulation, backend

Source: sections 5 and 7 of `temp/plano-cockpit-simulacao.md` (verbatim below, plus decision D6 from
section 2), handed to `/plan-work` as material — the decomposition, not this document, decides the
actual epics and tasks.

## API (section 5)

### `POST /v1/simulate` — `simulate-case`

Request:
```json
{
  "case": { "slug": "string", "version": 1 },
  "subject": { "type": "string", "attributes": [{ "attribute": "string", "value": "string" }] },
  "requester": "string",
  "consolidation_register": "formal | plain (optional; config default)"
}
```

Response (200):
```json
{
  "case": { "slug": "…", "version": 3, "state": "draft | released" },
  "subject": { "type": "…", "attributes": [ … ] },
  "evidence": [{
    "concept": "…", "capability_name": "…", "capability_version": "…", "origin": "<connector>",
    "result": "ok | unavailable | denied | timeout", "result_detail": "…?",
    "observation": "<string>", "observed_at": "<datetime>", "elapsed_ms": 214
  }],
  "evaluations": [{
    "hypothesis": "…", "position": 1,
    "verdict": "confirmed | refuted | inconclusive", "reason": "no-data | judgment-failure | deadline-exceeded (inconclusive only)",
    "citations": [{ "concept": "…", "field": "…" }],
    "usage": { "input_tokens": 980, "output_tokens": 212 },
    "elapsed_ms": 1600,
    "prompt": "<judgment_input> as materialized, or absent when judgment was never called (no-data)"
  }],
  "resolved": { "outcome": "…", "referral": { "action": "…", "recipient": "…" }, "determining": "…?" },
  "assessment": { "outcome": "…", "referral": { … }, "determining_hypothesis": "…?", "text": "…" },
  "cost": { "calls": 3, "input_tokens": 3100, "output_tokens": 800 },
  "durations": { "collection": 1800, "judgment": 1600, "writing": 700, "total": 4100 },
  "model": "…", "prompt_version": "…", "simulated_at": "<datetime>"
}
```

Errors: unknown case/version (reuse `case-query`'s own errors); invalid subject (same rules as
`diagnose`: `a-subject-carries-at-least-one-attribute`, `a-subject-attribute-is-drawn-from-the-glossary`).
**No error for the version's state** — this is the whole point of a simulation.

### `POST /v1/simulate/hypothesis` — `simulate-hypothesis`

Request: `{ case, hypothesis: "<name in the manifest>", subject, requester }`.

Response: `case`, `subject`, `hypothesis: { name, position, criterion, collects: [concept] }`,
`evidence[]` (only the concepts that hypothesis collects), `evaluation` (single, same shape as
above, with `prompt`), `cost`, `durations: { collection, judgment, total }`, `model`,
`prompt_version`, `simulated_at`. **No `resolved` and no `assessment`.**

Additional error: the named hypothesis is not in the version's manifest.

### Release gate on `diagnose` (decision D6)

`POST /v1/diagnose` over a `draft` version → a named error (e.g. `CaseVersionNotReleasedError`,
following the pattern in `src/src/errors/`), mapped in the frontend's `error-ui-state.ts` if any
screen calls diagnose (none does today). This realizes the rule and scenario that already exist:
`rules/investigation/only-a-released-case-version-is-diagnosed`,
`scenarios/investigation/a-draft-case-version-refuses-diagnosis`.

### Comparative

| | `diagnose` | `simulate-case` | `simulate-hypothesis` |
|---|---|---|---|
| accepts `draft` | no (after D6) | yes | yes |
| writes `investigation` / emits `investigation-completed` | yes | no | no |
| `ok` evidence enters the cache (once one exists) | yes | no | no |
| returns verdicts, citations, evidence, prompt, usage | no | yes | yes |
| real connectors / real LLM | yes | yes | yes (1 judgment call) |
| requires `narrative` / `ticket_ref` | yes / optional | no | no |

## Construction (section 7)

- **One pipeline, two assemblies.** Extract from `run-diagnosis.ts` the stages 1–4 into a function
  that returns the complete record (`evidence`, `evaluations`, `resolved`, `assessment`, `cost`,
  `durations`, prompts). `diagnose` calls it and adds `buildInvestigation` + `writeWithinDeadline`;
  `simulate` calls it and returns the record. **No stage logic duplicated.**
- **`simulate-hypothesis`** = `collectEvidence` restricted to the revision's own `collects`, plus
  `judgeHypotheses` over one required hypothesis. Same code, narrower input. No stages 3–4.
- **No-cache composition (D10)** — a simulation composition/factory (parallel to
  `production-diagnose.factory.ts`) that assembles the observation source without any cache layer,
  today and whenever one exists. A composition, not an `if`.
- **Ports carry usage/duration/prompt (D4, D11)** — `IHypothesisEvaluator` and
  `IAssessmentConsolidator` return `{ result, usage: {input_tokens, output_tokens}, elapsed_ms,
  prompt }`; the Anthropic adapters read `message.usage` and measure elapsed time; the fakes
  (`fake-hypothesis-evaluator.adapter.ts`, `fake-assessment-consolidator.adapter.ts`) return zeros.
  `diagnose` stops writing `UNMEASURED_*` and writes real cost and durations.
  `evidence-collection-stage.ts` writes `elapsed_ms` per concept.
- **DTOs** in zod under `src/src/http/dto/`, following `diagnose.dto.ts` / `test-connector.dto.ts`;
  routes under `src/src/http/`, following `diagnose.routes.ts`.
- **Never write a domain fact into the code that the specification does not hold**: if, while
  implementing, something seems necessary and is not in a node, that is a stop back to
  `/plan-work`, never invented in code.

## Verified facts (repository, re-verified 2026-08-27 — reread before trusting; code may have moved)

- Release gate rule and scenario already exist:
  `knowledge/rules/investigation/only-a-released-case-version-is-diagnosed.md`,
  `knowledge/scenarios/investigation/a-draft-case-version-refuses-diagnosis.md`. No code applies
  it: no state check in `src/src/http/diagnose.controller.ts`, `diagnose.routes.ts`,
  `src/src/investigation/run-diagnosis.ts`, `investigation-factory.ts`, or
  `src/src/case/case-query.service.ts`. No `NotReleased`-shaped class exists in `src/src/errors/`.
- `run-diagnosis.ts` (~184-199) pipeline: `buildSubject → collectEvidence → judgeHypotheses →
  resolveAndNarrow → draftAssessment → buildInvestigation → writeWithinDeadline`. Production
  composition: `src/src/factories/production-diagnose.factory.ts`
  (`TOTAL_DEADLINE_BUDGET_MS = 20_000`).
- Controller `src/src/http/diagnose.controller.ts` writes placeholder zeros today:
  `UNMEASURED_COST`, `UNMEASURED_DURATIONS`.
- `grep -rn "usage" src/src --include=*.ts` (outside spec) → zero hits. Anthropic adapters
  (`anthropic-hypothesis-evaluator.adapter.ts` ~131-136, `anthropic-assessment-consolidator.adapter.ts`
  ~101-106) call `client.messages.create(...)`, read only `message.content`, discard `message.usage`.
  No latency measurement.
- No observation-cache layer exists in the code today (`grep -rl cache src/src` only hits
  `evidence-result.ts` and unrelated relational repositories). D10's "no cache" is, in code, a
  composition to name — no `if` to write today.
- Config in `src/src/config/env.ts`: `EVALUATOR_MODEL`, `EVALUATOR_MAX_TOKENS?`,
  `CONSOLIDATOR_MODEL`, `CONSOLIDATOR_MAX_TOKENS`, `POOL_SIZE`, `DEFAULT_CONSOLIDATION_REGISTER`,
  `PROMPT_VERSION`, `ANTHROPIC_API_KEY`. SDK `@anthropic-ai/sdk`.
- No `/simulate` route exists today.
- The specification was already incremented for this capability (branch `case-simulation`, commit
  `90ee81b`): `knowledge/contracts/investigation/case-simulation.md` (operations `simulate-case`,
  `simulate-hypothesis`), `knowledge/rules/investigation/a-simulation-writes-no-investigation.md`,
  three scenarios under `knowledge/scenarios/investigation/`, `knowledge/domain/investigation/usage.md`
  (new value-object: `input_tokens`, `output_tokens`), `evidence.md` with a new required
  `elapsed_ms`, `evaluation.md` with new optional `usage`, `elapsed_ms`, `prompt` (absent exactly
  when `reason` is `no-data`).
- `work/backend-spec-conformance-corrections` and `work/frontend-spec-conformance-corrections` are
  both fully delivered (`deliver.py --outstanding`: "every task has a record, and every record its
  proof") but not closed (no `closure.md`) — neither blocks this initiative.
- Standard `standards/backend-node-service.yaml` checked against `src` on 2026-08-27: every artifact
  it presupposes (`package.json`, `tsconfig.json`, `eslint.config.js`) already stands in the tree.
  No task in this plan needs to `produces` a standard-presupposed artifact.

## Out of scope here (belongs to the sibling frontend initiative, `case-simulation-frontend`)

Section 6 of the source document (the screen), and decisions D7, D8, D9, D11 as they touch the
frontend. This backend plan does not build a UI.

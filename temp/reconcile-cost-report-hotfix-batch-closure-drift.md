# Reconcile cost report — backend post-closure hotfix batch (23 files)

**Written:** 2026-09-01
**Consumer project:** `siegard-generator` (the Siegard framework itself) — meant to be read cold, in
a fresh Claude Code session over that project, with no access to the conversation that produced it.
Everything needed to evaluate the cost concern is inlined here, including raw per-delegation numbers.
**Origin project:** `servicedeskn1`, a Siegard-managed application (backend at `src/`, frontend at
`frontend/app/`, specification at `knowledge/`). Not itself relevant beyond being the environment
that produced these numbers.
**Related prior reports, same directory:** `temp/reconcile-cost-report-glossary-batch.md`
(2026-08-31, 4-file/2-round batch) and `temp/reconcile-cost-report-investigation-persistence-batch.md`
(2026-09-01, 19-file/1-round batch). Both already cover the mechanism and several friction points in
depth; this one is self-contained but does not re-derive what those reports already established —
where a finding here confirms or extends one of their points, this report says so explicitly instead
of re-arguing it.
**Ask that produced this report:** in the same session, immediately after closing eleven delivered
hotfix initiatives (`/plan-work`'s closure route) and committing the closures, the human asked for
`/reconcile` to be run over the backend "code" drift the trace's `--check` had reported, then asked
for the token cost per invocation to be presented. This report exists so that number, and how it was
produced, survive the conversation.

## 1. What was asked, end to end

Starting point: this session's own `/siegard-status`-style read (run manually, not through the skill)
had already established, via `trace.py --check src`, that 155 drift findings stood over 184 bindings,
of which 154 were `code` class over 23 backend files — the residue of eleven hotfix initiatives
(`backend-comment-assertion-test-sweep`, `consolidation-call-record-chain-hotfix`,
`deadline-arithmetic-clock-read-hotfix`, `durations-total-real-elapsed-hotfix`,
`inconclusive-citation-check-hotfix`, `investigation-ticket-ref-absence-hotfix`,
`investigation-written-at-timing-hotfix`, `judgment-stage-dead-throws-removal-hotfix`,
`no-data-citation-field-omitted-hotfix`, `run-diagnosis-persistence-deadline-hotfix`,
`simulate-hypothesis-deadline-input-hotfix`) delivered and closed earlier in this same session. The
human then asked for `/reconcile` over exactly those 23 files:

```
src/connector-registry/connector-configuration-store.port.ts
src/errors/status-map.ts
src/factories/production-simulate-hypothesis.factory.ts
src/http/diagnose.controller.ts
src/http/dto/register-concept.dto.ts
src/http/dto/simulate-case.dto.ts
src/http/dto/simulate-hypothesis.dto.ts
src/http/simulate-hypothesis.controller.ts
src/investigation/anthropic-assessment-consolidator.adapter.ts
src/investigation/anthropic-hypothesis-evaluator.adapter.ts
src/investigation/assessment-consolidator.port.ts
src/investigation/citation-validation.ts
src/investigation/draft-assessment-text.ts
src/investigation/durations.ts
src/investigation/evidence-collection-stage.ts
src/investigation/fake-assessment-consolidator.adapter.ts
src/investigation/hypothesis-evaluator.port.ts
src/investigation/investigation-pipeline.ts
src/investigation/judgment-stage.ts
src/investigation/run-diagnosis.ts
src/investigation/simulate-hypothesis-pipeline.ts
src/persistence/relational-connector-configuration-store.repository.ts
src/persistence/relational-investigation-store.repository.ts
```

`trace.py --stage` located the full node set the trace currently binds to them (not just the
drifted subset `--check` reports): **158 node-file pairs**, of which 63 were pre-omitted by
`--stage` itself as "current and unowed" (the binding already computes at the file's content as it
stands, with no open finding against it — see the skill's own mechanical subtraction rule), leaving
158 pairs to actually judge across the 23 files.

23 `specification-conformance-reviewer` delegations then ran **in parallel, one per file** (never
per node, never one context over the whole set — same mechanism as both prior reports). Each was
handed its own file's full bound node set and, as candidates, the batch's shared candidate index.
**One delegation had to be re-run from scratch**: the first attempt over
`connector-configuration-store.port.ts` was given a file path resolved one level too shallow
(the orchestrator's path arithmetic mismatched the target source root's own internal `src/`
subdirectory) and returned no judgment at all, just a "file not found" refusal — a wasted
25,809-token delegation, discussed in §4.6.

Two rounds of orchestrator-side rework followed the delegations, both avoidable in principle and
both discussed in §4:

- **19 of 23 saved returns had to be rewritten** because the orchestrator had added a `notes:` field
  to each saved YAML file that is not part of the `conformance-return.json` contract — `trace.py
  --fold` refused all 19 on the first attempt with "Additional properties are not allowed ('notes'
  was unexpected)." This did not cost a fresh delegation (the underlying judgment was intact and
  reusable; only the orchestrator's own transcription needed to be fixed by removing the field), but
  it did cost a full second read-and-rewrite pass over 19 files before the fold could run at all.
- The fold and bind then ran cleanly on the second attempt, no `/analyse` detour needed: of 71
  node-file pairs actually judged, 63 cleared and bound in one act; 8 carried real findings and
  stayed unbound.

## 2. Numbers

Subagent-reported usage, verbatim from each delegation's own completion notification (all 24 ran on
`specification-conformance-reviewer`, which CLAUDE.md pins to **sonnet**, independent of the
session's own model — see §4.4 of the investigation-persistence report for the general point about
model pinning; this project's own pin table differs from that report's example only in which model
each role is pinned to).

| # | File | Bound nodes | Tokens | Tool calls | Wall time |
|---|---|---:|---:|---:|---:|
| 0 | `connector-registry/connector-configuration-store.port.ts` (1st attempt, **failed** — wrong path) | 2 | 25,809 | 5 | 12.0 s |
| 1 | `connector-registry/connector-configuration-store.port.ts` (retry, succeeded) | 2 | 40,112 | 9 | 127.3 s |
| 2 | `errors/status-map.ts` | 2 | 70,935 | 27 | 297.9 s |
| 3 | `factories/production-simulate-hypothesis.factory.ts` | 3 | 34,194 | 4 | 58.6 s |
| 4 | `http/diagnose.controller.ts` | 8 | 49,052 | 13 | 154.6 s |
| 5 | `http/dto/register-concept.dto.ts` | 1 | 69,925 | 16 | 201.5 s |
| 6 | `http/dto/simulate-case.dto.ts` | 16 | 113,451 | 26 | 508.6 s |
| 7 | `http/dto/simulate-hypothesis.dto.ts` | 12 | 64,143 | 12 | 298.3 s |
| 8 | `http/simulate-hypothesis.controller.ts` | 5 | 63,785 | 16 | 289.2 s |
| 9 | `investigation/anthropic-assessment-consolidator.adapter.ts` | 5 | 49,946 | 16 | 154.6 s |
| 10 | `investigation/anthropic-hypothesis-evaluator.adapter.ts` | 10 | 58,466 | 14 | 201.3 s |
| 11 | `investigation/assessment-consolidator.port.ts` | 7 | 39,968 | 4 | 99.4 s |
| 12 | `investigation/citation-validation.ts` | 1 | 57,563 | 18 | 178.0 s |
| 13 | `investigation/draft-assessment-text.ts` | 6 | 36,542 | 4 | 64.4 s |
| 14 | `investigation/durations.ts` | 1 | 28,173 | 5 | 16.0 s |
| 15 | `investigation/evidence-collection-stage.ts` | 1 | 55,805 | 14 | 109.3 s |
| 16 | `investigation/fake-assessment-consolidator.adapter.ts` | 7 | 45,552 | 9 | 138.6 s |
| 17 | `investigation/hypothesis-evaluator.port.ts` | 1 | 55,404 | 12 | 145.4 s |
| 18 | `investigation/investigation-pipeline.ts` | 7 | 66,171 | 12 | 250.7 s |
| 19 | `investigation/judgment-stage.ts` | 21 | 81,975 | 12 | 345.6 s |
| 20 | `investigation/run-diagnosis.ts` | 12 | 74,594 | 13 | 361.1 s |
| 21 | `investigation/simulate-hypothesis-pipeline.ts` | 8 | 69,369 | 14 | 175.7 s |
| 22 | `persistence/relational-connector-configuration-store.repository.ts` | 3 | 43,586 | 12 | 101.2 s |
| 23 | `persistence/relational-investigation-store.repository.ts` | 17 | 82,818 | 11 | 347.6 s |
| — | **Total (24 delegations, incl. the failed one)** | — | **1,377,338** | **298** | 4,636.7 s cumulative / ~508.6 s wall (parallel, longest delegation) |
| — | **Total (23 successful delegations only)** | 158 pairs staged, 71 judged | **1,351,529** | 293 | 4,624.7 s cumulative |

Average per delegation, successful only: **58,762 tokens**, 12.7 tool calls, 201.1 s.
Average per delegation, including the failed retry: **57,389 tokens**, 12.4 tool calls, 193.2 s.
Minimum: 28,173 tokens (`durations.ts`, 1 bound node — the failed retry's 25,809 tokens is lower but
produced no judgment). Maximum: 113,451 tokens (`simulate-case.dto.ts`, 16 bound nodes, the batch's
largest node set and highest tool-call count).

Compare to the prior investigation-persistence batch's own average of 57,080 tokens/delegation across
19 delegations covering 19 files with no failed retries and no rework pass: this batch's per-file
average came in essentially the same (58,762 vs. 57,080, a ~3% difference), despite carrying a
higher-node file (`simulate-case.dto.ts` at 16, vs. that batch's maximum of 21 on
`judgment-stage.ts` — the same file, carrying the same node count, appears in both batches and cost
71,978 tokens there vs. 81,975 tokens here for the identical 21-node set, a ~14% increase run to
run with no code change to that file between the two sessions — see §4.2 for why that specific
comparison is not apples-to-apples).

Outcome, measured against `trace.py --check` on `src/`, before and after:

| | `code` drift findings, 23-file set | Files fully closed |
|---|---:|---:|
| Before | 154 | 0 |
| After | 32 (across 12 files; 143 more suppressed under frontend's `edits_freely`, untouched by this run) | 11 of 23 |

63 of 71 judged node-file pairs bound cleanly; 8 carried real findings and stayed unbound (see §3).
Full detail is in `siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.md`.

## 3. The 8 findings this batch surfaced

Unlike the investigation-persistence batch (21 unresolved findings, several attribution artifacts —
see that report's §4.4), every one of this batch's 8 findings names a specific node and a concrete,
independently checkable defect:

1. `simulate-case.dto.ts` — `assessmentSchema` omits `register`/`usage`/`elapsed_ms`/`prompt`
   (`domain/investigation/assessment`); `evidenceSchema` omits `fields`/`concept_description`
   (`domain/investigation/evidence`) — two findings on one file.
2. `simulate-hypothesis.dto.ts` — verdict literals hardcoded instead of imported from the shared
   `VERDICTS` vocabulary (`domain/investigation/verdict`); `evidenceSchema` omits the same two
   fields as above (`domain/investigation/evidence`) — two findings on one file.
3. `register-concept.dto.ts` — `description` typed `.optional()` though the specification requires
   it and mandates a 422 refusal when absent (`domain/glossary/concept`).
4. `judgment-stage.ts` — `judgmentFailureEvaluation` discards the completed call's own
   usage/elapsed_ms/prompt even though an evaluator call actually ran (`domain/investigation/evaluation`).
5. `relational-investigation-store.repository.ts` — the same three call-record fields are never
   persisted for any evaluation (`domain/investigation/evaluation`).
6. `run-diagnosis.ts` — `written_at` is stamped from a pre-write clock read rather than the store's
   own settle confirmation, for both the first attempt and the retry
   (`rules/investigation/written-at-records-when-the-write-settled`).

Notably, finding #4 and #5 name the *same* node (`domain/investigation/evaluation`) from two
different files, and per the fold's own conservative default (documented in both prior reports'
§4.4), an unattributed finding blocks every node of its own file — but here every finding names its
node explicitly, so no collateral blocking occurred: the 8 unbound pairs are exactly the 8 pairs
with real, individually-evidenced findings, not inflated by attribution gaps. This is the one place
this batch's outcome is cleaner than either prior report's.

## 4. Where the tokens actually went

### 4.1 The dominant, structural cost is 23 (24, counting the failed retry) full-context delegations

Same structural point as both prior reports' own §4.1: each delegation pays its own system-prompt
and tool-schema overhead before a single file byte is read, and this scales linearly with file
count by construction. Nothing here is specific to this batch.

### 4.2 The same file, judged twice across sessions, cost 14% more the second time

`judgment-stage.ts` — 21 bound nodes both times — appears in the investigation-persistence batch
(71,978 tokens, 37 tool calls, 342.1 s) and in this batch (81,975 tokens, 12 tool calls, 345.6 s).
Total tokens rose ~14% while tool calls *fell* by more than half (37 → 12). This is not evidence of
inefficiency in either run; it is evidence that "bound-node count" is a necessary but not sufficient
predictor of cost (as the prior report's own §4.2 already qualifies): the candidate list, the
specific facts a file happens to state beyond its bound nodes, and which parts of a large file a
judge has to re-derive from scratch each time (nothing about a conformance judgment is cached
between reconciliation runs) all vary independently of node count. A judge that opened fewer,
larger reads (this run) landed on a comparable total token cost to one that opened more, smaller
reads (the prior run) — the two runs are not directly comparable as an efficiency trend because the
underlying file's own `judgmentFailureEvaluation` defect (finding #4 above) was only *found* in this
run, meaning this delegation did strictly more analytical work for a similar price, not the same
work for a higher price.

### 4.3 Node-count correlation held loosely, same as the prior batch

The batch's three most expensive delegations by token count — `simulate-case.dto.ts` (113,451 tok,
16 nodes), `relational-investigation-store.repository.ts` (82,818 tok, 17 nodes),
`judgment-stage.ts` (81,975 tok, 21 nodes) — are also three of the four largest node sets in the
batch (the fourth, `simulate-hypothesis.dto.ts` at 12 nodes, cost only 64,143 tokens). But
`durations.ts` (1 node) cost 28,173 tokens for a single-fact judgment, while `hypothesis-evaluator.port.ts`
(also 1 node) cost 55,404 tokens — nearly double — because its delegation had to open one candidate
node and cross-check a sibling adapter file to confirm the type's permissiveness was not masking a
violation (visible in its own `looked_past` text). Same conclusion as both prior reports: bound-node
count is a first-order but not sole predictor.

### 4.4 One delegation failed outright on a path-resolution mismatch, at the orchestrator's cost

The target source root for this project (`src`) contains its own `src/` subdirectory
(`src/src/connector-registry/...`), a detail the orchestrator had already confirmed once via `find`
before writing the first prompt, then mis-transcribed into the delegation's own instructions,
producing a "file not found" refusal that consumed 25,809 tokens and 5 tool calls for zero judgment.
Per the framework's own rule ("a delegation answers once ... the correction is a fresh delegation
with the prompt fixed"), the fix was a second delegation with the full absolute path spelled out
explicitly rather than left to be reconstructed — which is exactly what happened, and which
succeeded. The lesson this run demonstrates operationally: when a target source root's own internal
layout is non-obvious (an extra nesting level, a monorepo alias, a generated subdirectory), stating
the delegation's file path as a full absolute path removes an entire class of failure that a
relative-path-plus-root-concatenation instruction leaves to the delegation's own judgment.

### 4.5 The orchestrator's own transcription introduced a schema violation across 19 of 23 saved returns

This is the most concrete, avoidable friction point unique to this batch. `bin/trace.py --fold`
validates every saved return against `conformance-return.json`
(`additionalProperties: false` — see the schema file itself), which permits exactly `findings`,
`read`, `looked_past`, and `candidates_opened`. The orchestrator, while transcribing each
delegation's free-form prose summary into the saved YAML file, added a `notes:` field to hold
context that did not fit cleanly into the other four keys (a delegation's closing paragraph,
restated for a human reader) — a field the schema does not recognize. `--fold` refused all 19
affected files in one pass with a clear, specific error naming exactly which field was unexpected
in which file, which made the fix mechanical (strip the field, re-run) rather than diagnostic. No
delegation had to be re-run — the underlying judgment was never in question, only the orchestrator's
own serialization of it — but it did cost a full second read of all 19 files plus one more of a
20th (`draft-assessment-text.ts`, which had the same field nested one level deeper, inside a `read`
list item, and needed a targeted edit rather than a blanket strip). This is a pure orchestrator
authoring cost, unmeasured by the harness (same caveat as both prior reports' own §4.6/§4.5 on
synthesis cost), and it is avoidable in a mechanical way: save each return exactly as the delegation
returned it, with no additional keys, rather than re-summarizing it into the same file.

### 4.6 The orchestrator's own synthesis cost is again large and unmeasured

Same structural point as the investigation-persistence report's own §4.6: 23 free-form YAML answers
had to be read in full, and the reconciliation premise (13 file-level `change` one-liners plus a
batch-level summary) had to be authored by hand before the fold could run — none of it counted by
any harness token counter available to this report. This batch's version of that cost is smaller in
absolute terms than the 19-file batch's (fewer nodes overall, a flatter node-to-file ratio, no
node shared across as many files as the persistence batch's most-shared nodes were), but the
schema-violation rework in §4.5 added a second full pass over the same material that would not have
existed had the returns been saved verbatim the first time.

## 5. What this report is not

It does not recommend a specific fix, and it does not rank the friction points above by importance.
§4.1–§4.3 are consequences of the same explicit, reasoned design choices the two prior reports
already document, not oversights specific to this run. §4.4 and §4.5 are narrower, concrete,
avoidable mistakes made by this run's own orchestrator — not the framework's design — and are
reported as such rather than folded into the framework-level discussion the other sections carry.
It is a grounded account of one batch, with numbers, for whoever maintains Siegard to weigh against
the two prior reports and against whatever else is known about `/reconcile`'s design intent.

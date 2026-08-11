---
title: Judgment citation never matched a real field
summary: A live test against the real Anthropic API found the judgment prompt never showed the model
  any field name, so no citation could satisfy the rule that requires one; the fixture's own capability.json
  compounded it by carrying an opaque label instead of a real JSON Schema.
provenance: sha256:1cc4ac5a6c6796987c08ee176b755f3ab0dad25258c2dc2827b70abb0bc34a1d
commit: b24e3871bc586f5cd785c25b14507ad960aa23b6
session: https://claude.ai/code/session_018Wj4kvEQBvTSAQNaZME2ZV
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: the prompt's per-item <evidence> block now carries a fields attribute — the space-separated
    field names the evidence's own producing capability declares — and the system prompt instructs the
    model to copy a citation's field from exactly that list; also tolerates one wrapping markdown code
    fence around the model's JSON answer, observed live against claude-haiku-4-5-20251001
- path: src/investigation/hypothesis-evaluator.port.ts
  effect: EvidenceItem gains declaredFields, the field-name vocabulary constraints/the-judgment-prompt-is-closed's
    amended text admits as a fifth permitted prompt input
- path: src/investigation/citation-validation.ts
  effect: declaredFieldsOf exported, so judgment-stage can resolve the same field-name vocabulary it
    already resolved for validation, once, before the first call instead of only after a decided answer
- path: src/investigation/judgment-stage.ts
  effect: outputSchemasFor's resolution moved earlier, before runIsolatedCall's first evaluate(), and
    toEvidenceItems now takes the resolved schemas and fills each item's declaredFields via
    capabilityOutputSchemaKey/declaredFieldsOf
- path: src/fixtures/capability/capability.json
  effect: both capabilities' output_schema changed from an opaque label ("equipment-status-output") to
    a real serialized JSON Schema with a properties object, so declaredFieldsOf has an actual field name
    to extract
nodes:
- node: constraints/the-judgment-prompt-is-closed
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: implements the constraint's own amended text (analysed and committed immediately before this fix,
    knowledge/constraints/the-judgment-prompt-is-closed.md @ d0dbd98) — the fifth permitted input, each
    evidence item's own declared field names, now enters the closed block as a fields attribute; the
    schema itself, its types and its descriptions still never enter
- node: constraints/judgment-runs-behind-a-port
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: unaffected by this fix — no file gained an import of an HTTP client or provider SDK it did not
    already have; evaluate() is still the one entry through which judgment is invoked
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — the pool/parallel-invocation logic this constrains sits outside runIsolatedCall's
    body, which this fix only reordered internally
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — deadlineGuard's own propagation is untouched; this fix only moved which call happens
    before raceEvaluateAgainstDeadline, not the deadline mechanism itself
- node: contracts/integration/capability-registry
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — outputSchemasFor still resolves through the same ICapabilityQuery the registry
    contract declares; only the point in runIsolatedCall that awaits it moved earlier
- node: domain/integration/capability
  encoded_at:
  - src/fixtures/capability/capability.json
  how: both registrations still declare name, version, nature, both schemas, timeout and connector in
    full; only output_schema's own value changed from a label to the JSON Schema text it always should
    have carried
- node: domain/integration/capability-nature
  encoded_at:
  - src/fixtures/capability/capability.json
  how: unaffected — both capabilities still declare nature "read-only"
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: evaluate() is still exactly this domain-service's one operation, given a hypothesis's criterion
    and its evidence; declaredFields travels inside each evidence item, not as a second parameter, so
    the operation's own shape is unchanged
- node: domain/investigation/verdict
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: unaffected — VERDICTS/Verdict and EvaluationOutcome's three discriminated branches are untouched
    by this fix
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: unaffected — citesADeclaredField's own collects check is not touched by this diff; declaredFieldsOf
    was exported, not changed in behavior
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: the rule's own check (citesADeclaredField) is unchanged; what this fix repairs is the rule's
    practical satisfiability — the model can now see a real field name to cite, and the fixture's
    capability.json now carries a real schema declaredFieldsOf can parse, where before neither was true
    and every citation was structurally invalid by construction
- node: rules/investigation/a-decided-evaluation-cites-evidence
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: unaffected — EvaluationOutcome's confirmed/refuted branches still type citations as a non-empty
    tuple; this fix changes what a citation's field can validly be, not whether one is required
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: unaffected — the inconclusive branch's required reason field is untouched by this diff
- node: rules/investigation/judgment-does-not-infer
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: strengthened rather than weakened — SYSTEM_PROMPT gained an explicit line that a citation's field
    "must be copied exactly from the fields its own item declares — never invented", closing the exact
    failure this fix was written to stop (the model inventing a plausible-sounding field name)
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — raceEvaluateAgainstDeadline's own race logic is untouched
- node: rules/investigation/one-evaluation-per-required-hypothesis
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — the loop over requiresEvaluationOf's own names is untouched by this diff
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  encoded_at:
  - src/fixtures/capability/capability.json
  how: unaffected — both registrations still declare a non-empty output_schema and an integer timeout;
    only output_schema's value changed shape, not its presence
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — this scenario exercises evidence collection's own no-data path, outside runIsolatedCall's
    body
- node: scenarios/investigation/a-foreign-citation-is-refused
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — isStructurallyValid's own call to citation validation is untouched; a citation
    naming a concept outside collects is refused exactly as before
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: unaffected — the deadline-exceeded path through raceEvaluateAgainstDeadline is untouched
---

## What it is

A retroactive record for a fix written live, during end-to-end testing against the real Anthropic
API, outside `/implement-task` — no task of any plan named this fix, so it carries no task pin and
sits outside every delivery root rather than inside one: a delivery node's `kind: implementation`
requires a `task`, and none exists for this. It exists only so `trace.py --bind-record` has something
truthful to read, in place of hand-typing twenty-one node/file pairs again.

## Notes

Two independent bugs, found together in one live test: the judgment prompt never carried a field
name a citation could legally cite (constraints/the-judgment-prompt-is-closed was silent on it until
d0dbd98 amended it, immediately before this commit, with product-owner confirmation per that commit's
own message), and the fixture's own capability.json declared an opaque label as its output_schema
rather than a real JSON Schema, so even a corrected prompt would have had no field to show. Fixing
either alone would have left the other still failing end to end; both are in this one commit because
the live test could not otherwise tell them apart. Confirmed live, twice, against
claude-haiku-4-5-20251001, both fixture hypotheses reaching their expected verdicts; the full suite
(458 tests) passed. This record was written after the fact, by a session that did not write the fix,
specifically so the two-producer separation the rest of this framework's delivery model holds is not
skipped silently here too — every `how` above was reached by rereading the diff and the current files,
not by restating the commit message's own account of itself.

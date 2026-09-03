---
title: 'Review: simulate-hypothesis DTO derives verdict from VERDICTS and widens evidenceSchema'
summary: Coverage, specification conformance, standard conformance and failure diagnosis over derive-verdict-and-widen-evidence-schema's
  delivered change against the current main tree.
reviewed:
- src/http/dto/simulate-hypothesis.dto.ts
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
tasks:
- task/simulate-hypothesis-dto-verdict-evidence-fields/derive-verdict-and-widen-evidence-schema
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/simulate-hypothesis-dto-verdict-evidence-fields-review-suite) passed
    every step (install, typecheck, lint, secret-scan, test); there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: evaluationSchema's three verdict branches derive their z.literal discriminator from the imported
    VERDICTS array (the same pattern EVALUATION_REASONS and EVIDENCE_RESULTS already use in this file),
    not from a literal typed independently in this file.
  state: uncovered
  why: This is a sourcing/structural claim about where the literal comes from, not about what the schema
    accepts. Replacing the three z.literal arguments with independently-typed literals spelling today's
    values would leave every test in the set passing — nothing distinguishes derivation from the imported
    array from a literal that merely coincides with it. Only the resulting behavior (criterion 2) is observable
    to a black-box test, exactly as the proof record's own untested section already discloses.
- criterion: A value of each of the three VERDICTS entries still validates against the corresponding branch
    after the change.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a response whose evaluation carries VERDICTS' first entry as its verdict, on the confirmed
      branch
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a response whose evaluation carries VERDICTS' second entry as its verdict, on the
      refuted branch
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a response whose evaluation carries VERDICTS' third entry as its verdict, on the inconclusive
      branch
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects an evaluation whose verdict is not one of the shared VERDICTS values
- criterion: evidenceSchema requires fields, typed as an array of the field-semantics shape.
  state: partial
  tests:
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects an evidence item missing fields, now that evidenceSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects an evidence item whose fields entry is missing its name
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates an evidence item whose fields entry supplies only a name, leaving type and description
      absent
  why: 'Requiredness, array-ness and the required/optional split are all exercised, but the element attributes''
    declared string typing is not: nothing submits a non-string name, type or description, so typing any
    of them as z.unknown() would still pass every test.'
- criterion: evidenceSchema requires concept_description, typed as a string.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects an evidence item missing concept_description, now that evidenceSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects an evidence item whose concept_description is not a string
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates an evidence item whose concept_description is the empty string, matching a concept
      collected before it declared one
- criterion: A SimulateHypothesisResponseDto value that a validated production simulate-hypothesis call
    actually produces validates against the widened schema with no field stripped or rejected.
  state: partial
  tests:
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a production-shaped response with no field stripped from its evidence or its evaluation
  why: The no-strip half is genuinely exercised via toEqual, but the value is hand-authored by the spec
    file's own fixtures rather than tied to a captured production payload, which is exactly what the task's
    own ADVISORY note said the delivery would need to obtain and point at. The fixture also omits every
    optional field (result_detail, usage, elapsed_ms, prompt), so whether those survive unstripped from
    a real payload is unexercised.
findings:
- pass: conformance
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: usageSchema
  evidence: "const usageSchema = z.object({\n  input_tokens: z.number(),\n  output_tokens: z.number(),\n\
    });"
  cost: domain/investigation/usage declares input_tokens and output_tokens as integers, but the schema
    accepts any number — a fractional token count passes the one boundary meant to validate a provider's
    own usage record.
  correction: validate input_tokens and output_tokens with z.number().int(), matching the integer type
    domain/investigation/usage declares.
- pass: conformance
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: evaluationSchema, elapsed_ms in each discriminated-union branch
  evidence: 'elapsed_ms: z.number().optional(),'
  cost: domain/investigation/evaluation declares elapsed_ms as an integer (milliseconds); the schema admits
    any fractional number.
  correction: validate elapsed_ms with z.number().int() in all three branches.
- pass: conformance
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: evidenceSchema, ttl and elapsed_ms
  evidence: "ttl: z.number(),\n  ...\n  elapsed_ms: z.number(),"
  cost: domain/investigation/evidence declares both ttl and elapsed_ms as integers; the schema accepts
    fractional values for either.
  correction: validate ttl and elapsed_ms with z.number().int().
- pass: conformance
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: durationsSchema
  evidence: "const durationsSchema = z.object({\n  collection: z.number(),\n  judgment: z.number(),\n\
    \  total: z.number(),\n});"
  cost: domain/investigation/durations declares collection, judgment and total as integers (milliseconds);
    the schema accepts fractional values for all three.
  correction: validate collection, judgment and total with z.number().int().
- pass: standard
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: subjectAttributeValueSchema, subjectSchema, caseRefSchema, citationSchema, usageSchema, fieldSemanticsSchema,
    evidenceSchema
  cites: MNT-03
  evidence: 'const subjectAttributeValueSchema = z.object({ attribute: z.string().min(1), value: z.string().min(1)
    }); ...'
  cost: simulate-case.dto.ts already declares byte-identical blocks for all of these. A change to what
    a subject, case reference, citation or evidence item must look like has to be made twice and can silently
    drift apart.
  correction: Extract the shared schemas into one module under src/http/dto and import it from both simulate-hypothesis.dto.ts
    and simulate-case.dto.ts.
- pass: standard
  file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  where: aValidEvidenceItem
  cites: MNT-03
  evidence: 'function aValidEvidenceItem(): Record<string, unknown> { return { concept: ''a-concept'',
    ... }; }'
  cost: simulate-case.dto.spec.ts defines a function of the same name with an identical body; a shape
    change to evidence has to be edited in both spec files or one silently starts asserting a stale shape.
  correction: Move aValidEvidenceItem (and other shared fixture builders) into one shared test-support
    module both spec files import.
reconciliation: siegard-reconcile/simulate-hypothesis-dto-verdict-evidence-fields.md
---

## What it is

Reviews derive-verdict-and-widen-evidence-schema's delivered change: simulate-hypothesis.dto.ts's VERDICTS-derived verdict literals and widened evidenceSchema, plus the test file that proves it.
Coverage, specification conformance (via trace.py --stage --review, folded into siegard-reconcile/simulate-hypothesis-dto-verdict-evidence-fields.md), standard conformance and failure diagnosis all ran; the failures pass found nothing to diagnose since every captured step passed.

## Notes

16 rules were in scope for reading (STK-02 through STK-12, SEC-04, MNT-03, TST-01 through TST-03); 2 findings, both MNT-03 (schema and fixture logic duplicated with simulate-case.dto.ts/.spec.ts).
The rules a tool decides (20 lint rules, 2 secret-scan rules, 2 typecheck rules) ran as steps of the captured run (run/simulate-hypothesis-dto-verdict-evidence-fields-review-suite) and all exited 0.
Coverage found the task's own criterion 1 (the VERDICTS-derivation itself, as opposed to its resulting behavior) structurally unobservable by any black-box test — exactly as the proof record's own untested section discloses — plus two other criteria partial (field-semantics element typing unexercised; the production-shaped test's fixture is hand-authored rather than tied to a captured real payload).
The conformance pass found four contradictions, none introduced by this task: usage, evaluation.elapsed_ms, evidence.ttl/elapsed_ms and all three durations fields are validated as z.number() rather than an integer type, though every one of the corresponding domain nodes (usage, evaluation, evidence, durations) declares them as integers. These pre-date this task's own two widened fields and sit on fields this task did not touch.
The conformance fold cleared 8 node-file bindings and left 4 uncleared (domain/investigation/usage, domain/investigation/evaluation, domain/investigation/evidence, domain/investigation/durations — the four findings above) — see siegard-reconcile/simulate-hypothesis-dto-verdict-evidence-fields.md for the per-node judgment.
This review does not re-examine the other four live corrective initiatives' own files, or files whose drift predates this batch and were already read by the prior `review-change: all 9 corrective batch tasks` review (4f885cf) — those stand on their own record.

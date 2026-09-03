---
contract_version: siegard-reconcile/3
title: simulate-hypothesis DTO derives verdict from VERDICTS and widens evidenceSchema
summary: derive-verdict-and-widen-evidence-schema derives evaluationSchema's three verdict branch discriminators
  from the imported VERDICTS array instead of independent literals, and widens evidenceSchema to require
  fields and concept_description, matching domain/investigation/verdict and domain/investigation/evidence.
target: backend
files:
- path: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  change: 'Proof: new tests asserting each of the three VERDICTS entries still validates against its corresponding
    branch, that an out-of-vocabulary verdict is still refused, and that the two newly-required evidence
    fields are required, correctly typed, and admit the honest-empty readings; plus a production-shaped
    no-strip test.'
- path: src/http/dto/simulate-hypothesis.dto.ts
  change: Imports VERDICTS and destructures CONFIRMED_VERDICT/REFUTED_VERDICT/INCONCLUSIVE_VERDICT from
    it; evaluationSchema's three discriminated-union branches now use these constants instead of independently-typed
    literals. Adds a local fieldSemanticsSchema and widens evidenceSchema with two new required fields
    (fields, concept_description), mirroring simulate-case.dto.ts's own widening.
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/http/dto/simulate-hypothesis.dto.ts: held at simulateHypothesisRequestSchema and simulateHypothesisResponseSchema,\
    \ lines 21-26 and 98-102 — export const simulateHypothesisResponseSchema = z.object({\n  evidence:\
    \ z.array(evidenceSchema).readonly(),\n  evaluation: evaluationSchema,\n  durations: durationsSchema,\n\
    });\n"
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/citation
  conforms: true
  how: "src/http/dto/simulate-hypothesis.dto.ts: held at citationSchema, lines 30-33 — const citationSchema\
    \ = z.object({\n  concept: z.string().min(1),\n  field: z.string().min(1).optional(),\n});\n"
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/durations
  conforms: false
  how: "src/http/dto/simulate-hypothesis.dto.ts, durationsSchema, lines 92-96: const durationsSchema =\
    \ z.object({\n  collection: z.number(),\n  judgment: z.number(),\n  total: z.number(),\n});\n — domain/investigation/durations\
    \ declares collection, judgment and total as integers (milliseconds); the schema accepts fractional\
    \ values for all three."
  observed_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evaluation
  conforms: false
  how: 'src/http/dto/simulate-hypothesis.dto.ts, evaluationSchema, elapsed_ms in each discriminated-union
    branch, lines 48, 56, 65: elapsed_ms: z.number().optional(), — domain/investigation/evaluation declares
    elapsed_ms as an integer (milliseconds); the schema admits any fractional number.'
  observed_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/http/dto/simulate-hypothesis.dto.ts: held at line 62, via the EVALUATION_REASONS import —
    reason: z.enum(EVALUATION_REASONS),'
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evidence
  conforms: false
  how: "src/http/dto/simulate-hypothesis.dto.ts, evidenceSchema, ttl and elapsed_ms, lines 81 and 87:\
    \ ttl: z.number(),\n  ...\n  elapsed_ms: z.number(),\n — domain/investigation/evidence declares both\
    \ ttl and elapsed_ms as integers; the schema accepts fractional values for either."
  observed_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: 'src/http/dto/simulate-hypothesis.dto.ts: held at line 83, via the EVIDENCE_RESULTS import — result:
    z.enum(EVIDENCE_RESULTS),'
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/http/dto/simulate-hypothesis.dto.ts: held at subjectSchema, lines 11-14 — const subjectSchema
    = z.object({ type: z.string().min(1), attributes: z.array(subjectAttributeValueSchema).min(1) });'
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'src/http/dto/simulate-hypothesis.dto.ts: held at subjectAttributeValueSchema, lines 6-9 — const
    subjectAttributeValueSchema = z.object({ attribute: z.string().min(1), value: z.string().min(1) });'
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/usage
  conforms: false
  how: "src/http/dto/simulate-hypothesis.dto.ts, usageSchema, lines 35-38: const usageSchema = z.object({\n\
    \  input_tokens: z.number(),\n  output_tokens: z.number(),\n});\n — domain/investigation/usage declares\
    \ input_tokens and output_tokens as integers, but the schema accepts any number — a fractional token\
    \ count passes the one boundary meant to validate a provider's own usage record."
  observed_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'src/http/dto/simulate-hypothesis.dto.ts: held at lines 4 and 40, via the VERDICTS import and destructure
    — import { VERDICTS } from ''../../investigation/verdict.js'';

    const [CONFIRMED_VERDICT, REFUTED_VERDICT, INCONCLUSIVE_VERDICT] = VERDICTS;

    '
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/http/dto/simulate-hypothesis.dto.ts: held at line 13 — attributes: z.array(subjectAttributeValueSchema).min(1),'
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
unbound:
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/simulate-hypothesis-dto-verdict-evidence-fields.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/investigation/verdict,
  domain/investigation/evidence were read on every file and answered for, and bound from nowhere here
  — a binding this record writes is one the trace already held.

  Candidates: 13 opened across 2 of 2 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/simulate-hypothesis-dto-verdict-evidence-fields.returns/`, which are the evidence behind every entry above.

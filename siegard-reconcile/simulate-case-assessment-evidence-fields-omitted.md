---
contract_version: siegard-reconcile/3
title: simulate-case response states the assessment call-record and the evidence snapshot
summary: widen-simulate-case-response-schema widens simulate-case.dto.ts's assessmentSchema and evidenceSchema
  to require register, usage, elapsed_ms, prompt, fields and concept_description, matching domain/investigation/assessment
  and domain/investigation/evidence, and proves it with a new/updated test file.
target: backend
files:
- path: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  change: 'Proof: new tests asserting each of the six newly-required fields is required and correctly
    typed, that the honest-empty readings (empty fields array, empty concept_description) still validate,
    and that a production-shaped value validates intact with no field stripped; two pre-existing tests''
    shared fixtures updated so the widening does not regress them.'
- path: src/http/dto/simulate-case.dto.ts
  change: Imports CONSOLIDATION_REGISTERS. Adds a new local fieldSemanticsSchema (name required, type
    and description optional). Widens assessmentSchema with four new required fields (register, usage,
    elapsed_ms, prompt) and evidenceSchema with two new required fields (fields, concept_description),
    reusing existing shared shapes for the enum, the usage record and field semantics.
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at simulateCaseRequestSchema (lines 21-25) and simulateCaseResponseSchema
    (lines 124-131) — export const simulateCaseRequestSchema = z.object({ case: caseRefSchema, subject:
    subjectSchema, requester: z.string().min(1) });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/assessment
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at assessmentSchema, lines 100-109 — const assessmentSchema
    = z.object({ outcome: z.string().min(1), referral: referralSchema, determining_hypothesis: z.string().min(1).optional(),
    text: z.string().min(1), register: z.enum(CONSOLIDATION_REGISTERS), usage: usageSchema, elapsed_ms:
    z.int(), prompt: z.string() });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/citation
  conforms: false
  how: 'src/__tests__/unit/http/dto/simulate-case.dto.spec.ts, the second `it` block, lines 52-63: "validates
    a confirmed evaluation''s citation that carries no field key at all..." ... { hypothesis: ''a-hypothesis'',
    verdict: ''confirmed'', citations: [{ concept: ''a-concept'' }] } ... expect(result.success).toBe(true);
    — This certifies as correct a simulation response where a confirmed hypothesis''s citation carries
    no field — no machine-checkable pointer into the evidence that grounded the verdict, exactly the traceability
    domain/investigation/citation exists to guarantee for confirmed and refuted verdicts.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/cost
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at costSchema, lines 111-115 — const costSchema = z.object({
    calls: z.number(), input_tokens: z.number(), output_tokens: z.number() });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/durations
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at durationsSchema, lines 117-122 — const durationsSchema
    = z.object({ collection: z.number(), judgment: z.number(), writing: z.number().optional(), total:
    z.number() });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/evaluation
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, usage/elapsed_ms/prompt in all three branches of evaluationSchema,\
    \ lines 44-46, 52-54 and 61-63: usage: usageSchema.optional(),\n  elapsed_ms: z.number().optional(),\n\
    \  prompt: z.string().optional(),\n — domain/investigation/evaluation states usage, elapsed_ms and\
    \ prompt are 'present exactly when a call happened, absent when reason `no-data` means judgment was\
    \ never called at all' — no-data is a reason an inconclusive evaluation alone can carry, so a confirmed\
    \ or a refuted evaluation always had a call happen and should always carry the three; marking them\
    \ optional on every branch lets a response validate that the domain model rules out."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at the inconclusive branch of evaluationSchema, line 59
    — reason: z.enum(EVALUATION_REASONS),'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/evidence
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at evidenceSchema, lines 73-87 — const evidenceSchema
    = z.object({ concept: z.string().min(1), inputs: z.string(), observation: z.string(), observed_at:
    z.string().min(1), ttl: z.number(), origin: z.string(), result: z.enum(EVIDENCE_RESULTS), result_detail:
    z.string().optional(), capability_name: z.string(), capability_version: z.string(), elapsed_ms: z.number(),
    fields: z.array(fieldSemanticsSchema).readonly(), concept_description: z.string() });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at evidenceSchema.result, line 80 — result: z.enum(EVIDENCE_RESULTS),'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at subjectSchema, lines 11-14 — const subjectSchema =
    z.object({ type: z.string().min(1), attributes: z.array(subjectAttributeValueSchema).min(1) });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at subjectAttributeValueSchema, lines 6-9 — const subjectAttributeValueSchema
    = z.object({ attribute: z.string().min(1), value: z.string().min(1) });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/usage
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at usageSchema, lines 34-37 — const usageSchema = z.object({
    input_tokens: z.number(), output_tokens: z.number() });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/verdict
  conforms: false
  how: 'src/http/dto/simulate-case.dto.ts, evaluationSchema''s discriminated union, lines 42, 50 and 58:
    verdict: z.literal(''confirmed'') ... verdict: z.literal(''refuted'') ... verdict: z.literal(''inconclusive'')
    — the verdict vocabulary already has one canonical home — the VERDICTS constant at src/investigation/verdict.ts,
    which src/investigation/evaluation.ts and the adapters already import — and this schema re-derives
    the same three strings as inline literals instead of importing it, the same way EVALUATION_REASONS,
    EVIDENCE_RESULTS and CONSOLIDATION_REGISTERS are imported a few lines above and below it; if domain/investigation/verdict''s
    value set ever changes, nothing forces this file to change with it, so the response schema can silently
    accept or reject the wrong set of verdicts.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/knowledge/referral
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at referralSchema, lines 89-92 — const referralSchema
    = z.object({ action: z.string().min(1), recipient: z.string().min(1) });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at resolvedOutcomeSchema, lines 94-98 — const resolvedOutcomeSchema
    = z.object({ outcome: z.string().min(1), referral: referralSchema, determining: z.string().min(1).optional()
    });'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at subjectSchema.attributes, line 13 — attributes: z.array(subjectAttributeValueSchema).min(1),'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
unbound:
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/simulate-case-assessment-evidence-fields-omitted.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/investigation/assessment,
  domain/investigation/evidence were read on every file and answered for, and bound from nowhere here
  — a binding this record writes is one the trace already held.

  Candidates: 18 opened across 2 of 2 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/simulate-case-assessment-evidence-fields-omitted.returns/`, which are the evidence behind every entry above.

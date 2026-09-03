---
title: 'Review: simulate-case response states the assessment call-record and the evidence snapshot'
summary: Coverage, specification conformance, standard conformance and failure diagnosis over widen-simulate-case-response-schema's
  delivered change against the current main tree.
reviewed:
- src/http/dto/simulate-case.dto.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
tasks:
- task/simulate-case-assessment-evidence-fields-omitted/widen-simulate-case-response-schema
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/simulate-case-assessment-evidence-fields-omitted-review-suite) passed
    every step (install, typecheck, lint, secret-scan, test); there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: assessmentSchema requires register, typed as the consolidation-register enum.
  state: partial
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment missing register, now that assessmentSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment whose register is not one of the consolidation-register enum values
  why: domain/knowledge/consolidation-register states two values, formal and plain; nothing in the set
    submits register 'plain', so a schema narrowed to the single literal 'formal' would pass every test
    while rejecting a register the enum admits.
- criterion: assessmentSchema requires usage, typed as the usage shape (input_tokens, output_tokens).
  state: partial
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment missing usage, now that assessmentSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment whose usage carries no output_tokens, since usage keeps the shared usage
      shape
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment whose usage is not an object, since usage keeps the shared usage shape
  why: 'No test submits a usage carrying output_tokens but no input_tokens, so input_tokens''s own requiredness
    is exercised only incidentally by the production-shaped test''s deep equality. Neither member''s integer
    typing is exercised: no test submits a non-integer input_tokens or output_tokens.'
- criterion: assessmentSchema requires elapsed_ms, typed as an integer.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment missing elapsed_ms, now that assessmentSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment whose elapsed_ms is not an integer
- criterion: assessmentSchema requires prompt, typed as a string.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment missing prompt, now that assessmentSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an assessment whose prompt is not a string
- criterion: evidenceSchema requires fields, typed as an array of the field-semantics shape.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an evidence item missing fields, now that evidenceSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an evidence item whose fields entry is missing its name
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: validates an evidence item whose fields is an empty array, matching a concept whose capability
      never resolved
- criterion: evidenceSchema requires concept_description, typed as a string.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an evidence item missing concept_description, now that evidenceSchema requires it
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects an evidence item whose concept_description is not a string
- criterion: A SimulateCaseResponseDto value that a validated production simulate-case call actually produces
    validates against the widened schema with no field stripped or rejected.
  state: partial
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: validates a production-shaped response with no field stripped from its assessment or its evidence
  why: The no-strip half is asserted only over assessment and evidence[0] — cost, durations, resolved
    and the evaluations entries are held by result.success alone, so a field stripped from any of them
    would go undetected. The value is hand-authored in the spec file rather than tied to the SimulateCaseResponseDto
    type or the production call path, so nothing ensures the fixture matches what a real producer actually
    emits.
findings:
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: evaluationSchema's discriminated union (three verdict literal branches)
  evidence: 'verdict: z.literal(''confirmed'') ... verdict: z.literal(''refuted'') ... verdict: z.literal(''inconclusive'')'
  cost: the verdict vocabulary already has one canonical home — the VERDICTS constant — and this schema
    re-derives the same three strings as inline literals instead of importing it, the same way EVALUATION_REASONS/EVIDENCE_RESULTS/CONSOLIDATION_REGISTERS
    are imported a few lines above and below it; if the value set ever changes, nothing forces this file
    to change with it.
  correction: import VERDICTS from '../../investigation/verdict.js' and drive the discriminated union's
    three literal branches from it.
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: usage/elapsed_ms/prompt in all three branches of evaluationSchema
  evidence: "usage: usageSchema.optional(),\n  elapsed_ms: z.number().optional(),\n  prompt: z.string().optional(),"
  cost: domain/investigation/evaluation states usage, elapsed_ms and prompt are present exactly when a
    call happened, absent only when reason is no-data — a reason only an inconclusive evaluation can carry.
    Marking them optional on the confirmed and refuted branches too lets a response validate that the
    domain model rules out.
  correction: drop .optional() from usage, elapsed_ms and prompt on the confirmed and refuted branches,
    and keep them required on the inconclusive branch except where reason is 'no-data'.
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  where: the second test ("validates a confirmed evaluation's citation that carries no field key at all...")
  evidence: '{ hypothesis: ''a-hypothesis'', verdict: ''confirmed'', citations: [{ concept: ''a-concept''
    }] } ... expect(result.success).toBe(true);'
  cost: This certifies as correct a simulation response where a confirmed hypothesis's citation carries
    no field — no machine-checkable pointer into the evidence that grounded the verdict, exactly the traceability
    domain/investigation/citation exists to guarantee for confirmed and refuted verdicts.
  correction: 'narrow field''s optionality back to the no-data citation alone: keep it required where
    the citation''s own evaluation verdict is confirmed or refuted, per domain/investigation/citation''s
    own Description and its decision-log entry.'
- pass: standard
  file: src/http/dto/simulate-case.dto.ts
  where: subjectAttributeValueSchema / subjectSchema / caseRefSchema
  cites: MNT-03
  evidence: 'const subjectAttributeValueSchema = z.object({ attribute: z.string().min(1), value: z.string().min(1)
    }); ...'
  cost: This exact block already exists, character for character, in diagnose.dto.ts and simulate-hypothesis.dto.ts,
    and the subject pair also in test-connector.dto.ts. A change to what counts as a valid subject or
    case reference has to be hand-applied in four files.
  correction: Extract subjectAttributeValueSchema, subjectSchema and caseRefSchema into one shared module
    under src/http/dto and import them at all four call sites.
- pass: standard
  file: src/http/dto/simulate-case.dto.ts
  where: citationSchema / usageSchema / evaluationSchema / fieldSemanticsSchema / evidenceSchema / referralSchema
  cites: MNT-03
  evidence: 'const citationSchema = z.object({ concept: z.string().min(1), field: z.string().min(1).optional()
    }); ...'
  cost: citationSchema, usageSchema, fieldSemanticsSchema and evidenceSchema are reproduced field-for-field
    in simulate-hypothesis.dto.ts, and referralSchema in diagnose.dto.ts; a rule about what makes a citation,
    usage figure, evidence item or referral valid is stated once per copy rather than once.
  correction: Move the shared evidence/citation/usage/evaluation/referral schemas into one module the
    case and hypothesis DTOs both import.
- pass: standard
  file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  where: aValidEvidenceItem() and the evidence-item test cases
  cites: MNT-03
  evidence: 'function aValidEvidenceItem(): Record<string, unknown> { return { concept: ''a-concept'',
    ... }; }'
  cost: The identical helper, and several of the tests built from it, already exist verbatim in simulate-hypothesis.dto.spec.ts.
    A change to the shape of an evidence item has to be made in both spec files by hand.
  correction: Factor aValidEvidenceItem() and the evidence-shape test cases into a shared test helper
    both spec files import.
reconciliation: siegard-reconcile/simulate-case-assessment-evidence-fields-omitted.md
---

## What it is

Reviews widen-simulate-case-response-schema's delivered change: simulate-case.dto.ts's widened assessmentSchema and evidenceSchema, plus the test file that proves it.
Coverage, specification conformance (via trace.py --stage --review, folded into siegard-reconcile/simulate-case-assessment-evidence-fields-omitted.md), standard conformance and failure diagnosis all ran; the failures pass found nothing to diagnose since every captured step passed.

## Notes

16 rules were in scope for reading (STK-02 through STK-12, SEC-04, MNT-03, TST-01 through TST-03); 3 findings, all MNT-03 (duplicated schema and test-fixture logic shared with simulate-hypothesis.dto.ts/.spec.ts and diagnose.dto.ts).
The rules a tool decides (20 lint rules, 2 secret-scan rules, 2 typecheck rules) ran as steps of the captured run (run/simulate-case-assessment-evidence-fields-omitted-review-suite) and all exited 0.
Coverage found three criteria partial: register's second enum value ('plain') is never submitted, usage's input_tokens requiredness and both members' integer typing are exercised only incidentally, and the production-shaped test's no-strip guarantee covers only assessment and evidence[0] rather than cost/durations/resolved/evaluations, and is hand-authored rather than tied to a real production value.
The conformance pass found two contradictions pre-dating this task's own two widened fields — evaluationSchema's verdict literals restated inline instead of imported from VERDICTS, and usage/elapsed_ms/prompt left optional even on the confirmed/refuted branches where a call always happened — plus one in the test file itself, which actively certifies a confirmed citation missing `field` as valid, contradicting domain/investigation/citation's traceability guarantee.
The conformance fold cleared 13 node-file bindings and left 3 uncleared (domain/investigation/citation, domain/investigation/evaluation, domain/investigation/verdict — the three findings above) — see siegard-reconcile/simulate-case-assessment-evidence-fields-omitted.md for the per-node judgment.
This review does not re-examine the other two live corrective initiatives' own files, or files whose drift predates this batch and were already read by the prior `review-change: all 9 corrective batch tasks` review (4f885cf) — those stand on their own record.

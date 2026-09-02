---
title: Widen simulate-case response schema for assessment and evidence
summary: Adds register, usage, elapsed_ms and prompt to assessmentSchema and fields, concept_description
  to evidenceSchema in simulate-case.dto.ts, reusing existing shared shapes for the enum, the usage record
  and field semantics.
task: sha256:520661fde7a061863cb84fe4a878c1963c3828afe03d74ac73d26d23b9300c08
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/simulate-case-assessment-evidence-fields-omitted-widen-simulate-case-response-schema-build
files:
- path: src/http/dto/simulate-case.dto.ts
  effect: Imports CONSOLIDATION_REGISTERS from ../../investigation/consolidation-register.js. Adds a new
    local fieldSemanticsSchema (name required, type and description optional) mirroring the existing FieldSemantics
    TypeScript shape. Widens assessmentSchema with four new required fields -- register (z.enum(CONSOLIDATION_REGISTERS)),
    usage (the existing usageSchema, no longer optional), elapsed_ms (z.int()) and prompt (z.string())
    -- and widens evidenceSchema with two new required fields -- fields (z.array(fieldSemanticsSchema).readonly(),
    no minimum length) and concept_description (z.string(), no minimum length). SimulateCaseResponseDto,
    inferred from simulateCaseResponseSchema, now carries all eight fields.
criteria:
- criterion: assessmentSchema requires register, typed as the consolidation-register enum.
  met: true
  how: 'register: z.enum(CONSOLIDATION_REGISTERS) added to assessmentSchema with no .optional(), reusing
    the CONSOLIDATION_REGISTERS constant already declared in investigation/consolidation-register.ts rather
    than restating the enum''s values.'
- criterion: assessmentSchema requires usage, typed as the usage shape (input_tokens, output_tokens).
  met: true
  how: 'assessmentSchema now declares usage: usageSchema (the same z.object({ input_tokens: z.number(),
    output_tokens: z.number() }) already defined in this file and already reused by evaluationSchema),
    required rather than .optional().'
- criterion: assessmentSchema requires elapsed_ms, typed as an integer.
  met: true
  how: 'elapsed_ms: z.int() added to assessmentSchema, required. z.int() is the pattern this file already
    uses for an integer-typed field (caseRefSchema.version), rather than the plain z.number() used for
    fields the specification does not type as integer.'
- criterion: assessmentSchema requires prompt, typed as a string.
  met: true
  how: 'prompt: z.string() added to assessmentSchema, required.'
- criterion: evidenceSchema requires fields, typed as an array of the field-semantics shape.
  met: true
  how: 'fields: z.array(fieldSemanticsSchema).readonly() added to evidenceSchema, required (no .optional())
    but with no .min(1), so the honest-empty reading domain/investigation/evidence''s own Description
    states -- "a concept whose capability never resolved snapshots no fields at all" -- still validates.'
- criterion: evidenceSchema requires concept_description, typed as a string.
  met: true
  how: 'concept_description: z.string() added to evidenceSchema, required (no .optional()) and with no
    .min(1), so the node''s other honest-empty reading -- "a concept collected before it declared a description
    snapshots an empty one" -- still validates.'
- criterion: A SimulateCaseResponseDto value that a validated production simulate-case call actually produces
    validates against the widened schema with no field stripped or rejected.
  met: true
  how: simulate-case.controller.ts passes assessment and evidence straight through from runSimulate's
    InvestigationPipelineResult without reshaping them, and the domain Assessment and Evidence types (investigation/assessment.ts,
    investigation/evidence.ts) already carry register, usage, elapsed_ms, prompt, fields and concept_description
    end to end -- register and usage/elapsed_ms/prompt are populated by AnthropicAssessmentConsolidator
    (or its fake) as already-required ConsolidationOutcome fields, and fields/concept_description are
    populated by evidence-collection-stage.ts's fieldSemanticsOf call. None of the added schema fields
    is stricter than what those producers already emit, so a production value neither loses a field to
    stripping nor fails a new constraint. z.object without .strict() does not reject an object carrying
    these fields.
nodes:
- node: domain/investigation/assessment
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: assessmentSchema now requires register (typed via the shared ConsolidationRegister enum), usage
    (typed via the shared Usage shape), elapsed_ms (integer) and prompt (string), the four attributes
    this node states as required alongside outcome/referral/text, which the response schema already carried.
    determining_hypothesis was already optional and untouched, matching the node's own optional attribute.
- node: domain/investigation/evidence
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: evidenceSchema now requires fields (an array of the field-semantics shape) and concept_description
    (a string), both without a non-empty constraint, so the node's own documented honest-empty snapshots
    (no fields at all; an empty concept_description) remain valid values of the required field rather
    than being read as absence.
inferences:
- inferred: 'A local fieldSemanticsSchema (name: z.string(), type: z.string().optional(), description:
    z.string().optional()) was written rather than importing a schema from investigation/field-semantics.ts,
    because that module exports only the FieldSemantics TypeScript type and a parsing function, not a
    Zod schema; no shared Zod shape for it existed anywhere in the codebase to reuse.'
  from: investigation/field-semantics.ts's FieldSemantics type (name required, type and description optional)
    and the binder's ADVISORY note that field-semantics' own shape is domain/investigation/field-semantics's,
    not a decision of this task -- the schema mirrors that existing TypeScript shape exactly rather than
    adding or removing constraints.
- inferred: prompt and concept_description are typed as plain z.string() with no .min(1), even though
    several other required string fields in this file (text, outcome, concept) do carry .min(1).
  from: The task's criteria state only "typed as a string" for both, and the UNDERDETERMINED note requires
    evidenceSchema to admit the empty-string concept_description reading the node's own Description states;
    prompt has no equivalent node statement that it is ever non-empty, and other string-typed fields already
    in this schema (inputs, observation, origin) are likewise left unconstrained rather than defaulting
    to .min(1).
- inferred: elapsed_ms on assessmentSchema is typed z.int() rather than z.number().
  from: The node states elapsed_ms's type as integer (not simply string/number), and this file already
    distinguishes the two by using z.int() for caseRefSchema.version, its one other integer-typed field.
preserved:
- Every other field of assessmentSchema and evidenceSchema, and every other schema in this file, unchanged.
deferred:
- what: The existing test file src/__tests__/unit/http/dto/simulate-case.dto.spec.ts's aValidResponse()
    fixture no longer satisfies assessmentSchema, since it omits the four newly required fields; likewise
    any other spec building a bare assessment or evidence fixture against this schema will need updating.
  why: Writing or editing tests is the test-author's judgment, not this task-implementer's; the binder's
    ADVISORY/Decision notes confirm this task's scope is limited to widening the two schema objects, and
    updating fixtures is the proof side of the same increment.
- what: evidenceSchema's own pre-existing elapsed_ms is still typed z.number() rather than z.int(), even
    though domain/investigation/evidence types it as integer.
  why: No criterion of this task names evidence's elapsed_ms, and the objective's own ADVISORY note records
    that only the criteria's named omissions are in scope here -- evidence's other already-required attributes
    are covered by criterion 7's broad check, not by a per-field criterion this task is asked to correct.
---

## What it is

Widens simulate-case.dto.ts's response schema to state the assessment call-record fields and the
evidence item's own snapshotted semantics that domain/investigation/assessment and
domain/investigation/evidence already require.

## Notes

Deferred: the existing simulate-case.dto.spec.ts fixture no longer satisfies the widened schema --
this is the proof step's to update.
Deferred: evidence's elapsed_ms stays z.number() rather than z.int(), since no criterion of this
task names it.

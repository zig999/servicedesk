---
title: simulate-hypothesis DTO derives verdict from VERDICTS and widens evidenceSchema
summary: evaluationSchema's three verdict branch discriminators now derive from the imported VERDICTS
  array, and evidenceSchema requires fields and concept_description typed against the shared field-semantics
  shape.
task: sha256:9bc51e7a3220d1635278085fcca7cdb150fa2d23f7f61f4679534e8ec5eee50f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/simulate-hypothesis-dto-verdict-evidence-fields-derive-verdict-and-widen-evidence-schema-build
files:
- path: src/http/dto/simulate-hypothesis.dto.ts
  effect: 'Imports VERDICTS from ../../investigation/verdict.js and destructures it into CONFIRMED_VERDICT,
    REFUTED_VERDICT, INCONCLUSIVE_VERDICT; evaluationSchema''s three discriminated-union branches now
    use z.literal(CONFIRMED_VERDICT) / z.literal(REFUTED_VERDICT) / z.literal(INCONCLUSIVE_VERDICT) in
    place of the three independently-typed z.literal(''confirmed'')/''refuted''/''inconclusive''. Adds
    a fieldSemanticsSchema local object (name required; type and description optional) mirroring the FieldSemantics
    shape, and widens evidenceSchema with fields: z.array(fieldSemanticsSchema).readonly() (no .min(1))
    and concept_description: z.string() (no .min(1)), so an empty array and an empty string both still
    validate.'
criteria:
- criterion: evaluationSchema's three verdict branches derive their z.literal discriminator from the imported
    VERDICTS array (the same pattern EVALUATION_REASONS and EVIDENCE_RESULTS already use in this file),
    not from a literal typed independently in this file.
  met: true
  how: VERDICTS is imported from ../../investigation/verdict.js exactly as EVALUATION_REASONS and EVIDENCE_RESULTS
    are imported from their respective modules; its three elements are destructured once into CONFIRMED_VERDICT/REFUTED_VERDICT/INCONCLUSIVE_VERDICT
    and each branch's verdict field is z.literal(<the corresponding constant>). No branch spells 'confirmed'/'refuted'/'inconclusive'
    independently anymore. z.enum(VERDICTS) itself was not used for the discriminant because a discriminated
    union's branch key must be a single literal per branch, not a union of the three.
- criterion: A value of each of the three VERDICTS entries still validates against the corresponding branch
    after the change.
  met: true
  how: VERDICTS is declared as const in src/investigation/verdict.ts, so destructuring preserves each
    element's literal type positionally and z.literal(CONFIRMED_VERDICT) etc. narrow to the exact same
    literal values the schema validated before the change.
- criterion: evidenceSchema requires fields, typed as an array of the field-semantics shape.
  met: true
  how: 'evidenceSchema now declares fields: z.array(fieldSemanticsSchema).readonly() as a required key;
    fieldSemanticsSchema mirrors FieldSemantics (name required string; type and description optional strings).'
- criterion: evidenceSchema requires concept_description, typed as a string.
  met: true
  how: evidenceSchema now declares concept_description as z.string() (no .optional()), a required key.
- criterion: A SimulateHypothesisResponseDto value that a validated production simulate-hypothesis call
    actually produces validates against the widened schema with no field stripped or rejected.
  met: true
  how: The domain Evidence type at src/investigation/evidence.ts declares fields and concept_description
    as non-optional attributes, and simulate-hypothesis.controller.ts returns the pipeline's evidence
    array unmapped into the DTO response, so every evidence item the controller actually returns already
    carries both keys with the types the widened schema now requires. FieldSemantics itself matches fieldSemanticsSchema's
    shape exactly, mirroring the sibling simulate-case.dto.ts widening delivered against the identical
    Evidence type in the same batch.
nodes:
- node: domain/investigation/verdict
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: The node's enumeration values are the sole source of VERDICTS in src/investigation/verdict.ts;
    this task derives the three discriminant literals from that one module instead of restating them,
    so a future change to the enumeration's values needs no matching edit here.
- node: domain/investigation/evidence
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: evidenceSchema now requires fields and concept_description exactly as the node's attribute list
    requires them, typed to admit the honest-empty readings the node's Description states (an empty array,
    an empty string) by omitting .min(1).
inferences:
- inferred: The verdict discriminator derivation uses per-branch destructured constants rather than z.enum(VERDICTS),
    because z.discriminatedUnion requires one distinct literal per branch and z.enum produces a union,
    not a single literal.
  from: The existing z.enum(EVALUATION_REASONS) / z.enum(EVIDENCE_RESULTS) usages in this same file, and
    zod's discriminatedUnion API requiring a literal (not a union schema) at the discriminant key of each
    branch object.
- inferred: The widened evidenceSchema's field order and naming mirrors the equivalent widening already
    delivered on the sibling src/http/dto/simulate-case.dto.ts in the same batch, rather than choosing
    a different placement.
  from: The already-delivered simulate-case.dto.ts evidenceSchema in the same batch, read for its identical
    defect pattern.
preserved:
- evaluationSchema's discriminated-union structure, its three branches' other fields (citations, usage,
  elapsed_ms, prompt, reason), and its behavior for every value that validated before this change -- only
  how each branch's verdict literal is sourced changed.
- Every other evidenceSchema field and its existing constraints, unchanged.
- simulateHypothesisRequestSchema, durationsSchema, citationSchema, usageSchema, subjectSchema, subjectAttributeValueSchema,
  caseRefSchema and both exported types, untouched.
---

## What it is

Derives simulate-hypothesis.dto.ts's verdict literals from the shared VERDICTS vocabulary and
widens its evidenceSchema to state the evidence item's own snapshotted semantics that
domain/investigation/evidence already requires.

## Notes

None.

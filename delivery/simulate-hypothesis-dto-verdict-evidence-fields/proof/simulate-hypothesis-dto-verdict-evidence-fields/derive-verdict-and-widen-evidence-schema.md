---
title: simulate-hypothesis DTO derives verdict from VERDICTS and widens evidenceSchema
summary: Proves the discriminated-union verdict branches still validate each of the three VERDICTS entries
  and reject an unknown one, and that the widened evidenceSchema requires fields and concept_description
  while admitting the honest-empty readings and the field-semantics shape domain/investigation/field-semantics
  actually declares.
implementation: sha256:c43f0efbdd962a4c3bdd02a8005f037ad16566e36d3738de7675206523b2dc51
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/simulate-hypothesis-dto-verdict-evidence-fields-derive-verdict-and-widen-evidence-schema-suite
tests:
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a response whose evaluation carries VERDICTS' first entry as its verdict, on the confirmed
    branch
  proves: criterion 2 (a value of each VERDICTS entry validates against its branch) for the confirmed
    branch
  fails_when: the confirmed branch's discriminant no longer accepts VERDICTS[0]'s actual value
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a response whose evaluation carries VERDICTS' second entry as its verdict, on the refuted
    branch
  proves: criterion 2 for the refuted branch
  fails_when: the refuted branch's discriminant no longer accepts VERDICTS[1]'s actual value
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a response whose evaluation carries VERDICTS' third entry as its verdict, on the inconclusive
    branch
  proves: criterion 2 for the inconclusive branch
  fails_when: the inconclusive branch's discriminant no longer accepts VERDICTS[2]'s actual value
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects an evaluation whose verdict is not one of the shared VERDICTS values
  proves: the discriminated union still refuses a value outside the shared vocabulary after the derivation
    change (no branch was widened to z.string() in the process)
  fails_when: any branch's verdict key accepts an arbitrary string
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects an evidence item missing fields, now that evidenceSchema requires it
  proves: criterion 3 (fields is required)
  fails_when: evidenceSchema still treats fields as optional
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates an evidence item whose fields is an empty array, matching a concept whose capability
    never resolved
  proves: the UNDERDETERMINED entry on the empty-array reading -- a schema requiring a non-empty fields
    array would fail this test
  fails_when: evidenceSchema's fields carries a .min(1) or equivalent non-empty constraint
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects an evidence item whose fields is not an array
  proves: fields is typed as an array (criterion 3), not merely present
  fails_when: fields accepts a non-array value
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects an evidence item whose fields entry is missing its name
  proves: the field-semantics shape requires name (the UNDERDETERMINED entry on the shape's actual required
    member)
  fails_when: a fields entry validates without a name
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates an evidence item whose fields entry supplies only a name, leaving type and description
    absent
  proves: the second UNDERDETERMINED entry -- a schema departing from FieldSemantics by requiring type
    and/or description would fail this test
  fails_when: fieldSemanticsSchema requires type or description
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects an evidence item missing concept_description, now that evidenceSchema requires it
  proves: criterion 4 (concept_description is required)
  fails_when: evidenceSchema still treats concept_description as optional
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects an evidence item whose concept_description is not a string
  proves: concept_description is typed as a string (criterion 4)
  fails_when: concept_description accepts a non-string value
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates an evidence item whose concept_description is the empty string, matching a concept collected
    before it declared one
  proves: the UNDERDETERMINED entry on the empty-string reading -- a schema requiring a non-empty concept_description
    would fail this test
  fails_when: evidenceSchema's concept_description carries a .min(1) or equivalent non-empty constraint
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a production-shaped response with no field stripped from its evidence or its evaluation
  proves: criterion 5, using a fixture shaped to domain/investigation/evidence's Evidence type and to
    the evaluation the controller passes through unmapped
  fails_when: a field present on the domain Evidence type or on a valid evaluation branch is rejected
    or silently dropped by the widened schema
not_applicable:
- edge_case: a duplicate where uniqueness is claimed
  why: neither evaluationSchema nor evidenceSchema states a uniqueness constraint over any field; there
    is nothing for a duplicate to violate.
- edge_case: two operations against one subject at once
  why: schema validation is a pure, synchronous, stateless computation with no shared mutable state across
    calls; concurrency raises no distinct behavior to test.
- edge_case: a dependency that fails or answers slowly
  why: safeParse touches no I/O, network or datastore; there is no dependency for this schema to depend
    on.
untested:
- Criterion 1 (that the three verdict discriminators derive their z.literal from the imported VERDICTS
  array rather than an independently-typed literal) is a sourcing claim about where the literal comes
  from, not about what the schema accepts. A correctly hand-typed literal carrying the identical current
  values would pass every test in this file exactly as the derived version does -- no black-box safeParse
  call can distinguish 'derived from VERDICTS' from 'independently typed but currently matching VERDICTS'.
  Only the resulting validation behavior (criterion 2) is proven here; the derivation itself is a structural
  fact this proof cannot observe from outside.
- simulateHypothesisRequestSchema, subjectSchema, subjectAttributeValueSchema, caseRefSchema, citationSchema's
  field-optionality behavior, usageSchema and durationsSchema are exercised only incidentally as fixture
  scaffolding in this file's tests; none of them changed under this task, so their own behavior beyond
  what a valid fixture needs remains unproven by any test -- a pre-existing gap this task's criteria do
  not ask this proof to close.
contested:
- what: Criterion 5's implementation record argues it is met by reasoning that the domain Evidence type
    declares fields and concept_description as non-optional and that the controller passes the pipeline's
    evidence through unmapped -- it does not point at an actual captured production simulate-hypothesis
    payload, despite the task's own ADVISORY note that criterion 5 'is falsifiable only against a captured
    production simulate-hypothesis payload' and that 'the delivery must obtain and the record must point
    at the payload used.'
  why: No captured payload file, fixture or reference to one exists anywhere in the tree for this call.
    The production-shaped test written here is built from the domain Evidence type's own declared shape
    and a valid evaluation branch -- the same type-level proxy the implementation record itself relies
    on -- rather than from a genuinely observed production response, so it proves the criterion as the
    record's own reasoning states it, not as the advisory asked the delivery to falsify it.
---

## What it is

Proves simulate-hypothesis.dto.ts's verdict literals are sourced from the shared VERDICTS
vocabulary and its widened evidenceSchema requires and correctly types the evidence item's own
snapshotted semantics, while admitting the specification's own honest-empty readings.

## Notes

Contested: criterion 5 (the production-shaped check) is proven against the domain Evidence
type's declared shape rather than an actually captured production payload, which the binder's
own ADVISORY note asked for.

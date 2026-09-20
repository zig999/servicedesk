---
target: backend
title: Fieldless citation no longer rejected as an undeclared field
summary: citesADeclaredField in citation-validation.ts now accepts a citation that carries no field, once
  its cited evidence item is found, instead of failing the unconditional field-name match.
task: sha256:901f6e90bf81573f34bc8dbbdc894237e8227d71accec63b49ca0fa6fffe192e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/no-data-citation-field-check-fix-fieldless-citation-accepted-build
files:
- path: src/investigation/citation-validation.ts
  effect: citesADeclaredField still resolves the cited evidence item by concept and still refuses when
    none matches, but now returns true immediately once citation.field is undefined, before it ever compares
    against citedEvidence.fields; a citation naming a field still falls through to the unchanged fields.some(...)
    match.
criteria:
- criterion: A citation whose concept is collected and which carries no field is accepted by isCitationValid,
    whatever field names the cited evidence item snapshotted.
  met: true
  how: isCitationValid short-circuits through citesACollectedConcept (unchanged) and citesADeclaredField.
    In citesADeclaredField, once the cited evidence item is located by concept, citation.field === undefined
    now returns true unconditionally, before citedEvidence.fields is consulted at all -- so the item's
    own snapshotted field names, whatever they are (including none), cannot cause a fieldless citation
    to be refused.
- criterion: A citation naming a field is still rejected by isCitationValid when that field is not among
    the cited evidence item's own snapshotted field names.
  met: true
  how: The new undefined-field branch is only taken when citation.field is undefined; a citation carrying
    a field skips it and falls through to the original, unchanged citedEvidence.fields.some((field) =>
    field.name === citation.field) comparison, so an unmatched field name is refused exactly as before.
nodes:
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  encoded_at:
  - src/investigation/citation-validation.ts
  how: The invariant states a citation grounding a no-data verdict carries no field "since the evidence
    it cites snapshotted none"; citesADeclaredField now treats an absent citation.field as satisfying
    the rule by construction (nothing to check against) rather than as an unmatched field, once the cited
    evidence item itself is confirmed to exist for that concept.
- node: domain/investigation/citation
  encoded_at:
  - src/investigation/citation-validation.ts
  how: The value object's own description states field "is absent when the citation names only which evidence
    a no-data verdict cites, since that evidence's own item snapshotted no fields at all to point at";
    the fix makes isCitationValid stop demanding a field match in exactly that case.
inferences:
- inferred: A fieldless citation is still refused when no evidence item in context.evidence matches its
    concept at all (the existing citedEvidence === undefined branch was left untouched and now sits before
    the new field check).
  from: Criterion 1's own wording -- "whatever field names the cited evidence item snapshotted" -- presupposes
    a cited evidence item exists; neither criterion nor the two nodes describe what happens when it does
    not, and the existing test that refuses a citation whose concept has no matching entry in the supplied
    evidence at all already fixes that behavior for the general case.
- inferred: No change was made to whether isCitationValid or citesADeclaredField receive or condition
    on a verdict.
  from: The task's own UNDERDETERMINED note -- isCitationValid's signature (a Citation plus the evidence
    context) carries no verdict, and the verdict lives one level up on the Evaluation built in judgment-stage.ts,
    outside this task's implements list.
preserved:
- A citation naming a concept outside the hypothesis's collects is still refused by citesACollectedConcept,
  unconditionally on field.
- A citation whose concept has no matching entry in context.evidence at all is still refused, answering
  false rather than throwing.
- A citation naming a field absent from its own cited evidence item's snapshotted fields is still refused,
  including path-shaped field names and fields that only appear in a foreign evidence item or in capability_payload_notes
  text.
- acceptedCitations still filters a proposed citation list to the accepted ones, preserving proposal order.
- declaredFieldsOf, parseJsonOrUndefined and isPlainObject, and the absence of any live-resolved capability
  output-schema map, are untouched.
deferred:
- what: Enforcing that a citation grounding a confirmed or refuted verdict always carries a field (the
    domain/investigation/citation invariant's other half).
  why: isCitationValid's signature carries no verdict to condition on -- the verdict lives on the Evaluation
    built one level up in judgment-stage.ts -- and this task's Notes record that this fix does not plumb
    the verdict through; enforcing that half of the invariant belongs to whichever evaluator constructs
    the citation, which is outside this task's implements list.
---

## What it is

Fixes citesADeclaredField so a citation carrying no field is accepted once its cited evidence
item is located, instead of being rejected by the unconditional field-name match.

## Notes

Build ran clean over all five registry steps (install, typecheck, lint, secret-scan, test-unit)
before this record was written.
Deferred item mirrors the task's own UNDERDETERMINED note: the verdict-conditioned half of the
domain invariant is not enforceable from isCitationValid's current signature and is left to
whichever evaluator constructs a citation.

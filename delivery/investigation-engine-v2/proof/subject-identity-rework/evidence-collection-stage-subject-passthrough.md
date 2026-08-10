---
title: evidence-collection-stage's whole-subject passthrough, and its import-freedom
summary: Adds two tests to the existing, unmodified evidence-collection-stage.spec.ts — a multi-attribute subject reaching every concept's observe-concept call whole and unfiltered, and evidence-collection-stage.ts importing no framework, driver or provider-client package directly — closing the two gaps the existing single-attribute fixture and the task's own UNDERDETERMINED note left open; criterion 3 needed no new test since the pre-existing, unmodified suite already exercises it against the canonical Subject shape.
implementation: sha256:09ee980aec4ce7d8b7c070a0bbbe6a94d4d8b8b5abcf56039eb907b73f55e79b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-evidence-collection-stage-subject-passthrough-suite
tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: "passes a subject carrying several attribute-value pairs to every concept's observe-concept call whole, with no pair selected out"
    proves: "Each concept's observe-concept call in a collection run receives the subject's governed type and its whole attribute-value set, and no attribute is filtered from the subject before any concept's call is dispatched — the existing suite's A_SUBJECT fixture carries only one attribute-value pair, so nothing before this test actually exercised a whole set rather than a single value"
    fails_when: "any concept's observe-concept call receives a subject differing from the exact multi-attribute subject given to collectEvidence — an attribute dropped, added, mutated, or the type itself changed — for either of the two concepts dispatched"
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: "imports no framework, driver or provider-client package directly — every import specifier is a relative path, reaching infrastructure only through the observation-source port it is given"
    proves: "the task's own UNDERDETERMINED note — constraints/the-domain-depends-on-no-infrastructure binds evidence-collection-stage as a domain-layer module this task rewrites, but none of the three stated criteria demonstrate import-freedom"
    fails_when: "evidence-collection-stage.ts is rewritten to import any bare-specifier package (a framework, driver or provider-client) directly, rather than reaching infrastructure only through the observation-source port's own relative import"
not_applicable:
  - edge_case: a collectEvidence call whose subject argument is entirely absent
    why: "CollectEvidenceOptions.subject is a required, non-optional Subject; TypeScript refuses an omitted argument at compile time, and no criterion asks for a runtime guard against it"
  - edge_case: a subject built with an empty attribute-value set reaching collectEvidence
    why: "REMAINDER per the task's own Notes — rules/investigation/a-subject-carries-at-least-one-attribute is enforced by buildSubject in subject.ts, not by this passthrough stage; the dependency task's own proof already exercises a zero-attribute subject's passthrough at the port/fake layer this stage forwards to"
  - edge_case: a subject's attribute-value set carrying the same attribute name twice with different values
    why: "no domain node or criterion states attribute-name uniqueness within a subject's whole set — the same dismissal the sibling proof already records for the identical case — and the new multi-attribute test already proves every distinct pair in the set reaches the call regardless"
  - edge_case: an empty collection plan (a case whose hypotheses collect nothing)
    why: "collectionPlan's own cardinality is unrelated to the subject's shape and is proven by case-resolution.spec.ts; this task's rework touches only what subject each dispatched call carries, not how many calls are dispatched"
  - edge_case: a slow or failing capability-registry read, a timed-out or rejecting observe-concept call
    why: "criterion 3's own territory — this machinery is exercised by the pre-existing, unmodified tests against the canonical Subject shape already; the task rearranges nothing here, so no new test is written for what already works"
  - edge_case: two concepts dispatched concurrently against the same subject reference
    why: "exercised inherently by the new multi-attribute test's two-concept Promise.all dispatch and by the pre-existing runs-every-concept-in-parallel test; Subject is a plain readonly value nothing here mutates"
  - edge_case: a maximum bound on how many attribute-value pairs a subject may carry
    why: "no criterion or specification node states such a bound; the three-pair fixture already shows more than one pair passes through, and a larger count would prove nothing further"
untested:
  - "evidence.inputs's own serialized JSON for a multi-attribute subject — serializeInputs reads subject by the same reference as observeConcept, but the new test asserts only the observe-concept call argument, not the resulting evidence.inputs string, so a defect confined specifically to serializeInputs's own JSON.stringify call would not be caught by anything added here"
  - "the observation-source-modules.spec.ts sweep (pre-existing, from an earlier task) additionally scans evidence-collection-stage.ts's imports against a curated forbidden-packages list and a standard-library check; the new import-freedom test here is a direct, unmaintained-list check against exactly this file, so the two overlap without either superseding the other"
---

## What it is

Adds two tests to the pre-existing, unmodified evidence-collection-stage.spec.ts: a multi-attribute subject reaching every concept's call whole and unfiltered (criteria 1-2), and import-freedom (the task's own UNDERDETERMINED note). Criterion 3 needed no new test — already exercised by the pre-existing suite.

## Notes

None.

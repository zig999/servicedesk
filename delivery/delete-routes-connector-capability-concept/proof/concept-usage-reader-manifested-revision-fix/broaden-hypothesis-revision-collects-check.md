---
target: backend
title: concept-usage-reader's hypothesis-revision-collects branch, corrected for a manifested revision
summary: Corrects a test that asserted the pre-fix, narrower behavior and adds one boundary test, proving
  the reader now answers named for a manifested hypothesis-revision's own collects and still refuses it
  for an unrelated, unnamed one.
implementation: sha256:1e1aeecbcf7394526e6e693b9b767ee93a2e7b0c0e83993ceb43b54262f1d90a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/concept-usage-reader-manifested-revision-fix-broaden-hypothesis-revision-collects-check-suite-3
tests:
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is named, through reference "hypothesis-revision-collects", when a hypothesis-revision's
    own collects lists it and a case version already manifests that revision
  proves: Criterion 1 — Given a hypothesis-revision whose own collects lists the queried concept, and
    a case version that currently manifests that revision, the reader answers that the concept is named,
    through reference "hypothesis-revision-collects", regardless of whether that hypothesis-revision's
    own state is draft or released.
  fails_when: 'readConceptUsage(concept) answers anything other than { named: true, reference: ''hypothesis-revision-collects''
    } once a real hypothesis-revision has been inserted collecting that exact concept and placed into
    a real case version''s manifest — including the { named: false } the reader answered for exactly this
    scenario before this fix.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is not named when a hypothesis-revision's own collects lists a different
    concept, even though that revision is manifested
  proves: Criterion 3 — Given no hypothesis-revision whose own collects lists the queried concept, the
    reader does not answer named through this reference. This is the boundary where a hypothesis-revision
    does exist and is manifested but its own collects names a different concept, so it is the concept-name
    filter that excludes it, not merely the absence of any hypothesis-revision at all.
  fails_when: 'readConceptUsage(concept) answers { named: true, reference: ''hypothesis-revision-collects''
    } for a concept no hypothesis-revision''s collects lists, when a different, manifested hypothesis-revision
    exists collecting an unrelated concept.'
not_applicable:
- edge_case: Concurrent or overlapping calls to readConceptUsage, or a concurrent write to hypothesis_revision_collects
    during the read
  why: No criterion of this task states a concurrency behavior, and the reader performs no write of its
    own; there is no race for a test to arbitrate here.
- edge_case: The database being unavailable, slow, or answering unexpectedly while resolving this branch
  why: No criterion of this task states a refusal or degraded answer for a failing dependency; the case
    store's own error-wrapping is proven by its own integration suite and is untouched by this fix.
- edge_case: An absent, empty, or otherwise malformed concept string reaching readConceptUsage or isConceptCollectedByHypothesisRevision
  why: No criterion of this task validates input; boundary validation belongs to the remove-concept operation's
    own task, per the sibling proof record's own deferred entry, and this task changes no validation.
- edge_case: More than one hypothesis-revision, in different manifestation or state combinations, whose
    own collects all list the same queried concept
  why: Criteria 1 through 3 state existentially over "a hypothesis-revision" and "no hypothesis-revision";
    a second qualifying revision alongside the one already tested does not change the required answer,
    so it is the same valid behavior the one representative already proves, not a distinct class.
untested:
- rules/glossary/a-registered-concept-is-never-removed — the rule's whole statement also governs the capability,
  evidence and citation reference kinds, the concept's own registration/replacement behavior, the HTTP
  409/ConceptInUseError transport shape, and the subject-type closing clause; this task's two tests decide
  only the hypothesis-revision-collects clause, so no test here decides the rule's fact whole — per the
  task's own REMAINDER note, the rest belongs to sibling tasks.
- domain/knowledge/hypothesis-revision — the node's whole fact also includes revision numbering, criterion
  content, resolution, the release operation and post-release immutability; this task's tests read only
  whether a hypothesis-revision's collects row names the queried concept, so no test here decides the
  node's fact whole.
- constraints/the-domain-depends-on-no-infrastructure — its fitness is a dependency audit over every domain
  module's imports, decided by the project's lint step rather than by a test asserting one file's or one
  branch's behavior; no criterion of this task demonstrates it directly (the task's own ADVISORY note),
  and the fix touches only the factory and persistence layers, which this constraint's own scope does
  not reach at all.
---

## What it is
The tests proving the corrected hypothesis-revision-collects branch: a manifested hypothesis-revision's own collects now answers named, and an unrelated manifested revision still does not.

## Notes
A previously-passing integration test asserted the pre-fix, narrower behavior (named: false for a manifested hypothesis-revision's own collects) — it was corrected to a positive assertion of the fixed behavior (named: true), not merely adjusted to keep passing; the scenario it exercises is unchanged, only the expected answer.

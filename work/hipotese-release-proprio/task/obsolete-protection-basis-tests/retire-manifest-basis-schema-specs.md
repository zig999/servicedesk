---
title: Retire the manifest-basis persistence schema specs
summary: The two persistence schema specs whose assertions rest on a released case version's reference,
  restated against the revision's own state or retired into the sibling that already holds them.
rationale: The planning cut the two schema specs together and apart from the repository spec because
  both replay the migrations and assert against raw SQL for the same reason — what the schema's own
  condition fires on — while the repository spec asserts an application error mapping and would change
  for a different reason.
sources:
- work/hipotese-release-proprio/intake/scope-suite-corrections.md
objective: No persistence schema spec asserts that an alteration of a hypothesis-revision is refused,
  or that its stored content survives, on the basis that a released case version's manifest references
  it.
criteria:
- src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  holds no assertion that an update is rejected because a released case version's manifest references
  the revision.
- src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  holds no assertion that a revision's stored content is left unchanged because a released case version's
  manifest references it.
- src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  holds no assertion that a revision's collects survive removal because a released case version's manifest
  references it.
- Every assertion removed from either file has an equivalent assertion, stated against the hypothesis-revision
  row's own state, standing somewhere in the persistence schema suite.
- Any test either file retains asserts the refusal from the hypothesis-revision row's own state and names
  no case_versions and no case_version_hypotheses relation.
- An alteration aimed at a hypothesis-revision whose own state is draft is asserted not to be refused
  by this rule, even where a released case version's manifest references that revision.
- Replaying every migration file in filename order onto an empty schema and running these files' tests
  passes with no test skipped.
depends_on:
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
implements:
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- constraints/the-schema-replays-from-its-scripts
---

## What it is

The two schema specs that prove immutability by building a released case version and pointing its manifest at the revision under test.
That construction is what the state-only condition no longer reads, so each assertion either moves onto the revision's own state column or retires into refuse-altering-a-released-revision-schema.spec.ts, which already holds it.
It is a change to what the suite certifies and to nothing the system does.

## Notes

Both files were delivered by initiatives already closed, so neither can be answered by a proof-only re-delivery under its original task.
refuse-altering-a-released-revision-schema.spec.ts is the already-correct sibling and the shape any retained test converges on.
REMAINDER, from the specification — `rules/knowledge/a-released-hypothesis-revision-is-never-altered`'s status/error-identity clause ("refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError") reaches no criterion here; a schema-level spec is not where either is observable. Belongs to the task covering the revise-hypothesis operation's refusal at the HTTP surface.
ADVISORY, from the specification — criterion 6 needs a fixture holding a released case version whose manifest references a draft hypothesis-revision; whether the store may legitimately hold that combination turns on `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions`, outside this epic's covers.
Decision, beyond the covers — stand: the criterion only needs the fixture constructed directly against the schema (as the sibling refuse-altering-a-released-revision-schema.spec.ts already does), not proof that a release operation can produce it; no claim on `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` is needed here.
ADVISORY, from the specification — criterion 7 says "filename order"; `constraints/the-schema-replays-from-its-scripts` states replay by numbered order and leaves script location/form to the project's own standard, so filename order is this project's own convention, not the constraint's own words.

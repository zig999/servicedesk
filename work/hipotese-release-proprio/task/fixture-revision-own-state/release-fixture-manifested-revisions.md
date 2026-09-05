---
title: Give the fixture's manifested revisions their own released state
summary: The fixture and seed setup that leaves a released case version's manifested hypothesis revisions
  in draft in their own column, corrected so the canonical case reads back whole.
rationale: The planning cut the fixture builder and the seed script into one task because both write
  the rows of the same canonical case and the same criteria falsify either, and it takes no dependency
  on the release action this initiative still owes because the scope places the correction in test setup,
  below any production path.
sources:
- work/hipotese-release-proprio/intake/scope-suite-corrections.md
objective: Every hypothesis-revision that a released case version's manifest entry references in the
  canonical fixture and in the seed script carries its own state released.
criteria:
- After the canonical fixture setup runs, every hypothesis-revision row referenced by a manifest entry
  of a case version in released state reads back with its own state released.
- After the seed script runs, every hypothesis-revision row referenced by a manifest entry of a case
  version in released state reads back with its own state released.
- The canonical fixture case reads back as a complete validated case version, with every manifest entry's
  revision collecting at least one concept.
- An attempt to remove the collects of a fixture revision that a released case version manifests leaves
  those collects in place.
- src/case/release.operation.ts writes no hypothesis_revisions state, and the released state is reached
  through the fixture and seed setup alone.
- The integration specs reading the canonical fixture — seed.spec.ts, fixtures/case-fixture-reads-clean.spec.ts,
  the three factory specs and case/manifest-collects-survive-release.spec.ts — pass with no assertion
  of theirs removed or relaxed.
depends_on:
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
implements:
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/validation-runs-at-every-read
- constraints/a-case-is-read-whole
---

## What it is

The shared fixture and seed data that every integration test built on the curated case reads.
Its released case versions manifest revisions whose own state column never moved past draft, which the
old join-based trigger hid and the state-only trigger exposes.
The correction is to the data those setups write, so the pairing the specification states between a
released version and the revisions it manifests holds in the fixture too.

## Notes

Nothing in the delivered system yet moves a hypothesis-revision's own state to released, so the fixture cannot reach that state through the system's own operation.
The setup therefore writes the state directly, below the release action the specification names as its only mover, and the criteria hold the production release path unchanged.
REMAINDER, from the specification — `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions`'s refusal clause (naming every draft-referencing hypothesis among CaseVersionNotReleasableError's violations) reaches no criterion here. Belongs to the task implementing the release-time gate in `src/case/release.operation.ts`.
REMAINDER, from the specification — the same rule's placement clause ("placing a manifest entry is never refused for referencing one in draft state") reaches no criterion here. Belongs to the task covering place-hypothesis' own behavior.
REMAINDER, from the specification — `rules/knowledge/a-hypothesis-collects-at-least-one-concept`'s own refusal clause (HTTP 422 HypothesisRevisionCollectsNoConceptError) reaches no criterion here. Belongs to the task implementing the hypothesis-revision write path.
REMAINDER, from the specification — `rules/knowledge/validation-runs-at-every-read`'s replay clause ("a replay reads the pinned version without revalidation") reaches no criterion here. Belongs to the investigation replay work.
ADVISORY, from the specification — criterion 4 identifies the protected revision as one "a released case version manifests"; `domain/knowledge/hypothesis-revision` states the opposite basis ("pointing at it moves neither" — the immutability is the revision's own). The node stating the alteration refusal itself, `rules/knowledge/a-released-hypothesis-revision-is-never-altered`, is outside this epic's covers.
Decision, beyond the covers — stand: rules/knowledge/a-released-hypothesis-revision-is-never-altered's refusal mechanism is proven by the sibling epic's own tasks; criterion 4 here needs only the outcome (collects survive), which `domain/knowledge/hypothesis-revision` already states.

---
title: Retire the manifest-basis assertions from the two obsolete persistence schema specs
summary: Removed the two obsolete assertions (rejection and content-survival in revision-alteration-refused-only-when-released-schema.spec.ts,
  and collects-survival in protect-released-hypothesis-revision-collects-schema.spec.ts) that attributed
  the release trigger's refusal to a released case version's manifest reference, since migration 0021
  already moved the condition onto hypothesis_revisions.state alone and the equivalent state-only assertions
  already stand in refuse-altering-a-released-revision-schema.spec.ts.
task: sha256:c4daffda6d15616ae4181a590c0bac92d3c767c2bce2fe40fb18ac0fc6346b53
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/obsolete-protection-basis-tests-retire-manifest-basis-schema-specs-build
files:
- path: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  effect: No longer asserts that an update is rejected, or that stored content is left unchanged, on the
    basis that a released case version's manifest references the revision. The two `it` blocks that made
    those assertions (against a hypothesis revision left at its default, unset state, which the current
    schema does not refuse at all) are removed. The four remaining tests are untouched.
- path: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  effect: No longer asserts that a revision's collects survive an ordinary DELETE because a released case
    version's manifest references the revision. The one `it` block making that assertion (against a revision
    left at its default, unset state, which the current release-conditioned DELETE rule does not protect)
    is removed. The remaining two tests are untouched.
criteria:
- criterion: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
    holds no assertion that an update is rejected because a released case version's manifest references
    the revision.
  met: true
  how: Removed the `it` block titled "rejects the update itself, raising ReleasedHypothesisRevisionNotAlterableError,
    ... where a released case version's manifest still references the revision" — the only assertion in
    the file that expected rejection on that basis.
- criterion: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
    holds no assertion that a revision's stored content is left unchanged because a released case version's
    manifest references it.
  met: true
  how: Removed the `it` block titled "leaves a hypothesis revision's stored content exactly as it was
    after an update attempts to change it, where a released case version's manifest still references that
    revision" — the only assertion attributing content-survival to the manifest reference.
- criterion: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
    holds no assertion that a revision's collects survive removal because a released case version's manifest
    references it.
  met: true
  how: Removed the `it` block titled "leaves a hypothesis-revision's own collects row present after an
    ordinary DELETE attempts to remove it, where its revision belongs to a released case version's manifest"
    — the only assertion attributing collects-survival to the manifest reference.
- criterion: Every assertion removed from either file has an equivalent assertion, stated against the
    hypothesis-revision row's own state, standing somewhere in the persistence schema suite.
  met: true
  how: 'All three removed assertions already have a state-only equivalent in refuse-altering-a-released-revision-schema.spec.ts
    — the rejection/unchanged-content assertion against an explicit state: ''released'' revision, and
    the collects-survival assertion against an explicit state: ''released'' revision with no manifest
    at all. No new test was written since these already stood, delivered by this same initiative''s migration-0021
    task.'
- criterion: Any test either file retains asserts the refusal from the hypothesis-revision row's own state
    and names no case_versions and no case_version_hypotheses relation.
  met: true
  how: The three removed tests were the only refusal-or-survival assertions attributing their outcome
    to a manifest reference; no refusal-or-survival-asserting test remains in either file that names case_versions
    or case_version_hypotheses.
- criterion: An alteration aimed at a hypothesis-revision whose own state is draft is asserted not to
    be refused by this rule, even where a released case version's manifest references that revision.
  met: true
  how: Already asserted by refuse-altering-a-released-revision-schema.spec.ts's "leaves an update through
    unrefused on a hypothesis-revision whose own state is draft, even though a released case version's
    manifest references that revision", delivered by this same initiative's migration-0021 task.
- criterion: Replaying every migration file in filename order onto an empty schema and running these files'
    tests passes with no test skipped.
  met: true
  how: Both files still build their schema through migrationFilesInOrder/applyMigrationFiles exactly as
    before (untouched). The three removed tests were the only ones whose expectation rested on a premise
    the state-only trigger and DELETE rule installed by migration 0021 no longer honors; every retained
    test's expectation follows directly from the row's own default or explicit state under the current
    schema.
nodes:
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  - src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
  how: The suite's certification of this rule is narrowed to what the schema's own state-only trigger
    reads, matching the rule's basis after migration 0021 moved it off the manifest join; the retained
    and sibling tests still certify the refusal, and the HTTP-409/error-identity clause is left to the
    revise-hypothesis operation task per this task's own REMAINDER note.
- node: domain/knowledge/hypothesis-revision
  how: Governs the retained and removed assertions' subject matter (the revision's own state and content)
    without a fact of its own needing a new encoding here; "pointing at it moves neither" is what makes
    the removed manifest-attributed assertions obsolete.
- node: domain/knowledge/hypothesis-revision-state
  how: Governed the choice of which fixtures needed an explicit state value to remain correct; no new
    encoding, since the retained tests either rely on the schema's own DEFAULT 'draft' or, in the unchanged
    sibling, an explicit state value already covering the state-only basis.
- node: constraints/the-schema-replays-from-its-scripts
  how: Both edited files continue to replay every migration file in filename order through the existing
    migrationFilesInOrder/applyMigrationFiles helpers, untouched by this task; no new encoding was needed.
inferences:
- inferred: The two removed tests in revision-alteration-refused-only-when-released-schema.spec.ts and
    the one removed in protect-released-hypothesis-revision-collects-schema.spec.ts were exactly the ones
    whose stated expectation would now fail against the live schema, since each built its fixture with
    the revision left at its unset/default state (draft) while asserting a released-manifest-conditioned
    protection outcome.
  from: Reading migrations 0020 (DEFAULT 'draft') and 0021 (trigger condition OLD.state = 'released';
    DELETE rule condition hr.state = 'released') against each test's exact fixture construction, and the
    inventory's convention that the sibling file already proves the state-only basis.
- inferred: Tests in both files that build a manifest/case-version fixture but assert a non-refusal outcome
    were left untouched, since the task's explicit criteria name only assertions of refusal/survival attributed
    to a manifest reference.
  from: The task's criteria list, its "What it is" narrative, and the correction context's explicit instruction
    to retire only the assertions the criteria name.
preserved:
- The four retained tests in revision-alteration-refused-only-when-released-schema.spec.ts (trigger/rule
  existence, unmanifested-revision update, draft-case-version-manifest update, unreferenced-sibling-revision
  update) continue to pass unchanged against the current schema.
- The two retained tests in protect-released-hypothesis-revision-collects-schema.spec.ts (draft-manifest
  DELETE removal, direct-UPDATE immutability) continue to pass unchanged against the current schema.
- The migration-replay fixture builders (requireDatabaseUrl, migrationFilesInOrder, applyMigrationFiles,
  per-schema insert helpers) in both files are unchanged and remain used by the retained tests.
deferred:
- what: Whether a released hypothesis-revision's HTTP-surface refusal (409, ReleasedHypothesisRevisionNotAlterableError)
    is asserted anywhere.
  why: Out of this task's covers per its own REMAINDER note — belongs to the task covering the revise-hypothesis
    operation's refusal at the HTTP surface, not to a schema-level spec.
---

## What it is

The two schema specs that used to prove immutability by building a released case version and pointing its manifest at the revision under test now assert nothing on that basis.
Their equivalent, state-only assertions already stand in refuse-altering-a-released-revision-schema.spec.ts, delivered by this same initiative's migration-0021 task.

## Notes

None.

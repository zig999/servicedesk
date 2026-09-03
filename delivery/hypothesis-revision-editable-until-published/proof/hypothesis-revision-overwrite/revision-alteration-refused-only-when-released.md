---
title: Proof for the release-conditioned refusal on hypothesis_revisions UPDATE
summary: Five integration tests against a real PostgreSQL database, replaying every migration
  script including 0019, proving the unconditional rule is gone and the new trigger lets an
  UPDATE through except where a released case version's manifest still references the row's own
  revision — where it raises the distinguishable error instead of silently discarding the write.
implementation: sha256:91763574a42fea7f68ef61ed5ccebd7f502e5ce0d9ccf5fdeacfc38c0cf0f30b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-revision-alteration-refused-only-when-released-suite-5
tests:
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: drops the unconditional hypothesis_revisions_no_update rule and installs the
    release-conditioned trigger on hypothesis_revisions once every migration script has been
    applied in its numbered order
  proves: criterion 1 (replay produces the schema the tree expects, with no hand step) —
    specifically that 0019 is the file that ends up governing hypothesis_revisions' own UPDATE
    protection once every script has run
  fails_when: the unconditional RULE still exists after replay, the new trigger does not, or
    applying the migration files in order errors
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: leaves an update through unrefused on a hypothesis revision that no case version
    references at all
  proves: criterion 2 — an update to a revision no case version references is not refused
  fails_when: the UPDATE is refused, or the written value does not read back
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: leaves an update through unrefused on a hypothesis revision that only a draft-state
    case version's manifest references
  proves: criterion 4 — an update to a revision only draft-state case versions reference is not
    refused
  fails_when: the UPDATE is refused, or the written value does not read back
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: leaves an update through unrefused on a hypothesis revision that a released case
    version's manifest does not reference, even though that same released version's manifest
    references a different revision of the same hypothesis
  proves: the guard's own scope — it reads OLD.revision through the join, not merely the
    hypothesis or the case version's state — so a released version's own reference to a sibling
    revision does not spill the refusal onto this one
  fails_when: the UPDATE to the unreferenced sibling revision is refused
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: leaves a hypothesis revision's stored content exactly as it was after an update
    attempts to change it, where a released case version's manifest still references that
    revision
  proves: criterion 3's "leaves the stored content exactly as it was" half
  fails_when: the row's criterion reads back changed after the attempted UPDATE
- file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  name: rejects the update itself, raising ReleasedHypothesisRevisionNotAlterableError, rather
    than silently discarding it, where a released case version's manifest still references the
    revision
  proves: criterion 3's refusal-not-silent-drop half, and
    rules/knowledge/a-released-hypothesis-revision-is-never-altered's own requirement that the
    attempt "is refused at the point of the attempt ... rather than being accepted and left with
    no effect"
  fails_when: the UPDATE resolves instead of rejecting, or rejects without the named error in its
    message
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when
    no released case version references it
  proves: criterion 2, exercised against the pre-existing schema suite this task's migration
    changes the outcome of — this case previously asserted the unconditional rule 0019 replaces
    and is corrected here as part of this task's own delivery, per the human's explicit
    authorization recorded in this task's delivery (the trace binds nothing to this file, so no
    other task's recorded proof is disturbed)
  fails_when: the UPDATE is refused, or the written value does not read back
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  name: leaves an already-stored hypothesis revision's own columns unchanged after an ordinary
    UPDATE attempts to alter them, where a released case version's manifest references that
    revision
  proves: criterion 3's "leaves the stored content exactly as it was" half, retained from the
    pre-existing suite as the still-refused case now made explicit about the released reference
    it depends on
  fails_when: the row's criterion reads back changed after the attempted UPDATE
not_applicable:
- edge_case: two released case versions' manifests both referencing the same revision
  why: no criterion or specification node distinguishes one released reference from more than
    one — the guard is an EXISTS check, so a second referencing row changes nothing it tests;
    asserting it would test PostgreSQL's own EXISTS semantics, not this migration
- edge_case: a case version transitioning from released back to draft
  why: no specification node or criterion states that a case version's state ever regresses
    from released; nothing here would be exercising a real transition
untested:
- Catching the raised ReleasedHypothesisRevisionNotAlterableError at the store/operation layer
  and surfacing it as the HTTP 409 rules/knowledge/a-released-hypothesis-revision-is-never-altered
  states — the task's own UNDERDETERMINED note assigns this to the revise-hypothesis endpoint,
  outside this task's own criteria
- The revise-hypothesis operation's own choice of which revision to target and whether to write
  in place or create the next revision — the task's own REMAINDER note assigns this to the
  revise-hypothesis operation task
---

## What it is

Six tests in the migration's own file plus a corrected pair in the pre-existing
case-version-lifecycle schema suite, all run against a real PostgreSQL database after replaying
every migration script including 0019, prove: the unconditional `hypothesis_revisions_no_update`
rule is gone; the new trigger lets an UPDATE through when no case version in released state
references the row (unreferenced, referenced only by a draft-state version, or a released
version's manifest referencing a different sibling revision); and the same trigger raises
`ReleasedHypothesisRevisionNotAlterableError` — refusing the write rather than silently
discarding it — exactly when a released case version's manifest still references the row's own
revision, leaving its stored content unchanged.

## Notes

`case-version-lifecycle-schema.spec.ts`'s case "leaves an already-stored hypothesis revision's
own columns unchanged after an ordinary UPDATE attempts to alter them" asserted the unconditional
rule this task's migration deliberately supersedes. `trace.py --encodes` over that file returns
no binding — the case-lifecycle initiative that originally wrote it closed without ever binding
any of its own tasks' proofs into the trace — so no other task's recorded claim stands over this
test. The human reviewed and authorized correcting it directly, as this task's own delivery,
rather than treating it as a separate task: it is split into two cases, one proving the new
unrefused path and one keeping the still-refused released case (renamed to state the released
reference its refusal now depends on, where the original text implied refusal was unconditional).
No other test in that file was touched.

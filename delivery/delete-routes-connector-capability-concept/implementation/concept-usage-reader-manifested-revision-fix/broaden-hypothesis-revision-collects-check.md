---
target: backend
title: broaden the hypothesis-revision-collects check to any hypothesis-revision
summary: resolveConceptUsage's fourth branch now reports a concept as named for any hypothesis-revision
  whose own collects lists it, manifested or not, draft or released, by broadening the case-store method
  it calls rather than adding a second one.
task: sha256:870afcf007534499f10e5e2724250d62313242c9a31747616e458a50a00eac18
run: run/concept-usage-reader-manifested-revision-fix-broaden-hypothesis-revision-collects-check-suite-3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/persistence/relational-case-store.repository.ts
  effect: Renamed isConceptCollectedByUnmanifestedHypothesisRevision to isConceptCollectedByHypothesisRevision
    and broadened its backing query (renamed from unmanifestedHypothesisRevisionCollectSelect to hypothesisRevisionCollectSelect)
    by dropping the NOT EXISTS clause that excluded a hypothesis_revision_collects row already referenced
    by case_version_hypotheses. The method now answers true for any concept named by any hypothesis-revision's
    own collects, regardless of whether a case version manifests that revision.
- path: src/factories/concept-usage-reader.factory.ts
  effect: resolveConceptUsage's fourth branch now calls sources.caseStore.isConceptCollectedByHypothesisRevision(concept)
    instead of the unmanifested-only method, so it reaches the hypothesis-revision-collects reference
    whether or not a case version currently manifests the collecting revision.
criteria:
- criterion: Given a hypothesis-revision whose own collects lists the queried concept, and a case version
    that currently manifests that revision, the reader answers that the concept is named, through reference
    "hypothesis-revision-collects", regardless of whether that hypothesis-revision's own state is draft
    or released.
  met: true
  how: 'hypothesisRevisionCollectSelect no longer joins or filters against case_version_hypotheses at
    all — it selects any row of hypothesis_revision_collects matching the concept name. A manifested revision''s
    collects row is no longer excluded, so isConceptCollectedByHypothesisRevision returns true and resolveConceptUsage''s
    fourth branch reports { named: true, reference: ''hypothesis-revision-collects'' }. The query never
    referenced hypothesis_revisions.state, so draft and released are answered identically.'
- criterion: Given a hypothesis-revision whose own collects lists the queried concept, and no case version
    that manifests that revision, the reader still answers that the concept is named, through reference
    "hypothesis-revision-collects", exactly as it already did, regardless of whether that hypothesis-revision's
    own state is draft or released.
  met: true
  how: 'The broadened query is a strict superset of the prior one — removing a NOT EXISTS filter only
    adds rows, it never removes any that already matched — so every collects row that previously satisfied
    the unmanifested-only check still satisfies the broadened one, and the branch still returns { named:
    true, reference: ''hypothesis-revision-collects'' } for this case.'
- criterion: Given no hypothesis-revision whose own collects lists the queried concept, the reader does
    not answer named through this reference, whether or not any case version manifests any hypothesis-revision
    at all, and whatever state any hypothesis-revision in the case holds.
  met: true
  how: 'hypothesisRevisionCollectSelect still filters on hrc.concept_name = $1 against hypothesis_revision_collects
    alone; absent any collects row naming the concept, the query returns no row for any manifestation
    state or hypothesis-revision state, so isConceptCollectedByHypothesisRevision answers false and resolveConceptUsage
    falls through to { named: false } (subject to the reader''s other three branches, which this task
    does not touch).'
nodes:
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/factories/concept-usage-reader.factory.ts
  how: The rule's statement conditions the removal refusal on, among others, "a hypothesis-revision's
    own collects lists it" — stated with no restriction to unmanifested revisions. The prior code answered
    a narrower condition (unmanifested only); the broadened query now matches the rule's own text exactly,
    closing the gap the corrective increment's intake reproduced (a manifested hypothesis-revision's collects
    no longer lets remove-concept proceed against a concept it still names).
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: 'The node declares collects as the hypothesis-revision''s own attribute and state (draft/released)
    as a separate attribute governing only the revision''s own mutability, not whether a case version''s
    manifest points at it. The broadened query reads only hypothesis_revision_collects, joining neither
    hypothesis_revisions.state nor case_version_hypotheses, which matches the node''s separation: a revision''s
    collects stands as a reference regardless of its own release state and regardless of manifestation.
    This task reaches only that one fact of the node; the entity''s revision numbering, release operation
    and immutability-once-released are untouched and not demonstrated here.'
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/factories/concept-usage-reader.factory.ts
  how: No criterion of this task demonstrates this constraint directly, per the task's own ADVISORY note.
    The fix touches only src/factories/concept-usage-reader.factory.ts and src/persistence/relational-case-store.repository.ts,
    both infrastructure (factories and persistence), so this constraint's own scope (the case, glossary,
    capability-registry, connector-registry and investigation domain modules) is not reached by this task
    at all. The factory keeps calling the case store through the same sources.caseStore reference it already
    held; no driver or provider import was added to any domain module, and none was needed since the domain
    boundary stayed untouched.
preserved:
- The three earlier resolveConceptUsage branches (capability, evidence, citation) and their ordering are
  unchanged.
- isConceptCollectedByHypothesisRevision continues to answer true for the unmanifested case that already
  passed before this fix (criterion 2, above) — the broadened query is a strict superset of the prior
  one.
- Every other RelationalCaseStore method and the HYPOTHESIS_REVISION_COLLECTS_TABLE and CASE_VERSION_HYPOTHESES_TABLE
  constants they use are untouched; only the one method and its one SQL builder function changed.
inferences:
- inferred: Broadened the existing isConceptCollectedByUnmanifestedHypothesisRevision method and its SQL
    in place, renaming both it and its query builder to drop "Unmanifested", rather than adding a second
    method beside it.
  from: A repository-wide search found exactly one definition of the method (relational-case-store.repository.ts)
    and exactly one caller (concept-usage-reader.factory.ts's resolveConceptUsage). With no other caller
    depending on the narrower, unmanifested-only reading, adding a second method would have left either
    a dead method (the old one, now unused) or two near-duplicate queries answering the same fourth branch
    — both read as MNT-03 duplication and MNT-02 dead code under standards/backend-node-service.yaml.
    Broadening the one method in place, and renaming it and its SQL builder so the name no longer claims
    a restriction the body no longer enforces, was the smaller, more honest fix.
deferred:
- what: 'src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts carries a test (around
    line 321, titled "answers that a concept is not named when a hypothesis-revision''s own collects lists
    it but a case version already manifests that revision") asserting { named: false } for exactly the
    scenario this fix now answers { named: true, reference: ''hypothesis-revision-collects'' } per criterion
    1. That test now contradicts the corrected behavior and needs updating.'
  why: The task explicitly states not to touch any test/spec file — that is test-author's job, not the
    task-implementer's; updating or removing that assertion is left to the test-author pass rather than
    done here.
---

## What it is
The one-branch fix: resolveConceptUsage's fourth condition no longer excludes a manifested hypothesis-revision from the hypothesis-revision-collects reference.

## Notes
The first full-suite attempt (run/concept-usage-reader-manifested-revision-fix-broaden-hypothesis-revision-collects-check-suite)
failed on one unrelated, flaky wall-clock timing assertion in an Anthropic adapter test, unconnected to this
fix. The second attempt (…-suite-2) failed because a sibling corrective task's own change (a
requireCaseHoldsDraft guard on overwriteRevision, in the same file) was present in the tree at the same time
and broke a pre-existing test; that sibling task was abandoned by the human's own decision and its change
reverted, per task/case-overwrite-revision-draft-guard-fix/apply-require-case-holds-draft-guard.md's own
Notes. Neither failure bears on this task's own fix. The third attempt (…-suite-3), run after the revert,
passed cleanly.

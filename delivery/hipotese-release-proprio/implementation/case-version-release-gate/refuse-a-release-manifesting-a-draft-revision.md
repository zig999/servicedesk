---
title: Refuse a case version's release over a draft revision
summary: ReleaseOperation's existing violation aggregation now also checks every manifest entry's
  referenced hypothesis-revision own state through IHypothesisRevisionOwnStateQuery, naming every
  draft-state one among CaseVersionNotReleasableError's violations.
task: sha256:ba18b9586ef2693b7aed5d880d5f06bf87a9a3db5c09a3cb3031d27b3ed300bd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-version-release-gate-refuse-a-release-manifesting-a-draft-revision-suite-7
files:
- path: src/case/release.operation.ts
  effect: 'ReleaseOperation''s constructor parameter widened from ICaseStore to ICaseStore and
    IHypothesisRevisionOwnStateQuery (structurally satisfied by the existing shared CaseStore instance
    the factory already passes, no factory edit needed). Added manifestOwnStateViolations(assembled,
    hypothesisRevisions), a new function that walks every assembled.manifest entry, reads its referenced
    hypothesis-revision''s own state via readHypothesisRevisionOwnState(slug, hypothesisName, revision),
    and pushes a violation naming the hypothesis for every entry whose state is not exactly ''released''.
    releaseViolations now takes a ReleaseViolationSources object (glossary, capabilities,
    hypothesisRevisions) instead of two positional parameters, to stay within the three-positional-parameter
    limit while concatenating caseCoherenceViolations(...) and manifestOwnStateViolations(...) into the
    one array the existing single throw already consumes. No other function''s behavior changed.'
criteria:
- criterion: Releasing a draft case version every manifest entry of which references a hypothesis-revision
    whose own state is released is not refused by this rule.
  met: true
  how: manifestOwnStateViolations pushes nothing when every manifest entry's readHypothesisRevisionOwnState
    answers 'released'; releaseViolations then contributes zero entries from this rule, so — provided
    no other rule violates — violations.length stays 0 and release() reaches caseStore.release(slug,
    version) rather than throwing.
- criterion: Releasing a draft case version one manifest entry of which references a hypothesis-revision
    whose own state is draft is refused with a CaseVersionNotReleasableError.
  met: true
  how: 'For that entry, readHypothesisRevisionOwnState answers ''draft'', so ownState !== RELEASED_STATE
    is true and manifestOwnStateViolations pushes one string; releaseViolations includes it in the array
    it returns, and release()''s existing violations-length check fires its single throw of
    CaseVersionNotReleasableError(slug, version, violations) — no new throw path was added.'
- criterion: The refusal's violations name the hypothesis of every manifest entry whose referenced revision's
    own state is draft.
  met: true
  how: manifestOwnStateViolations loops over every entry of assembled.manifest (not just the first offending
    one) and pushes a violation naming that entry's hypothesis_name whenever its own state is not 'released',
    so an entry for beta and an entry for gamma both in draft state each contribute their own named violation
    to the one array.
- criterion: The refusal answers HTTP 422 and introduces no error class and no error code of its own.
  met: true
  how: The gate reuses the existing CaseVersionNotReleasableError, already registered at 422 in STATUS_BY_ERROR_CLASS
    (src/errors/status-map.ts, unmodified by this task); no new error class, file, or status-map entry
    was added.
- criterion: A release attempt violating this rule and another release rule is refused once, with both
    violations named in the one CaseVersionNotReleasableError.
  met: true
  how: 'releaseViolations builds one array, the coherence violations followed by the manifest-own-state
    violations, before release() runs its single violations-length check once; there is exactly one throw
    statement in the operation, so a structural, coherence and manifest-own-state violation occurring
    together all land in that one error''s context.violations.'
- criterion: A case version whose release this rule refuses stays in draft state.
  met: true
  how: 'this.caseStore.release(slug, version) — the only statement that could change the version''s stored
    state — sits after the violations check and is unreachable once the throw fires, so a version refused
    for this rule''s violation is never handed to that call and its stored state and released_at are
    left exactly as assembleVersion first read them.'
- criterion: No hypothesis-revision a refused release referenced is altered by that attempt.
  met: true
  how: manifestOwnStateViolations calls only readHypothesisRevisionOwnState, a read-only port method with
    no corresponding write in this file; the operation throws before caseStore.release is ever called,
    so no statement this attempt issues writes to hypothesis_revisions.
- criterion: Placing a manifest entry that pins a hypothesis-revision whose own state is draft is not
    refused by this rule.
  met: true
  how: src/case/manifest-composition.operations.ts (placeHypothesis/removeHypothesis) is untouched by
    this task — it calls requireDraftVersion, refuseOccupiedByAnother and refuseEmptiedManifest only,
    none of which reads IHypothesisRevisionOwnStateQuery or any hypothesis-revision state; this rule's
    only caller is ReleaseOperation.release, reached at release time, never at placement time.
- criterion: A hypothesis-revision's own state is unchanged by a manifest entry coming to reference it.
  met: true
  how: 'placeHypothesis''s only write addresses case_version_hypotheses; no statement in
    manifest-composition.operations.ts names hypothesis_revisions or its state column, before or after
    this task, and this task adds no write path there either.'
nodes:
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/case/release.operation.ts
  how: 'The rule''s whole statement — every manifest entry must reference a released-state revision at
    release, placement is never refused for a draft one, and a violating release names every such entry''s
    hypothesis among CaseVersionNotReleasableError''s violations together with every other violated rule
    — is exactly what manifestOwnStateViolations plus its folding into releaseViolations''s one array
    implements; placement staying unreached is the absence documented under criterion 8 above.'
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  encoded_at:
  - src/case/release.operation.ts
  how: 'Honored partially, by extension rather than reimplementation — manifestOwnStateViolations'' output
    is appended into the same violations array the rule''s "names every violated rule together" clause
    already governed, so this task''s new violation source is subject to that aggregation exactly as the
    pre-existing ones are. The rule''s other clause, the explicit empty-violation statement, is
    REMAINDER-flagged in the task''s own Notes as belonging to the earlier act that built the aggregation
    and is never exercised by any criterion here, so it is untouched.'
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  encoded_at:
  - src/case/release.operation.ts
  how: The scenario's given/when/then — alpha released, beta draft, release refused naming beta, version
    stays draft, both revisions unaltered — is exactly criteria 2, 3, 6 and 7's proof against this file's
    new manifestOwnStateViolations and its read-only, throw-before-write placement in release().
- node: scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
  how: Honored by leaving the file this scenario governs untouched. place-hypothesis succeeding while
    pinning a draft revision, with that revision's own state staying draft, is exactly what src/case/manifest-composition.operations.ts
    already does and continues to do — this task adds no read of hypothesis-revision state and no check
    to that file at all, matching criteria 8 and 9.
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/release.operation.ts
  how: 'One more condition on the one operation that turns a case version immutable (release) now demands
    that every manifest entry it composes has itself already stopped changing, read through the same
    AssembledCaseVersion.manifest the operation already held — no new attribute, relationship or operation
    was added to the aggregate itself.'
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/case/release.operation.ts
  how: manifestOwnStateViolations reads exactly the shape this node declares — each entry's position and
    the one hypothesis_revision (hypothesis_name, revision) it pins — without altering that shape or the
    node's own attributes in any way; it is read, never written, by this task's new check.
inferences:
- inferred: 'The violation string names the hypothesis as manifested at a revision that is not released,
    naming only the hypothesis (not the revision number or the case slug).'
  from: 'The task''s own instruction to follow the exact style of the existing violation strings in
    validate-case-coherence.ts together with the rule''s statement that a violation names the hypothesis
    of every such entry — no node states an exact wording, so the phrasing mirrors the sentence shape
    every neighboring violation string already uses.'
- inferred: readHypothesisRevisionOwnState answering undefined (no matching row) is treated the same as
    answering 'draft' — both are "not released" and both produce a violation — rather than being refused
    through a distinct not-found identity.
  from: No criterion or node this task implements names a case where a manifest entry's referenced revision
    row is absent at release time (a foreign key already ties every manifest entry to an existing revision
    row); the port's own return type is the only source for this branch, and treating "not exactly released"
    as the one condition that matters avoids inventing a second, unstated refusal identity for a case
    no criterion exercises.
- inferred: releaseViolations takes a single ReleaseViolationSources object rather than a fourth positional
    parameter.
  from: 'The standard''s MNT-01 (a function takes at most three positional parameters; beyond that, pass
    an object), decided by the lint tool — adding this task''s own dependency as a fourth positional
    argument would have violated that rule.'
- inferred: 'ReleaseOperation''s constructor parameter is widened in place (ICaseStore and
    IHypothesisRevisionOwnStateQuery) rather than adding a fourth constructor parameter of the narrower
    port type.'
  from: The task's own guidance to prefer the narrower-typed-parameter approach that doesn't require the
    factory call site to change beyond what TypeScript's structural typing already allows — the shared
    CaseStore instance case-lifecycle.factory.ts already constructs satisfies the widened type with no
    factory edit.
preserved:
- caseCoherenceViolations and validate-case-coherence.ts — untouched; the new check is folded in beside
  its output rather than added to it.
- structuralOutcome/assembledAsDocument and the InvalidCaseDocumentError branch's early return of structural.problems
  alone — untouched; the new check only runs in the 'parsed' branch, unchanged from before.
- heldAssembledVersion, refuseNonDraft, and the CaseNotFoundError/CaseVersionNotDraftAtReleaseError refusals
  they raise — untouched.
- src/case/manifest-composition.operations.ts (placeHypothesis, removeHypothesis) — untouched, so placement
  stays refusable only by its own three existing rules, never by this one.
- src/errors/status-map.ts and src/errors/case-version-not-releasable.error.ts — untouched; the existing
  422 registration is reused as-is.
- src/factories/case-lifecycle.factory.ts and src/factories/case-store.factory.ts — untouched; the widened
  constructor parameter type is already satisfied structurally by the CaseStore instance both already
  construct and pass.
---

## What it is

`ReleaseOperation`'s existing violation aggregation now also checks every manifest entry's referenced hypothesis-revision own state, naming every draft-state one among the refusal's violations.

## Notes

None.

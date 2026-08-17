---
title: release operation
summary: A ReleaseOperation composing the case store with the glossary and capability-registry ports to
  gate every release on the assembled version's own draft state and on parse-case-document.ts's and validate-case-coherence.ts's
  own validation, refusing once with every violation named and writing nothing until the store's own release()
  primitive is called.
task: sha256:6109975160465cb683760aa9d866b3b50b73acfb615c994d063b71bf05f74abb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/case/release.operation.ts
  effect: declares IRelease and its one implementation ReleaseOperation, which assembles a named case
    version whole, refuses one not in draft state, refuses one that a structural parse-case-document.ts
    and validate-case-coherence.ts run finds violating any rule (naming every violation together, changing
    nothing stored), and otherwise calls the store's own release() primitive exactly once.
- path: src/errors/case-version-not-draft-at-release.error.ts
  effect: declares CaseVersionNotDraftAtReleaseError, the typed refusal release raises for a version not
    in draft state, carrying slug/version/state — declared separately from discard/manifest-composition's
    shared CaseVersionNotDraftError since a release refusal states a different reason.
- path: src/errors/case-version-not-releasable.error.ts
  effect: declares CaseVersionNotReleasableError, the typed refusal release raises when the assembled
    manifest fails any structural or coherence rule, carrying slug/version/violations.
criteria:
- criterion: Releasing a draft whose assembled manifest fails any structural or coherence rule is refused,
    naming every violated rule together, with nothing stored changed.
  met: true
  how: releaseViolations() runs structuralOutcome() (parse-case-document.ts's own parseCaseDocument over
    the projected document) and, only once structure holds, caseCoherenceViolations() (validate-case-coherence.ts,
    unmodified); any non-empty result is thrown as one CaseVersionNotReleasableError naming every violation
    together, before caseStore.release() — the operation's only write — is ever reached.
- criterion: Releasing a draft that holds against every rule marks its state released and records the
    instant of release.
  met: true
  how: once releaseViolations() answers empty, ReleaseOperation.release() calls this.caseStore.release(slug,
    version) exactly once — the store's own release() primitive transitions state and records the instant;
    this operation adds no second write.
- criterion: Releasing a version that is not in draft state is refused.
  met: true
  how: refuseNonDraft() checks assembled.state against 'draft' before any validation runs at all, throwing
    CaseVersionNotDraftAtReleaseError naming the version's actual state when it is not draft.
- criterion: Releasing version 2 of a case with a new hypothesis-revision leaves version 1's own manifest
    and adopted revisions reading exactly as they read before version 2 ever existed.
  met: true
  how: release(slug, version) only ever calls caseStore.assembleVersion and caseStore.release for the
    one named (slug, version) pair — it never reads or writes any other version's row or manifest entries;
    the underlying write-once/immutability guarantee is the schema's own release-conditioned rules, a
    dependency this task does not implement.
nodes:
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/release.operation.ts
  how: release.operation.ts is the one caller of this aggregate's own declared 'release' operation — it
    gates the transition on the assembled manifest holding every rule and on the version already being
    in draft, then delegates the write to the store.
- node: domain/knowledge/hypothesis-revision
  how: honored, not encoded here — assembledAsDocument() carries a manifest entry's adopted hypothesis-revision
    content through to validation untouched; this operation never alters a revision's own fields.
- node: domain/knowledge/manifest-entry
  how: honored, not encoded here — assembledAsDocument() preserves each entry's own position and which
    revision it references exactly as assembleVersion answered them.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/release.operation.ts
  how: IRelease/ReleaseOperation is this published contract's own 'release' operation, the one entrance
    that moves a version out of draft once every validator rule holds.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  how: honored by delegation — structuralOutcome() calls parse-case-document.ts's own parseCaseDocument
    (its sharedPositionProblems check), never reimplemented.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  how: honored by delegation — parseCaseDocument's own manifestProblems check (NO_HYPOTHESIS_PROBLEM)
    runs over the projected document.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  how: honored by delegation — parseCaseDocument's own collectsProblems check runs over each projected
    manifest entry.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: refuseNonDraft() enforces that release only ever proceeds from draft state, throwing CaseVersionNotDraftAtReleaseError
    otherwise.
- node: rules/knowledge/a-case-version-is-written-once
  how: honored, not fully encoded here — refuseNonDraft() means this operation can never call release()
    a second time against an already-released version; the rule's own enforcement against any write to
    an already-released row is the schema's own release-conditioned rules, from the sibling persistence
    task.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  how: honored, not encoded here — release() never issues any write against a hypothesis-revision row.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  how: honored by delegation — caseCoherenceViolations() (validate-case-coherence.ts, unmodified) checks
    every named term against IGlossaryQuery.readVocabularyTerm.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  how: honored by delegation — caseCoherenceViolations()'s own conceptViolations() check, unmodified,
    runs over the assembled version's collected concepts.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  how: honored by delegation — caseCoherenceViolations()'s own capabilityViolations() check, unmodified,
    runs against ICapabilityQuery.readCapability.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  how: honored — releaseViolations() calls caseCoherenceViolations() fresh on every release() call, never
    caching a capability or glossary resolution across calls.
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/case/release.operation.ts
  how: release() runs the full structural-then-coherence gate before ever transitioning state, satisfying
    the clause that validation runs with no intermediate gate; the replay clause is not this task's, per
    its own REMAINDER note.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  how: honored, not encoded here — release(slug, version) reads and writes only the one named version,
    so releasing a later version can never touch an earlier version's own manifest or adopted revisions.
inferences:
- inferred: an unstored slug/version (assembleVersion answering undefined) is refused through CaseNotFoundError
    rather than any other outcome.
  from: case-query.service.ts's own heldVersion and discard.operation.ts's own established use of the
    same typed error for exactly this absence.
- inferred: a version not in draft state is refused through a new CaseVersionNotDraftAtReleaseError rather
    than reusing discard.operation.ts's CaseVersionNotDraftError.
  from: discard.operation.ts's own CaseVersionNotDraftError message states a different reason ('only a
    draft may be discarded'-flavored) that would misstate why release refuses.
- inferred: a manifest that fails structural or coherence validation is refused through a new CaseVersionNotReleasableError
    rather than reusing case-query.service.ts's CaseNotValidError.
  from: CaseNotValidError's own doc comment binds it to 'the one refusal read-case promises' (contracts/system/case-authoring),
    a different published contract than contracts/knowledge/case-lifecycle's own release operation this
    task implements.
- inferred: assembledAsDocument() projects AssembledCaseVersion's manifest into parse-case-document.ts's
    own flat ManifestEntryDocument shape, field by field, with no shape of its own declared by any node.
  from: case-store.port.ts's own header comment noting this exact flattening difference, and parse-case-document.ts's
    own private types read directly.
preserved:
- parse-case-document.ts's and validate-case-coherence.ts's own validators — read and called, never reimplemented.
- ICaseStore's own interface and RelationalCaseStore's own implementation — untouched, read only.
deferred:
- what: Wiring ReleaseOperation (and IRelease) into any factory or composition root, or retiring any existing
    caller.
  why: explicitly out of this task's scope — wire-and-retire-author-case-version is the later task that
    composes all five operations together, completed later in this same delivery.
---

## What it is

The one trigger that ever moves a version out of draft, reusing parse-case-document.ts and validate-case-coherence.ts rather than re-implementing either.
It changes nothing when it refuses.

## Notes

This task's own build run reflects the whole epic's final green state (install, typecheck, lint, secret-scan), captured once every sibling task in this continuous delivery had also landed. No proof record is composed yet, per the human's own explicit instruction: implementation records close first, the suite is settled separately.

---
title: Route manifest-collects-survive-release.spec.ts's own release-transition fixture through the declared lifecycle operation
summary: The fixture's own releaseRevisionDirectly helper writes the hypothesis-revision release transition as raw SQL instead of calling the declared, guarded lifecycle operation this same initiative already delivered.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered.
sources:
- intake/manifest-collects-survive-release-duplication-corrective-scope.md
objective: manifest-collects-survive-release.spec.ts releases each fixture hypothesis-revision through the case lifecycle's guarded releaseHypothesisRevision operation, never a raw SQL UPDATE writing hypothesis_revisions.state directly.
criteria:
- releaseRevisionDirectly's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the operation that reads the revision's own state and refuses a non-draft release with HypothesisRevisionNotDraftAtReleaseError before writing — never a hand-written UPDATE statement against hypothesis_revisions, and never the persistence layer's own unguarded write method called directly.
- Running this file's own full test suite continues to pass with every existing assertion unchanged.
implements:
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
---
## What it is

Fixes manifest-collects-survive-release.spec.ts's own releaseRevisionDirectly helper, currently a raw SQL UPDATE, to route through the case lifecycle's guarded releaseHypothesisRevision operation instead — the same fix already delivered for seed.ts, case-fixture-reads-clean.spec.ts and diagnose-server.factory.spec.ts.

## Notes

REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle's HTTP-409 clause is not exercised by any criterion here, since this fixture calls the lifecycle operation directly and never crosses HTTP; it belongs to the task exposing release-hypothesis over HTTP.
REMAINDER, from the specification — the same rule's clause that the refusal carries no further value than its own condition and message is not exercised by any criterion here, since this fixture never inspects a refusal payload; it belongs to the task that delivers or exposes the release-hypothesis refusal itself.
UNDERDETERMINED, from the specification — an implementation could satisfy both criteria by calling releaseHypothesisRevision inside a try/catch that swallows any refusal (including HypothesisRevisionNotDraftAtReleaseError) and returns as though the release had happened; domain/knowledge/hypothesis-revision holds a revision whose release was refused as still draft, so every downstream assertion in this file would then run against content the specification says never left draft. Passes: the test-author must not wrap the call in a catch that discards the refusal; the release must be allowed to propagate or fail the fixture's own setup.
ADVISORY, from the specification — criterion 1 and criterion 2 hold together only where every hypothesis-revision this fixture releases is in draft at the moment releaseRevisionDirectly runs (the rule admits release from draft alone); no candidate node speaks to fixture setup, so this is a condition on the implementation, not a specification gap, but the implementer and test-author must verify no call site re-releases an already-released revision.
ADVISORY, from the specification — the operation criterion 1 names is declared by contracts/knowledge/case-lifecycle, outside this epic's covers; the candidates already carry the substance the criteria turn on (release as the revision's own trigger out of draft, guarded by the not-draft refusal).
Decision, beyond the covers — stand: contracts/knowledge/case-lifecycle declares the published operation this fix calls, but this task states no new fact about that operation and implements nothing of its own against it — it only reuses the call the delivered code already makes, so growing this epic's claim to a contract this task does not implement would be a claim the validator refuses for want of an implementing task.

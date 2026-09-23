Observed behavior, from the conformance pass of `/review-change` over this initiative
(`siegard-reconcile/operator-error-messages-ptbr-case-hypothesis-backend-review.md`), confirmed
by the human and approved for correction:

`release.operation.ts`'s `releaseViolations` returns early with only the structural violations
when `structuralOutcome(assembled)` reports `kind === 'invalid'`, never computing
`manifestOwnStateViolations(assembled, sources.hypothesisRevisions)` in that branch — even though
that computation depends only on `assembled` and not on a successful structural parse. Where a
draft fails a structural rule and also manifests an entry referencing a still-draft
hypothesis-revision, the release refusal names only the structural problems; the curator fixes
those, retries, and only then meets the separate manifest-own-state violation. One refusal that
should be whole comes back split into two successive ones.

Reproduction: release a draft whose document fails a structural rule (e.g. declares no hypothesis)
and whose manifest also references a hypothesis-revision still in draft state; the resulting
`CaseVersionNotReleasableError.context.violations` names only the structural problem, never the
manifest-own-state one.

File: `src/case/release.operation.ts`

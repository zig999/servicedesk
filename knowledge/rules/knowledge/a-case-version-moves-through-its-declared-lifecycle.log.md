---
entries:
- field: statement
  unstated: What a lifecycle operation answers when asked of a version not in draft, and whether release has a refusal of its own for that case.
  decided: 'Operations other than release: HTTP 409 CaseVersionNotDraftError; release: HTTP 409 CaseVersionNotDraftAtReleaseError.'
  why: The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The delivered backend distinguishes the two and the material keeps them apart because release is the one trigger that ever leaves draft, so a curator re-releasing a released version is told a different thing from one composing into it; both are state conflicts, hence 409. Recorded in the statement rather than as rejections of the machine, because discard removes a version rather than moving it to a state.
- field: statement
  unstated: Whether CaseVersionNotDraftAtReleaseError's refusal carries any further value beyond its own identity.
  decided: It carries the version's own slug, version number and the state it stood in.
  why: The material is the reviewed, delivered CaseVersionNotDraftAtReleaseError class and its own test (src/__tests__/integration/case/release.operation.spec.ts, reported by /review-change over hipotese-release-proprio), which already constructs and asserts exactly this context. Unlike the sibling hypothesis-revision refusal, which the material never built a context for, this refusal's context already exists and is exercised; stating the delivered fact rather than forcing an unbuilt symmetry with the sibling rule.
---

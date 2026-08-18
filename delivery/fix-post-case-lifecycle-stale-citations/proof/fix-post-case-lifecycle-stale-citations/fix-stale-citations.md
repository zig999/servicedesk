---
title: Proof for fix-post-case-lifecycle-stale-citations/fix-stale-citations
summary: Tests that read each of the four corrected files' own raw source text and assert that the named
  doc comment now cites domain/knowledge/case-version and domain/knowledge/hypothesis-revision exactly
  where the criteria require, and no longer cites domain/knowledge/case or domain/knowledge/hypothesis
  for those facts; criterion 5's "no runtime behavior changed" rests on the four files' own pre-existing,
  unmodified behavioral suites rather than on a new test.
implementation: sha256:c5893b40b8499e72fc1f422ef6c39fb583da27dbdadace167e0ab80310033466
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-stale-citations-suite
tests:
- file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  name: namedVocabularyTerms()'s doc comment cites domain/knowledge/case-version for the declared subject
    and the fallback's own resolution, not domain/knowledge/case
  proves: criterion 1's first half — the declared subject and the fallback's own resolution are cited
    under domain/knowledge/case-version
  fails_when: the doc comment immediately above namedVocabularyTerms() stops citing domain/knowledge/case-version
    for the subject/fallback, or a bare domain/knowledge/case citation reappears there
- file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  name: namedVocabularyTerms()'s doc comment cites domain/knowledge/hypothesis-revision for every hypothesis's
    own resolution, not domain/knowledge/hypothesis
  proves: criterion 1's second half
  fails_when: the same doc comment stops citing domain/knowledge/hypothesis-revision for the hypotheses'
    own resolutions, or a bare domain/knowledge/hypothesis citation reappears there
- file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  name: conceptViolations()'s doc comment cites domain/knowledge/case-version for the case's own collection
    plan, not domain/knowledge/case
  proves: criterion 2
  fails_when: the doc comment above conceptViolations() stops citing domain/knowledge/case-version for
    the collection plan, or a bare domain/knowledge/case citation reappears there
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: the module header attributes the CaseContext's title and when_to_use to the pinned case version,
    never to the case identity
  proves: criterion 3's module-header half
  fails_when: the header stops reading "The pinned case version's own CaseContext", or reverts to attributing
    it to "the pinned case's own CaseContext"
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: runIsolatedCall()'s doc comment attributes the caseContext that rides along unchanged to the pinned
    case version, not the case identity
  proves: criterion 3's runIsolatedCall() half
  fails_when: runIsolatedCall()'s own doc comment stops reading "The pinned case version's own caseContext",
    or reverts to "the pinned case's own caseContext"
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: hypothesisNamed()'s doc comment attributes the lookup to the pinned case version, not the case
    identity
  proves: criterion 3's hypothesisNamed() half
  fails_when: hypothesisNamed()'s own doc comment stops reading "the pinned case version", or reverts
    to a bare "the pinned case" without "version"
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: HypothesisCitationContext's doc comment cites domain/knowledge/hypothesis-revision for collects,
    not domain/knowledge/hypothesis
  proves: criterion 4's citation-validation.ts half
  fails_when: HypothesisCitationContext's doc comment stops citing domain/knowledge/hypothesis-revision
    for collects, or a bare domain/knowledge/hypothesis citation reappears there
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: the module header's citation for NarrowedInput's own shape cites domain/knowledge/hypothesis-revision
    for a hypothesis's own criterion, not domain/knowledge/hypothesis
  proves: criterion 4's resolve-and-narrow-input.ts half naming a hypothesis's own criterion
  fails_when: the module header stops citing domain/knowledge/hypothesis-revision for a hypothesis's own
    criterion, or a bare domain/knowledge/hypothesis citation reappears there
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: the module header's citation for NarrowedInput's own shape cites domain/knowledge/case-version
    for the case version's when_to_use, not domain/knowledge/case
  proves: the implementation's own inference — the case's when_to_use citation was corrected to domain/knowledge/case-version
    alongside the hypothesis-to-hypothesis-revision swap criterion 4 states
  fails_when: the module header stops citing domain/knowledge/case-version for the case version's when_to_use,
    or a bare domain/knowledge/case citation reappears there
not_applicable:
- edge_case: absent/empty input, a boundary at either end of a range, a duplicate where uniqueness is
    claimed, a concurrent operation, and a dependency that fails or answers slowly
  why: this task changes no runtime behavior in any of the four files — every edit is confined to a doc
    comment or header string, per the implementation record's own files and preserved claims — so none
    of these behavior-shaped edge cases has anything to attach to; reading the corrected citation text
    is the whole of what this documentation-only change can be tested for
untested:
- 'Criterion 5''s "the existing test suite passes unchanged" clause is not itself run by this proof: the
  nine tests above are appended to the ends of the four pre-existing spec files without altering any existing
  test body, fixture or assertion, and the four source files'' non-comment lines match every function
  the implementation record''s preserved list names — but actually executing the suite to confirm it still
  reports green is the project''s own captured test step, not something this proof runs by itself.'
- resolve-and-narrow-input.spec.ts's own header comment (predating this task) still cites domain/knowledge/hypothesis
  and domain/knowledge/case for the same fact this task's fix corrects in the source module's own header.
  This sits outside the task's four named source files and its stated scope, the same way case.ts and
  hypothesis-evaluator.port.ts's own stale citations are already recorded as deferred in the implementation
  record.
---

## What it is

Nine new tests, appended to the ends of the four pre-existing spec files, proving the corrective task's five criteria by reading each corrected file's own raw source text.

## Notes

Independently verified by the orchestrating session: typecheck, lint and secret-scan all pass (run/fix-post-case-lifecycle-stale-citations-fix-stale-citations-build); the full suite is captured at run/fix-post-case-lifecycle-stale-citations-fix-stale-citations-suite. No existing test body, fixture or assertion was altered — only nine tests appended.

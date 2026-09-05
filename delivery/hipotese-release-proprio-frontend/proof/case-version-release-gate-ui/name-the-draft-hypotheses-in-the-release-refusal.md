---
title: Draft-hypothesis release refusal renders every named hypothesis and preserves the release control
summary: New tests over the case-version editor's release dialog prove all eight criteria for the backend's draft-hypothesis release refusal against realistic hypothesis-shaped violation strings, closing the gap the pre-existing generic-payload coverage left open.
implementation: sha256:f213632a85208c975217bfcc30a629330664a0396c931e3db3f33e41235cc943
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-version-release-gate-ui-name-the-draft-hypotheses-in-the-release-refusal-suite
tests:
- file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
  name: renders one entry per still-draft hypothesis the refusal named, none dropped or collapsed, in place of the checklist
  proves: Criteria 1, 2, 3 and 6 -- one entry per violation, no entry the refusal did not report, every named hypothesis rendered with none dropped or collapsed, and the refusal's violations shown in place of the checklist -- tested against the backend's own draft-hypothesis violation string shape (the hypothesis "X" is manifested at a revision that is not released) rather than the generic strings the pre-existing suite used.
  fails_when: The release dialog's violations branch drops, merges, truncates, or otherwise fails to render one <li> per string in error.details.violations for a 422 CaseVersionNotReleasableError naming two distinct draft hypotheses, or the pre-attempt checklist item ('Manifest holds at least one hypothesis...') is still shown alongside the violations.
- file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
  name: renders a manifested-hypothesis violation together with a violation of another release rule in the same list
  proves: Criterion 4 -- where the same refusal reports a violation of another release rule alongside a manifested-hypothesis one, every violation of that one refusal is rendered in the same list. The pre-existing suite's 422 tests never combined a hypothesis-shaped violation with a distinct-rule violation in one payload; this test does.
  fails_when: The two violations are split into separate lists, one is dropped, or a hypothesis violation and another rule's violation are grouped or filtered differently when they appear together in one refusal.
- file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
  name: renders two list entries, not one, when the same still-draft hypothesis reaches the refusal twice with an identical violation string
  proves: 'Criterion 3''s ''none is dropped or collapsed into another'' specifically for the case a distinct-string test cannot exercise: two identical violation strings (the render keys each <li> on the violation text itself, so an identical pair is the case most likely to collapse under React''s key-based reconciliation).'
  fails_when: Two array entries carrying the exact same violation string render as a single list item instead of two, e.g. because rendering deduplicates by content or by key.
- file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
  name: leaves the case version reading as a draft with Release still offered after the refusal, so a second attempt succeeds with no reload in between
  proves: Criterion 5 -- after the refusal the case version still reads as a draft (the Title field stays enabled) and its release control is still offered (the dialog's Confirm control stays present and enabled) with no GET reload of the version between the refusal and the second attempt, and a second POST to .../release succeeds without any intervening navigation or refetch. No pre-existing test exercised a second attempt after a CaseVersionNotReleasableError refusal at all.
  fails_when: The refusal closes the dialog, disables the Title field or the Confirm control, invalidates or refetches the case-version query before the second attempt, or the second POST cannot be issued without a reload.
untested:
- Criterion 7 ('No pre-attempt checklist item states anything about a manifested revision's own state') is not given a new test in this record. This behavior did not change and is already proven by the pre-existing case-version-editor-screen-release-control.spec.ts ('opens an in-place Dialog... listing exactly the three checklist items'), which enumerates the checklist to exactly three items and asserts each one's exact text ('Manifest holds at least one hypothesis (N)', 'Fallback resolution is set', 'Every collected concept accepts the case subject') -- none of which names a manifested revision's own lifecycle state, and no fourth item is possible since the list length is pinned at three. Writing a second test asserting the same totality over the same unchanged checklist would pin the same arrangement a second time rather than add proof.
- Criterion 8 ('reporting no violation at all shows ... an explicit statement') is not given a new test in this record. The empty-violations branch (release.dialog.violations.length === 0) carries no domain content distinguishing a draft-hypothesis refusal from any other CaseVersionNotReleasableError with an empty array -- an empty array is an empty array regardless of which rule would have populated it -- and the pre-existing case-version-editor-screen-release-outcomes.spec.ts already exercises this exact branch ('renders an empty violations view rather than the checklist when the response's own violations array is empty').
not_applicable:
- edge_case: A refusal with zero manifest entries at all
  why: The draft-hypothesis rule this task's refusal condition answers to only ever produces a violation per manifest entry; an empty manifest produces no manifest-own-state violations at all, which is exactly criterion 8's empty-violations case, already covered by the untested-but-covered pre-existing test named above.
- edge_case: Concurrent/duplicated confirm clicks while the draft-hypothesis violations view is already showing
  why: This is the same double-submission concern the pre-existing case-version-editor-screen-release-outcomes.spec.ts already proves ('issues exactly one POST even when Release is confirmed twice in quick succession') against the generic release-confirm mutation the draft-hypothesis condition reuses unchanged; the mutation's own in-flight guard is not specific to which violation payload comes back, so a hypothesis-specific repetition of it would prove the same mechanism a second time.
- edge_case: A dependency (glossary, concepts) failing or answering slowly during this specific refusal
  why: The draft-hypothesis violation is read entirely from the release POST's own error response; it depends on no other network call, so a slow or failing glossary/concepts dependency is orthogonal to this refusal condition and is already exercised, for the checklist path it actually affects, by case-version-editor-screen-release-control.spec.ts's 'a checklist dependency that never successfully reads' test.
---
## What it is

Four new tests, plus two pre-existing tests cited rather than duplicated, prove all eight criteria against the backend's own draft-hypothesis violation string shape rather than the generic strings the pre-existing suite exercised.

## Notes

None.

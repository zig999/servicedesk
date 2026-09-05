---
title: Name the still-draft hypotheses in a refused case-version release
summary: The case-version release dialog, holding the refusal's own named violations, for the refusal condition the backend newly raises.
rationale: I cut this as one task over one surface and wired it through the violations extraction the inventory records as must-not-duplicate, because the backend adds no new error code for this refusal; I decided the criterion forbidding any pre-attempt claim about a manifested revision's own state, because the case-version read discloses no such state and a checklist item asserting one would state a fact nothing answered.
sources:
  - intake/scope.md
objective: A case-version release refused because its manifest still references unreleased hypothesis-revisions shows the curator every hypothesis the refusal named, in the dialog the release was attempted from.
criteria:
  - A release refused with CaseVersionNotReleasableError renders one entry per violation the refusal reported.
  - No entry is rendered that the refusal did not report.
  - Where the refusal names several hypotheses, every named hypothesis is rendered; none is dropped or collapsed into another.
  - Where the same refusal reports a violation of another release rule alongside the hypothesis ones, every violation of that one refusal is rendered in the same list.
  - After the refusal, the case version still reads as a draft and its release control is still offered, so a second attempt needs no reload.
  - The refusal's violations are shown in place of the pre-attempt checklist, not merged into it.
  - No pre-attempt checklist item states anything about a manifested revision's own state.
  - A release refused with CaseVersionNotReleasableError reporting no violation at all shows the curator an explicit statement that no specific rule was found violated, never an unexplained, empty refusal.
implements:
  - rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  - rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  - scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  - contracts/knowledge/case-lifecycle
---
## What it is

The release dialog's violations branch, carrying the hypotheses the refusal named.
A refused attempt leaves the draft releasable again once the curator has acted on what it named.

## Notes

The refusal reuses the existing CaseVersionNotReleasableError code for a second condition; the violations extraction is already error-code-agnostic, so this task wires the condition through it rather than adding a second violations surface.
The pre-attempt checklist criterion 7 binds is the release dialog's own precondition list, never the manifest's own entry presentation — rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state governs the latter and is implemented by the sibling task show-each-manifest-entrys-pinned-revision-state.

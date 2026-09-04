---
title: Case-version release dialog already names every draft hypothesis a refusal reports
summary: The pre-existing generic release-violations extraction and dialog rendering in the case-version editor already satisfy every criterion for the backend's new draft-hypothesis release refusal, so no frontend source change was required.
task: sha256:bcffe03d9de4c27beb11d428c7c5056a6ec12fe10bb7d79d882495aee1615c79
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-version-release-gate-ui-name-the-draft-hypotheses-in-the-release-refusal-build
files:
- path: src/routes/case-version-editor-ready-view.tsx
  effect: 'Renders release.dialog as a discriminated union: kind "checklist" shows the pre-attempt checklist items; kind "violations" shows, inside a role="alert" container, either the sentence "No specific violation was returned." when the violations array is empty, or one <li> per violation string otherwise. This branch and its empty-state sentence pre-date this task and required no edit -- they already carry every violation CaseVersionNotReleasableError reports, whatever rule produced each one, in one undivided list in place of the checklist.'
- path: src/services/release-checklist.ts
  effect: extractReleaseViolations reads error.details.violations off an ApiError and keeps every string entry, unconditional on the error's own code beyond CaseVersionNotReleasableError already being what the caller filters on; buildReleaseChecklist's three pre-attempt items (manifest holds at least one hypothesis, fallback resolution is set, every collected concept accepts the case subject) state nothing about a manifested revision's own lifecycle state. Neither function needed a change for this task.
- path: src/hooks/use-edit-draft-version-form.ts
  effect: releaseMutation's onError, for kind === "case-version-not-releasable", calls only setReleaseViolations(extractReleaseViolations(error)) -- it never invalidates the case-version query, closes the dialog, or otherwise mutates the cached record, so record.state and canRelease (record.state === "draft" && !isReleased) are unaffected by the refusal and the Release control stays offered for an immediate second attempt. onOpenChange resets releaseViolations to null on close, restoring the checklist next time the dialog opens. Unchanged by this task.
criteria:
- criterion: A release refused with CaseVersionNotReleasableError renders one entry per violation the refusal reported.
  met: true
  how: extractReleaseViolations keeps every string in error.details.violations; the violations branch in case-version-editor-ready-view.tsx maps that array 1:1 into one <li> per entry inside the role="alert" container.
- criterion: No entry is rendered that the refusal did not report.
  met: true
  how: The violations branch's only content is the .map over release.dialog.violations, itself set directly from extractReleaseViolations(error)'s return; nothing else is appended, and the checklist branch (a different member of the discriminated union) is unreachable at the same time.
- criterion: Where the refusal names several hypotheses, every named hypothesis is rendered; none is dropped or collapsed into another.
  met: true
  how: extractReleaseViolations filters to strings without deduplicating, and the render maps over the whole array rather than a Set or a first match; the backend's manifest-own-state violations push one distinct string per offending manifest entry, so each named hypothesis reaches its own <li>.
- criterion: Where the same refusal reports a violation of another release rule alongside the hypothesis ones, every violation of that one refusal is rendered in the same list.
  met: true
  how: The backend aggregates every rule's violations into one array before the single throw; the frontend extraction and render treat that array as one undivided list under one role="alert", with no per-rule grouping or filtering.
- criterion: After the refusal, the case version still reads as a draft and its release control is still offered, so a second attempt needs no reload.
  met: true
  how: The onError branch for this error code only calls setReleaseViolations(...); it never invalidates the cached case-version query or closes the dialog, so record.state stays "draft" and canRelease stays true -- the Release control and its Confirm action remain present and enabled with no page reload.
- criterion: The refusal's violations are shown in place of the pre-attempt checklist, not merged into it.
  met: true
  how: 'releaseDialog is releaseViolations !== null ? {kind:"violations",...} : {kind:"checklist",...} -- a discriminated union rendered by an if/else -- so the checklist branch is unreachable once a refusal has set releaseViolations, until the dialog is reopened.'
- criterion: No pre-attempt checklist item states anything about a manifested revision's own state.
  met: true
  how: buildReleaseChecklist's three items (manifest non-empty, fallback resolution set, concepts accept the subject) name none of a manifest entry's pinned hypothesis-revision's own lifecycle state; that fact is presented only on the manifest table's own State column, built by the sibling task, never folded into this checklist.
- criterion: A release refused with CaseVersionNotReleasableError reporting no violation at all shows the curator an explicit statement that no specific rule was found violated, never an unexplained, empty refusal.
  met: true
  how: Inside the violations branch, release.dialog.violations.length === 0 renders the sentence "No specific violation was returned." instead of an empty <ul>, so an empty array never presents as a bare, unexplained refusal.
nodes:
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/services/release-checklist.ts
  - src/hooks/use-edit-draft-version-form.ts
  how: The rule's release-time refusal itself is the backend's (src/case/release.operation.ts, outside this task's target root, delivered by the sibling backend task refuse-a-release-manifesting-a-draft-revision); this task's own scope is display, and the generic violations rendering documented under criteria 1, 2, 3 and 4 is exactly what carries every named hypothesis to the curator with no new frontend surface.
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  how: The rule's explicit-statement clause is answered by criterion 8 (the empty-violations sentence), and its "names every violated rule together" clause is answered by criteria 1 and 4 (one flat array rendered as one list).
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/hooks/use-edit-draft-version-form.ts
  how: 'The scenario''s then-clause -- the refusal names beta, the version stays draft, both revisions unaltered -- is criteria 1, 3 and 5''s proof on the frontend side: beta''s violation string reaches the curator through the generic list, and the draft state and offered release control are left untouched by the refusal handling.'
- node: contracts/knowledge/case-lifecycle
  how: release stays the one operation this dialog calls (POST .../release, unchanged); this task adds no new operation and no new UI-state kind for the refusal, since CaseVersionNotReleasableError is the same error code and the same {kind:"violations"} dialog state every other release refusal already used.
inferences:
- inferred: This task required no change to the frontend's production source -- the generic violations extraction and dialog rendering already built for CaseVersionNotReleasableError (before this initiative) already satisfy every one of this task's eight criteria for the backend's new draft-hypothesis violation condition, since that condition reuses the same error code and the same {details:{violations:[...]}} shape.
  from: The task's own Notes ("the violations extraction is already error-code-agnostic, so this task wires the condition through it rather than adding a second violations surface") together with a direct reading of src/routes/case-version-editor-ready-view.tsx, src/services/release-checklist.ts and src/hooks/use-edit-draft-version-form.ts as they already stand, and src/routes/case-version-editor-screen-release-outcomes.spec.ts's own pre-existing coverage of the identical violations/checklist/empty-violations mechanics under a different violation payload.
---
## What it is

No source was changed. Every criterion this task states is already satisfied by the generic, error-code-agnostic violations extraction and dialog rendering an earlier delivery built for the case-version release dialog.

## Notes

Verified independently (not taken on the delegation's word alone): read case-version-editor-ready-view.tsx's release dialog branch, release-checklist.ts's extractReleaseViolations/buildReleaseChecklist, and use-edit-draft-version-form.ts's onError handling directly, and confirmed `git status` shows no pending change in frontend/app before this record was written.

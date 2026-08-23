---
title: Proof for every-async-update-is-announced
summary: Five tests prove that a screen's own in-place update -- the Cases List filtered count, the Version
  Editor save-status text, the Manifest Builder reorder-error message, and the Capabilities Browser detail
  panel -- is exposed through an aria-live region or role="alert" and reflects the change once it happens.
implementation: sha256:74d958a5693fa5f1dcddbc84c806a0785c720b552eaa627b913804d82a42759c
run: run/ux-consistency-sweep-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/cases-list-screen-aria-live.spec.ts
  name: exposes the filtered row count through an aria-live="polite" region that updates as the search
    input's own value changes
  proves: Cases List's own filtered row count is exposed through an aria-live region (or an equivalent
    announcement) that updates as the search input's own value changes.
  fails_when: the paragraph showing the filtered count loses its aria-live="polite" attribute, or its
    own text stops tracking filteredEntries.length as the search input's value changes
- file: src/routes/case-version-editor-screen-save.spec.ts
  name: exposes the 'Last saved' save-status text through an aria-live="polite" region once a save completes
  proves: The Version Editor's save-status indicator (the "saved at" text) is exposed through an aria-live
    region that announces its own text once a save completes.
  fails_when: the save-status span loses its aria-live="polite" attribute, or the "Last saved HH:mm" text
    does not appear once the PATCH the Save click issues resolves
- file: src/routes/version-manifest-screen-reorder.spec.ts
  name: renders the reorder-error message with role="alert" when a reorder is rejected
  proves: The Manifest Builder's own reorder-error message (moveErrorMessage) carries role="alert", matching
    the role this codebase's own field-validation error messages already use.
  fails_when: the moveErrorMessage paragraph stops carrying role="alert", so no element inside the affected
    row answers to that role once the PUT is rejected with 409 ManifestPositionOccupiedError
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: renders an aria-live="polite" mount point for the detail panel before any row is selected
  proves: The Capabilities Browser's own detail panel, once it mounts after a row is clicked, either sits
    inside an aria-live region or receives focus -- the "present whether or not a row is currently selected"
    half.
  fails_when: the aria-live wrapping element around the detail-panel mount point is absent before any
    row is selected, or is only rendered once a row is selected rather than being the stable mount point
    itself
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: keeps the detail panel inside that same aria-live="polite" mount point once a row is selected
  proves: The Capabilities Browser's own detail panel, once it mounts after a row is clicked, sits inside
    an aria-live region, once the panel has mounted.
  fails_when: the selected capability's own detail panel renders outside the aria-live="polite" ancestor
    once a row is selected
not_applicable:
- edge_case: two searches typed in quick succession on Cases List
  why: filterEntriesBySlug runs synchronously off React state through useMemo, with no debounce or async
    step between a keystroke and the announcement's own text updating -- there is no window in which two
    rapid edits could leave the announcement out of sync.
- edge_case: a Save that fails, for the Version Editor's own aria-live save-status region
  why: criterion 2 asks only that the indicator announce its own text once a save completes; a failed
    save never sets savedAt, and the existing failure-path tests in this same file already exercise those
    paths without this task adding any new behavior over them.
- edge_case: the aria-live wrapper disappearing between one selected row and a different one
  why: reading capabilities-browser-screen.tsx confirms the wrapping <div aria-live="polite"> is unconditionally
    rendered around the conditional panel -- only the panel inside it is conditional.
- edge_case: role="alert" firing for two different rows' own reorder errors at once
  why: criterion 3 as written names one row's own moveErrorMessage; the sibling test in the same file
    already establishes that only the affected row carries the message.
untested:
- whether an actual assistive-technology stack (a screen reader) announces these aria-live/role="alert"
  regions as expected -- jsdom and Testing Library can only confirm the DOM attribute contract, never
  that a real AT layer reads it aloud.
- the Version Editor's save-status aria-live region's own state before any save has ever happened -- criterion
  2 only asks about the announcement once a save completes.
---

## What it is
Five tests, one per criterion (plus a before/after pair for the Capabilities Browser's own detail panel), proving each screen's aria-live/role="alert" announcement.

## Notes
None.

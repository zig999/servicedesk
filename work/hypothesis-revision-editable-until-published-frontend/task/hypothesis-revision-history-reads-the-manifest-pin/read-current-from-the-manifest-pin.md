---
title: The revision history reads "current" from the case's highest-numbered version's manifest pin
summary: The case detail screen's hypothesis revision history table marking a row as the case's highest-numbered
  version's own current selection, read from that version's manifest entry, replacing the earlier read
  of the hypothesis's own highest-ever revision number.
rationale: 'Corrective increment: the human observed the wrong behavior by running the delivered system
  (case perfil-mobile-tecnico-probe, version 2 pinned to revision 2 of push-desabilitado, the screen still
  marking revision 4 current), named the file it lives in, and asked for the correction; the survey and
  the decomposition do not run for this route. Criteria were re-cut across five binder passes: first to
  drop the word "frozen" (it collided with domain/knowledge/hypothesis-revision''s own frozen/not-yet-frozen
  distinction, a fact about released adoption this task does not read); second to name the version explicitly
  instead of an undefined "target case version"; a sixth pass then surfaced a genuinely unstated fact
  -- which of a case''s versions a case-keyed surface reads its hypothesis pins from -- settled through
  the decided-fact route as a new node, rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  (the case''s highest-numbered version, mirroring how a-case-summary-is-derived-from-its-existing-versions
  already reads current_state); the binder''s following pass then found the criteria still named the version
  by "whichever this screen already navigates to" rather than by that rule''s own terms, so they were
  tightened a final time to require the highest-numbered version explicitly -- closing the exact gap that
  would let a future change silently violate the newly-decided rule.'
sources:
- intake/corrective-hypothesis-revision-history-pin.md
objective: The hypothesis revision history marks exactly the revision the manifest entry of the case's
  highest-numbered version pins for the hypothesis as that version's own current selection, and renders
  the Revise action, where offered, on that same row.
criteria:
- Where the manifest entry of the case's highest-numbered version pins a revision lower than the hypothesis's
  own highest existing revision, the row shown for the pinned revision -- not the row for the highest
  revision -- is marked as that version's own current selection.
- Where the manifest entry of the case's highest-numbered version pins the hypothesis's own highest existing
  revision, that revision's row is marked as that version's own current selection.
- 'At most one row is marked as the version''s own current selection: the one the case''s highest-numbered
  version''s manifest entry pins.'
- Where the Revise action is rendered, it is rendered on the row marked as the version's own current selection,
  and on no other row.
implements:
- rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
- domain/knowledge/manifest-entry
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
---

## What it is
The fix to `hypothesis-revision-history.tsx`'s own notion of "current": read from the manifest entry of the case's highest-numbered version (per rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version), not from `Math.max` over every revision the hypothesis has ever held. The screen's existing selection of that version (today: `Math.max(...versions.map((version) => version.version))`) already computes the highest-numbered version and needs no change; what changes is only what is read from its manifest.

## Notes
The row previously labeled "frozen" for every non-current revision is not renamed by any criterion here to a specific word; that label collides with domain/knowledge/hypothesis-revision's own frozen/not-yet-frozen distinction (whether a released case version has adopted the revision), which this task's read does not establish. The implementation is free to choose non-colliding wording for that state; no criterion asserts what it must say, only that at most one row carries the version's own current-selection marking.

Two facts the specification did not state were decided during this planning, both into rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version: which of a case's versions a case-keyed surface reads its hypothesis pins from (the case's highest-numbered version), and what such a surface states for a hypothesis that version's manifest holds no entry for (it states explicitly that the case currently uses no revision of that hypothesis, never omitting it and never substituting another revision). Both are disclosed in the decision log.

UNDERDETERMINED, from the specification — no criterion of this task exercises the no-entry state rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version now states explicitly; criterion 3's "at most one row" is satisfied by zero rows marked, so an implementation may pass every criterion while showing nothing where the rule requires an explicit "no revision in use" statement.

UNDERDETERMINED, from the specification — no criterion states what the row marked current does when the pinned revision is absent from the page of revisions the table currently carries; rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown requires the pin to still be stated even then, and rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first's descending order makes an old pin falling off the first page the likely case as revisions accumulate.

UNDERDETERMINED, from the specification — no criterion states which revision a Revise action rendered on the marked row submits against; rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased lands every write on the hypothesis's own highest existing revision or its next one, never on a lower pinned revision, and rules/knowledge/a-released-hypothesis-revision-is-never-altered refuses an attempt on a revision a released version references.

REMAINDER, from the specification — rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest and rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis both govern disclosures on the presented manifest entry itself (whether the pin is the hypothesis's latest, and whether a higher revision exists) that no criterion of this task states, though this task creates exactly the situation they govern. This belongs to another task of this epic, over the presented manifest entry's own disclosure.

REMAINDER, from the specification — rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version is what makes "at most one row" hold at all; this task consumes that invariant rather than enforcing it. This belongs to the case-version composition act (place-hypothesis over a draft's manifest, contracts/knowledge/case-lifecycle), where the invariant is enforced at write time.
Decision, beyond the covers — stand: contracts/knowledge/case-lifecycle is named only to point at where place-hypothesis enforces the invariant this task consumes; this correction writes nothing against that contract and claiming it would grow the epic for a citation, not for work.

REMAINDER, from the specification — rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version governs every place a case-keyed surface states a hypothesis's currently-used revision; this task's criteria reach only the revision history table for one hypothesis. This belongs to another task of this epic, over the case detail screen's per-hypothesis current-revision display outside this table, if one exists.

REMAINDER, from the specification — rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first governs the answer order of a hypothesis-revisions listing; this task decides only which row is marked, never the order or paging of the listing itself. This belongs to the task delivering the list-hypothesis-revisions answer of contracts/knowledge/case-query.
Decision, beyond the covers — stand: contracts/knowledge/case-query is named only to point at where the hypothesis-revisions listing this table renders is answered; this correction changes no request and reads whatever the existing listing already returns, so claiming that contract would grow the epic for a citation, not for work.

ADVISORY, from the specification — criterion 4 defers when the Revise action is offered at all ("where the Revise action is rendered"), and no candidate states that condition; rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft only refuses a revise once requested against a case holding no draft, and rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move only states what a completed revise then offers. As written, criterion 4 would place Revise on the marked row even where the case's highest-numbered version is released and any revise attempted there is refused.

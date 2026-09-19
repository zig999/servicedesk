---
title: Isolate one case's invalid current version from the cases list
summary: A listing of every case still presents every other case's own summary, and the failing case's
  own entry, when one case's current version fails validation at that reading.
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope.md
objective: A listing of every case that includes a case whose current version fails a validator rule of
  validation-runs-at-every-read at that reading still presents every other case's own summary unaffected,
  and still presents an entry for the failing case itself carrying its slug and the explicit statement
  that its current version does not read back as a case, rather than the whole listing failing to load.
criteria:
- A listing of every case, read while one case's current version fails a validator rule of validation-runs-at-every-read
  at that reading, still presents every other case's own summary, exactly as it would be presented were
  every validator rule to hold for that one case's current version.
- That same listing still presents an entry for the case whose current version fails validation, carrying
  that case's own slug and the explicit statement that its current version does not read back as a case,
  and none of that case's summary (no current_state, version_count, last_updated, title, when_to_use,
  or released_version).
implements:
- rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
- domain/knowledge/case-summary
- domain/knowledge/case
---

## What it is
A listing of every case (frontend/app/src/hooks/use-cases-list.ts, frontend/app/src/routes/cases-list-screen.tsx) currently fetches every case's summary in one Promise.all, so one case's CaseVersionNotValidError rejects the whole query and the screen renders a generic "Cases could not be loaded." for every case, not only the one whose current version fails validation.
This task makes the listing answer an entry for every case regardless: the case whose current version fails validation gets an entry carrying its own slug and the specification's own explicit "does not read back as a case" statement instead of its summary, and every other case's entry is unaffected.

## Notes
This is a corrective increment: the survey and the decomposition did not run, per the plan-work skill's own route for one wrong behavior in already-delivered code. The task was written directly, not by a decomposer.
The epic was seeded mechanically from `trace.py --encodes frontend/app src/routes/cases-list-screen.tsx src/routes/version-manifest-screen.tsx src/hooks/use-manifest-builder.ts`, then closed per the situate step's method.
A first cut of this task's skeleton carried criteria assuming rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case and rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete extend to the version-manifest-screen and to the top-level cases listing; a binder pass returned a BLOCKING note showing both nodes are scoped to a surface presenting one case a reader named by slug alone (frontend/app/src/routes/case-detail-screen.tsx), which already implements them correctly (see case-detail-screen-current-version-validity.spec.ts) -- neither the manifest builder nor the cases list is that surface. The task was narrowed to the one confirmed gap: the cases list crashing entirely.
A second binder pass over the narrowed task returned an UNSTATED note: no node said what a listing of every case answers, or presents per case, when one case's current version fails validation. A siegard:unstated-fact-decider decided this fact, blind to this task's cut, adding rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone (see knowledge/decision-log.md for the disclosed reasoning) -- the specification now states that the listing still answers an entry for every case, the failing case's own entry carrying its slug and the explicit statement in place of its whole summary, every other entry unaffected.
A third binder pass over the reworded criteria (closing a gap where the first wording could be satisfied by silently dropping the failing case's row) returned implements cleanly, with these standing notes:
UNDERDETERMINED, from the specification -- criterion 2 withholds only the six summary fields from the failing case's entry, but the implemented node's expression withholds every other attribute of that version and any fact derived from one as well (version number, authored_at, subject, fallback, state, manifest); nothing in the criteria forbids rendering one of those beside the statement. Passes: an entry that omits the six summary fields but still shows, say, the failing version's own version number or subject beside the statement.
UNDERDETERMINED, from the specification -- both criteria are scoped to "one case" failing at a given reading, while the implemented node's expression is quantified per-case over every case in the listing; nothing here forbids a listing that isolates exactly one failing case correctly but falls back to a whole-listing failure once two or more cases fail at the same reading. Passes: an implementation that special-cases exactly one failing case and reverts to today's Promise.all-crashes-everything behavior for two or more.
ADVISORY, from the specification -- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case requires its three states be mutually distinguishable, but that requirement governs a slug-only single-case surface and is not imported here; the listing node imposes no three-way distinctness of its own beyond the explicit statement in place of the summary, so the executor should not carry that distinctness requirement into the listing.

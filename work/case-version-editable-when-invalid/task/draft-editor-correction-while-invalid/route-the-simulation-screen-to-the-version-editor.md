---
title: Route the simulation screen to the version's editor on every reading
summary: The version simulation screen carries a route to the same version's
  editing surface in its loading, load-error and ready readings, for a draft and
  for a released version.
rationale: The scope's investigation names only the editor screen, but the rule it
  names states the route for every surface presenting one named version.
  case-simulation-screen.tsx carries no route to the editor while loading or
  after a failed read. On a released version, its header routes to a new draft
  instead of that version's own editor. Cut apart from the manifest screen
  because each screen changes for its own reasons.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
objective: The simulation screen for a named version carries a route to that same
  version's editing surface on every reading, whatever that version's state.
criteria:
  - While the simulation screen's read has not answered, the screen carries a
    route to the named version's editing surface.
  - Where the simulation screen's read did not complete, the screen carries a
    route to the named version's editing surface.
  - Where the simulation screen's read was refused with CaseVersionNotValidError,
    the screen carries a route to the named version's editing surface.
  - On a reading that answered a draft version, the screen carries a route to
    the named version's editing surface.
  - On a reading that answered a released version, the screen carries a route
    to the named version's editing surface.
  - The route's version number is the version number in the simulation
    screen's own path.
implements:
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
---

## What it is

This is a route addition to case-simulation-screen.tsx and case-simulation-header.tsx, in each of the screen's phases.

## Notes

The released reading's existing route to a new draft is not asked to go. The rule requires the route to the version's own editing surface alongside it.
UNDERDETERMINED, from the specification — the criteria do not cover a read refused with some error code other than CaseVersionNotValidError; the route rule says its presence turns on nothing about the read's answer, which would close this. Passes despite: a screen that drops the route when the read is refused with any other error code, showing only the did-not-complete statement.
REMAINDER, from the specification — the route rule covers every version-keyed surface; this task answers it for the simulation screen only. Belongs to: the tasks that route the other version-keyed surfaces, such as the version's own surface and the manifest surface.
ADVISORY, from the specification — the route on a released reading leads to an editing surface no candidate describes for a released version (the editing-surface rule is written over a draft only, and a released version is never altered again); the route should not be read as promising a composable surface there.
ADVISORY, from the specification — neither decision-log.md nor projections/decisions-by-node.md has an entry locating the route rule; its manifest-route sibling does. The gap is only in the record of where the rule came from, not in the rule itself.
Decision, beyond the covers — stand: decision-log is cited only as background noting a gap in the specification's own provenance record for the route rule, not as a fact this task implements.

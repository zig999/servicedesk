---
title: Route the manifest screen to the version's editor on every reading
summary: The version manifest screen carries a route to the same version's editing
  surface in its loading, load-error, not-valid and ready readings.
rationale: The scope's investigation names only the editor screen, but the rule it
  names states the route for every surface presenting one named version.
  version-manifest-screen.tsx carries no route to the editor on any reading. This
  screen is cut as its own task because it changes for reasons of its own screen,
  apart from the simulation screen.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
objective: The manifest screen for a named version carries a route to that same
  version's editing surface on every reading.
criteria:
  - While the manifest screen's read has not answered, the screen carries a
    route to the named version's editing surface.
  - Where the manifest screen's read did not complete, the screen carries a
    route to the named version's editing surface.
  - Where the manifest screen's read was refused with CaseVersionNotValidError,
    the screen carries a route to the named version's editing surface.
  - On a reading that answered a draft version, the screen carries a route to
    the named version's editing surface.
  - On a reading that answered a released version, the screen carries a route
    to the named version's editing surface.
  - The route's version number is the version number in the manifest screen's
    own path.
implements:
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  - rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
---

## What it is

This is a route addition to version-manifest-screen.tsx, in each of its phases.

## Notes

REMAINDER, from the specification — the route rule covers every surface presenting one case version by slug and number; this task answers it for the manifest screen only. Belongs to: the tasks that route each other version-keyed surface to that version's editing surface, such as the version's own surface reached after create-draft.
ADVISORY, from the specification — no candidate names the version manifest screen specifically among the surfaces the route rule governs; the reading applied here (that the manifest screen is reached by slug together with version number, which is exactly the rule's condition) should be confirmed rather than assumed.
ADVISORY, from the specification — the criteria do not cover a reading refused with CaseNotFoundError (a slug and version no case version was ever written for); the rule's own quantification is over "a version v of c" and does not clearly reach a version never written, so the route's presence on that reading is left to whatever the screen already does.
ADVISORY, from the specification — a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading is a sibling rule, not implemented here, since on the manifest screen itself that route would point to the screen already being shown.

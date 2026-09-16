---
title: Wire case creation to a real screen and route
summary: Replaces the permanently-disabled "Create case" button on cases-list-screen.tsx
  with a working /cases/new route and screen, so a user can create a new case.
rationale: A wrong behavior found directly by the user running the system, in code
  this project already delivered.
sources:
- intake/scope.md
objective: 'A user of the cases list can create a new case: the "Create case" control
  is no longer permanently disabled, and following it reaches a screen that lets the
  user submit a new case and land on it once created.'
criteria:
- The cases list screen no longer renders a permanently disabled "Create case" control;
  the control is enabled and navigates to a case-creation screen.
- A /cases/new route exists in the frontend route tree and renders the case-creation
  screen.
- Submitting the case-creation screen with the information the case domain requires
  creates a new case and takes the user to that case, without the user needing an
  existing slug beforehand.
- The case-creation screen never offers its submitting act while the information the
  case domain requires is absent from its fields; it states, in the act's place, which
  required information is still absent, named against the field that would carry it,
  and no case is created.
implements:
- contracts/knowledge/case-query
- domain/knowledge/case
- domain/knowledge/case-version
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
- rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
- rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
- rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug

---
## What it is

Replaces the cases list screen's permanently-disabled "Create case" control with a working
`/cases/new` route and screen, so a curator can create a new case end to end — including where
the surface withholds the submission while required content is missing, and where a successful
creation lands.

## Notes

UNDERDETERMINED, from the specification — Criterion 1 asks only that the control stop being permanently disabled and that it navigate; it does not reach the conditionality clause of rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading, whose statement puts the route on every reading of the listing, its presence turning on nothing about the read backing the listing — including a read that has not yet answered, a read that failed, and a read that answered no case at all. The criterion needs to name those three readings for the rule's clause to be answered.
UNDERDETERMINED, from the specification — Criterion 3's "takes the user to that case" is case-keyed, where rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface fixes the destination as the surface addressed by the case's own slug together with the version number that creation assigned, the version number being the one the completed creation itself names rather than one the surface derived. The criterion also does not carry the rule's three refused destinations (the cases listing, the case's own versions listing, the authoring surface the submission was made from).
UNDERDETERMINED, from the specification — Criterion 4 bounds only the absent case of information the case domain requires, and says nothing about a field the domain declares optional. rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent states that consolidation_register, declared optional on domain/knowledge/case-version, never gates the act — a statement no criterion of this task carries.
REMAINDER, from the specification — Two clauses of rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug's statement reach no criterion of this task: that the creating act writes the case's first version numbered 1 and leaves next_version at 2, and that a create-draft naming a slug some case already holds creates no second case and originates that existing case's next draft instead. Both are what the act writes, not what this screen and route present; this task's criteria touch the rule only through the curator-supplied slug and the case coming into existence. It belongs to the create-draft write-side task — the backend act published by contracts/knowledge/case-lifecycle, which owns case numbering and the already-held-slug behavior.
ADVISORY, from the specification — Seam: criterion 3's landing requires the screen to read the created version's number from what the completed creation names, per rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface, but no candidate states the shape of create-draft's answer — contracts/knowledge/case-lifecycle publishes the operation without describing what it returns. The implementer depends on the delivered create-draft response carrying the assigned version number; if it does not, this task cannot land as the rule requires and the write side must change first.
ADVISORY, from the specification — Seam: what the landing destination itself presents and withholds is governed by rules outside this task's candidate set — rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record and rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives, which rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface names as already written over that moment. This task is bound only to arrive at that surface, not to build or correct it.
Decision, beyond the covers — stand: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record and rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives govern what the destination surface presents and withholds once the curator arrives, named above only as context for the advisory seam; this task implements neither — it is bound to reaching that surface, and whatever that surface already does with a record not yet arrived is a delivered task's own claim, not this correction's.

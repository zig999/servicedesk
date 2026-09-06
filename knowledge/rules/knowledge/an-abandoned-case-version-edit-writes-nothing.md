---
type: invariant
statement: >-
  A curator editing a case version may leave that editing before submitting it; the
  leaving writes no change to the version, leaves the version's own declared
  attributes and every entry of its manifest exactly as they were, and returns the
  curator to the surface the editing was reached from.
expression: >-
  For a draft case version v whose editing was reached from surface s and left before
  the edit is submitted: no update-draft, place-hypothesis or remove-hypothesis call
  carries that edit, so every declared attribute of v holds exactly the value it held
  when the editing opened and v's manifest holds exactly the entries it then held —
  the same positions and the same referenced revisions; v is neither discarded nor
  released and stands in draft as it stood; and the curator is returned to s. Leaving
  is available for as long as the edit has not been submitted, and turns on nothing
  else: not on how much of the edit was filled in, not on which of v's own attributes
  or manifest entries the edit touched, and not on which surface s is — a listing of
  the case's versions, the version's own manifest, the case's own detail and any
  other surface the editing is reachable from are alike here, and none of them holds
  a privilege among them.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

Editing a draft and submitting the edit are two moments, and everything this specification states about the change is stated about the second: `contracts/knowledge/case-lifecycle` publishes `update-draft` over a version's own declared attributes and `place-hypothesis` and `remove-hypothesis` over its manifest, and each of them writes only where it is called.
A curator who opens a version's editing and does not submit it calls none of them, and this states that the not-submitting is an offered act rather than an accident of navigation: a curator who opened the wrong version, or thought better of a title's wording or of a hypothesis's position, has a way out that costs nothing.

Writing nothing is the whole of what the leaving does to the version, and it is neither of the acts that do write.
It is not `discard` (`only-a-draft-case-version-may-be-discarded`), which removes a draft that already exists; the version left is standing when the curator comes back to it, in draft, exactly as they found it.
It is not a submission of unchanged content either: an `update-draft` carrying the values as they already stood is still a call, answered against the version's state by `a-case-version-moves-through-its-declared-lifecycle` rather than against how much of the content it changed.
Leaving is the absence of that call, so every declared attribute keeps the value it held and every manifest entry keeps its position and its referenced revision — `a-presented-case-version-states-its-own-declared-attributes` and `a-manifest-entrys-pinned-revision-is-always-shown` answer afterwards exactly what they answered before, `a-cases-current-pins-come-from-its-highest-numbered-version` reads the same pins it read before, and `a-surface-offering-release-states-which-release-conditions-the-draft-meets` decides its conditions over content this leaving did not touch.
A curator may leave and open the editing again as often as curation needs, and the version is what it was.

Where the curator is returned is the surface the editing was reached from, and this specification has answered that same question three times already in that same direction: `an-abandoned-revision-composition-writes-nothing` returns the curator to the screen the composition was opened from, and `an-abandoned-capability-registration-entry-registers-nothing` and `a-connector-configuration-authoring-may-be-abandoned-without-registering` each return the operator to the surface the authoring was reached from.
A fixed destination — the case's own detail surface, say — would answer one gesture two ways inside one specification, and it would be wrong on exactly the readings that matter: a curator who reached the editing from a listing of the case's versions, from that version's own manifest, or from anywhere other than the case's detail, is moved somewhere they never came from and loses the place they were curating in.
Nothing is lost by landing the leaving where the curator came from, because the routes this specification owes between a case's own readings are owed regardless — `a-listed-case-version-offers-a-route-to-its-own-manifest` carries a curator from a listing of a case's versions to any presented version's manifest on every reading of that listing — so the curator who did want another of the case's surfaces takes the route already owed them.
Getting out costs no more than getting in did, and the step the leaving undoes is the one that opened the editing.

Which control carries the leaving, its wording and where it sits are form and belong to the interface, not here.

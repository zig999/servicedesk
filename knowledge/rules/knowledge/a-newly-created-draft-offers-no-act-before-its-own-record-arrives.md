---
type: invariant
statement: >-
  A surface presenting a newly created draft case version offers the curator none of
  the acts over that version — its release, its discard, and the correction of its own
  declared attributes — while no answer for that version's own record has arrived; the
  withholding lasts exactly that interval and turns on nothing else.
expression: >-
  For a case version v created through create-draft and a surface presenting v to the
  curator: while no answer for v from the knowledge context's own record of v has
  arrived, that surface offers the curator no act whose performance issues a release of
  v, no act whose performance issues a discard of v, and no act whose performance
  issues an update-draft over v's own declared attributes — the three acts
  contracts/knowledge/case-lifecycle publishes over a draft the curator is holding. The
  withholding turns on nothing further: not on which attribute values the creating
  request carried, not on which existing version the draft's manifest was copied from,
  and not on the surface the creation was reached from. Once an answer for v has
  arrived this withholds nothing, and which of the three that surface then offers is
  decided where this specification already decides it. Nothing here withholds the
  leaving an-abandoned-case-version-edit-writes-nothing states, or any route this
  specification owes from a case's surfaces: each is offered in this interval exactly
  as it is outside it.
constrains:
  - domain/knowledge/case-version
---

## Description

`a-draft-versions-content-is-presented-only-from-its-own-record` already fixes what this
surface states in this interval: no attribute of the created version at all, and that the
version is still being read. It decides that much and says so — the source of the content
a surface states, and what is said while none has arrived — and stops there. What the
surface *offers* in the same interval was addressable nowhere, so whether a curator could
release, discard or correct a draft they had not yet been shown fell to whatever a surface
happened to render.

Each of the three acts `contracts/knowledge/case-lifecycle` publishes over a draft is
performed against content this surface has, in this interval, been forbidden to show. The
correction is the plainest: `a-presented-case-version-states-its-own-declared-attributes`
reads update-draft and the version's own attributes together and says why they belong
together — a correction made against values the curator cannot see is made blind, and
overwrites what nobody read. In this interval the curator can see none of them, by the
sibling rule's own decision, so a correction offered here is exactly that blind overwrite,
with nothing on the surface for it to be a correction of.

Release and discard are the two acts that end the draft, and neither is taken back.
`a-case-version-moves-through-its-declared-lifecycle` makes released terminal, and
`only-a-draft-case-version-may-be-discarded` keeps a released version from ever being
removed; a discard removes the version and its own manifest entries, and
`a-case-version-number-is-never-reused` keeps the number gone with it. What would be
ended is content the curator neither composed nor has read:
`a-new-drafts-manifest-is-copied-from-an-existing-version` makes the new draft's starting
manifest the case's own existing version's, entry for entry, rather than anything the
creating request carried. And the one disclosure a release-offering surface owes stands
empty here — `a-surface-offering-release-states-which-release-conditions-the-draft-meets`
reserves "not yet decided" for a condition whose inputs the surface has not read, and in
this interval every condition it names stands there, so the offer available in this window
is one whose whole disclosure is that nothing about it has been established.

This specification has answered the same question — what a surface offers while a read it
stands on has not answered — twice already in the integration context, and both times
toward withholding.
`a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` offers its act on
no surface whose read has not answered and on none whose read failed, those surfaces
holding no read registration for the act to work over;
`a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` stands its one
control in the failed window and in neither of the other two. The reading transfers without
alteration: an act over a record is offered where the record is in hand, and this
specification has already decided, for this very surface and this very interval, that the
record is not in hand. Deciding it the other way here would answer one question two ways.

Nothing is closed off by the wait. The interval is bounded by an answer the surface is
already waiting on; the curator holds the leaving
`an-abandoned-case-version-edit-writes-nothing` states, which turns on nothing further and
writes nothing to the version; and any route this specification owes from a case's surfaces
is owed here as it is anywhere. Nor does this reach the calls themselves: no lifecycle
operation is refused by this rule, and one that does arrive is answered by
`a-case-version-moves-through-its-declared-lifecycle` exactly as it was before. It adds no
attribute to `domain/knowledge/case-version`, publishes no operation and marks nothing on
the stored version.

Which control carries each act, whether an interface renders an act it does not yet offer
as absent or as present and not yet performable, its wording and where it sits are form and
belong to the interface, as this specification's other surface rules leave them.

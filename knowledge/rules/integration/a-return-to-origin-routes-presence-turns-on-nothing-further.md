---
type: policy
statement: >-
  The act a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading states is
  offered on every reading of the surface — one whose read has not answered, one whose read
  failed, one whose read answered that nothing is registered at that name and version or under
  that connector name, and one presenting the registration that read answered — and its presence
  turns on nothing further: not on the state of that read, not on whether the operator has
  changed anything on the surface, and not on which surface they reached it from.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

The act is owed on every reading, and this specification has already read the same interval the same way. `a-newly-created-draft-offers-no-act-before-its-own-record-arrives` withholds the release, the discard and the correction of a draft case version while no answer for that version's own record has arrived, and its own decision closes by stating that the withholding touches neither the leaving `an-abandoned-case-version-edit-writes-nothing` states nor any route the specification owes: what is withheld while a read has not settled is the act that writes, and the leaving that writes nothing stays available, nothing being lost by waiting precisely because the operator may still go. That division is the whole of this. The two route rules over these very surfaces reason the same way about the same readings, in the other direction: `a-connector-configuration-surface-offers-a-route-to-the-listing` holds its route unconditional because a route present on only some readings is one the operator cannot rely on, and because the readings a condition would drop it from — a read still outstanding, a read refused — are exactly the readings the operator has least reason to stay on, and `a-single-capability-surface-offers-a-route-to-the-capabilities-listing` carries the same turns-on-nothing-further clause. An operator on a surface stating that a capability could not be read has nothing there to act on but the reattempt, and confining their way back to the reading that shows them a registration leaves them stranded on exactly the three readings that show them none.

Nothing about a read that has not answered makes this act unsafe, which is why the one restriction the specification already places on these readings does not transfer. `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` is offered on no surface whose read has not answered and on none whose read failed, and the reason it gives is its own: that act restores the fields to the content of a registration the surface read, and a surface that read nothing holds no content to restore, so performing it there would be indistinguishable from the operator clearing the fields. This act restores nothing and needs no content. It carries the operator away from the surface rather than leaving them on it, so the further explicit act that rule requires is not owed here either, on that rule's own distinction: an act that ends the operator's engagement and shows itself by landing them somewhere they were not cannot be built upon unnoticed, while a discard that leaves them in place can.

The reading in which the read answered that nothing is registered at that identity or under that name is included for the same reason and one more. That answer is the registry's own — `constraints/the-capability-identity-read-refuses-an-unregistered-identity` has `read-capability-by-identity` refuse such a name and version, and `a-connector-configuration-read-by-an-unregistered-name-is-refused` states the sibling refusal — and it is the one reading on which the surface's own address will never answer anything, so an operator left there without a way back is left at an address they cannot make useful. `an-abandoned-capability-registration-entry-registers-nothing` already refuses a destination keyed on an identity nothing is registered at for exactly that hazard, and reasons that the surface the operator was reached from carries no such hazard, having answered once already: the same reasoning that rules out landing there rules in leaving there.

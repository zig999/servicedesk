---
type: invariant
statement: >-
  Where a surface addressed by a capability's own name and version has submitted a
  registration the capability registry answered as registered, no field of that surface the
  operator had changed away from the content the surface's prior read of that identity
  answered is changed by that answer or by the surface's subsequent
  read-capability-by-identity of the registered capability being outstanding, each such
  field holding, until that read answers, the content the operator submitted in it and none
  of them being returned to the content that prior read answered, emptied, or set from any
  other answer.
expression: >-
  For a name n and a version v, a surface s addressed by (n, v) presenting the capability
  that read-capability-by-identity of contracts/integration/capability-registry answered at
  that identity, and a registration r the operator submitted from s through
  register-capability which the registry answered as registered: from the moment that
  answer reaches s until the moment a subsequent read-capability-by-identity of (n, v)
  issued from s answers, every field of s the operator had changed away from the content
  that prior read answered holds exactly what r carried for it. Neither the registry's
  answer to the write nor that subsequent read standing outstanding sets any such field: no
  one of them is set to the content that prior read answered, no one of them stands empty,
  and no one of them holds content drawn from any other answer — not a page of
  list-capabilities, not the answer of read-capability for the concept this capability
  answers, and not the answer of any read of another identity. A further change the
  operator themselves makes to such a field in this interval is theirs and is no departure
  from this. Nothing here turns on which of s's fields the edit touched, on how much of it
  was made, on whether what r carried differs from what that prior read answered, or on how
  the operator reached s. Nothing is stated of the moment that subsequent read answers or
  of anything after it, of a surface whose submission the registry refused or has not
  answered, of a surface that issues no such read at all, or of a field the operator never
  changed.
constrains:
  - domain/integration/capability
---

## Description

`a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read` has such a surface state that the registration was made at the registry's own answer to the write, and closes by recording that whether the surface issues a further identity read at all, what it presents while one is outstanding, and what becomes of an edit it holds are stated by no node and are not stated there.
`a-presented-capability-states-its-declared-attributes-as-the-read-answered-them` fixes every declared attribute of the presented identity to that read's own answer, and stands aside in terms from the fields at issue here: it states what the presentation carries before and apart from any edit, an edit the operator makes to a field being theirs and no statement of that reading.
So for the fields the operator changed and then submitted, what stands in them between the registry answering the write and the surface's own further read of that identity answering fell to whatever a surface happened to render, including going back, under the operator, to what the earlier read had answered.

Returning those fields to the content the prior read answered is `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`'s act performed without the act.
That rule states an act whose whole effect is to set every field of the surface to the content of the registration the surface last read, and it takes effect only where the operator states in a further, explicit act that it is to be performed, on the reasoning that a discard leaves the operator on the same surface and continuing, so a mis-triggered one is built upon — the next edit is made over content that silently reverted, and may be submitted over a write both registries make total.
A surface that sets those fields back on its own in this interval produces that act's whole effect on no act of the operator's at all, and the hazard that rule names is live in it.

The content that prior read answered is also, by this point, content the registry no longer holds.
`register-capability` replaces whatever stood at the identity with the whole declared contract submitted, and the registry has answered that the submission registered, so a surface putting the earlier answer back into the operator's fields shows them as their own working content a registration that has been replaced, in the same moment the surface states to them that the registration was made.
One surface stating two things that read against each other is the presentation this specification refuses wherever it meets it, and `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` holds the three readings of this very surface apart for that reason.

Nothing is filled into the fields from the submission, either.
`a-presented-capability-states-its-declared-attributes-as-the-read-answered-them` refuses the content a `register-capability` submission carried as a source for an attribute it presents, and this draws on it for nothing: what the submission carried for these fields is what the fields already held, and what is stated here is that the answer to that submission sets them to nothing at all.

Nothing else about the interval moves.
The outcome statement and its timing stay `a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read`'s and `a-submitted-registration-states-its-outcome-to-the-operator`'s; which of the three readings such a surface stands in while a further identity read is outstanding, whether it issues one at all, and what its fields hold once that read answers, fails or is refused are stated by no node and are not stated here; the discard act and what it returns the fields to stay `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`'s and `a-surface-holding-no-read-registration-offers-no-discard`'s; the two unsettled windows and the reattempt stay `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed`'s.
No call is refused, no attribute is added to `domain/integration/capability`, and no operation is published.
Which control carries each field, its label, its order and its placement are form and belong to the interface, exactly as this specification's other surface rules leave them.

Home is a new rule rather than `a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read`, whose one condition is what the surface tells the operator about the write and whose Description records this as a fact it does not reach, and rather than `a-presented-capability-states-its-declared-attributes-as-the-read-answered-them`, which states what the presentation carries apart from any edit and would be given a second condition about fields it deliberately leaves alone.
An invariant over `domain/integration/capability`, holding immediately inside that one aggregate: what is stated is that content already standing on the surface is not changed, which settles at the surface and waits on no separately issued call, unlike the neighbouring rules over this surface that state what a read's answer is presented as and take eventual consistency for exactly that reason.

---
type: policy
statement: >-
  A curator reading one of a case's versions is shown that version's own declared
  attributes — its title, its when-to-use, its subject, its fallback's outcome and
  referral, and its consolidation register — each read from that version itself and never
  from another version of the case, for a version in either state, draft or released;
  where that version declares no consolidation register, the reading states explicitly
  that this version declares none, never leaving a blank in place of the statement and
  never presenting as the version's own the register another version declares or the
  consolidation step's own adapter would default to.
expression: >-
  For a case c, a version v of c, and a reading of v presented to a curator: the reading
  states v's title, v's when_to_use, v's subject, v's fallback's outcome and v's
  fallback's referral — its action and its recipient — and v's consolidation_register,
  each read from v itself; no other version of c, and no consolidation adapter's own
  default, ever supplies any of them. The statement turns on nothing further — not on v's
  own state, whichever of draft or released it holds. Where v declares no
  consolidation_register, the reading states that v declares no consolidation register; it
  states no register value for v and leaves nothing unsaid in its place.
constrains:
  - domain/knowledge/case-version
consistency: immediate
---

## Description

A case version's own declared attributes are the whole of what it says about itself apart from its manifest: the title and when-to-use a curator chooses it by, the subject type it accepts, the fallback that answers when no hypothesis confirms, and the register the consolidation step writes in.
Every node that says what a curator is shown about a case version was written over something else — `a-manifest-entrys-pinned-revision-is-always-shown`, `a-presented-manifest-entry-states-its-pinned-revisions-state`, `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` and `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` each state what one manifest entry carries, `a-cases-current-pins-come-from-its-highest-numbered-version` states what a case-keyed surface says about the case's hypotheses, and `a-listed-case-version-offers-a-route-to-its-own-manifest` carries a version's presentation no further than that route.
The version's own attributes were addressable nowhere, so what a reader learns of them fell to whatever a surface happened to render.

They are not recoverable from anywhere else. `a-case-summary-is-derived-from-its-existing-versions` carries a case's title and when_to_use only for its highest released version, never its subject, its fallback or its register, and never a draft's — so the catalog answers about the case, not about the version being read.
Taking one of them from another version is exactly the substitution `a-manifest-entrys-pinned-revision-is-always-shown` and `a-cases-current-pins-come-from-its-highest-numbered-version` each already refused for a pin: a draft's title shown from the last release, or a released version's fallback shown from the draft that follows it, states as this version's precisely what this version does not say.

The reading costs no new read. `a-case-is-read-whole` already assembles a case version's own attributes together with its manifest in one transaction, and `contracts/knowledge/case-query`'s read-case answers exactly that, so wherever a version is read at all these facts are already in hand.

Both states are covered because both readers need them. `contracts/system/case-authoring` promises the curator composes a draft's own declared attributes as freely as its manifest and `contracts/knowledge/case-lifecycle`'s update-draft is that correction — a correction made against values the curator cannot see is made blind, and overwrites what nobody read.
On a released version, `a-case-version-is-written-once` makes those attributes the record of the procedure that ran and `every-case-version-remains-readable` keeps them for exactly the audit that needs them: the subject `a-subject-mismatch-refuses-the-case` refuses on and the fallback `no-confirmation-falls-back` answers from are facts only that version carries.
`a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds that a version's state answers whether it may still be composed and whether it may be diagnosed against, never how much of what is true about it a reader is shown, and this takes the same answer.

The absent register is stated rather than left blank. The consolidation register is the one of these attributes `case-version` declares optional, and a version declaring none reads exactly like one whose register nobody showed — the emptiness `a-case-holding-no-versions-is-told-explicitly` and `a-cases-current-pins-come-from-its-highest-numbered-version` both already refuse, because a reader cannot tell it from a silence.
Putting the adapter's default there instead would be worse than a blank: `case-version` states that an absent register leaves the consolidation step with whatever its own adapter defaults to, which is a fact of that step and not a value this version declares, and a released version shown declaring a register it never declared misstates the record.

Nothing here is refused or moved: no call is refused, no attribute gains a value, no version's state changes for it, and what may be done with what is read stays where `a-case-version-is-written-once` and update-draft already put it — corrected while draft state holds, read only once released.
`validation-runs-at-every-read` still decides whether a stored version reads back as a case at all; this says what a reading states, never that a version failing that validation is presented anyway.

Which surface carries the reading, which control holds each attribute, where it sits and its wording are form and belong to the interface, not here.
Consistency is immediate because every attribute this states is the case version's own, read from the one aggregate root the reading already assembles whole, so no fact here spans two reads.

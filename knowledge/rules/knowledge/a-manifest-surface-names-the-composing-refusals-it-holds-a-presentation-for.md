---
type: invariant
statement: >-
  A surface presenting a case version's manifest holds a presentation of its own for
  exactly two refusals of the acts that compose that manifest — a place-hypothesis
  refused as ManifestPositionOccupiedError, which it states to the curator as this
  version's manifest already placing a different hypothesis at the position that
  placement named, and a remove-hypothesis refused as
  ManifestWouldHoldNoHypothesisError, which it states as this version's manifest having
  to declare at least one hypothesis and the entry therefore still standing — each of
  the two told apart from the other, each stating that the manifest stands exactly as it
  stood before the act, and every other refusal either act carries presented instead as
  the notice that surface shows for a request that failed for a reason it does not
  recognise, disclosing nothing further about it.
expression: >-
  For a case version v and a surface presenting v's manifest to a curator: where a
  place-hypothesis that surface issued over v is refused carrying
  ManifestPositionOccupiedError, the surface states that v's manifest already places a
  different hypothesis at the position that placement named and that v's manifest stands
  unchanged; where a remove-hypothesis that surface issued over v is refused carrying
  ManifestWouldHoldNoHypothesisError, the surface states that v's manifest declares at
  least one entry and that the entry the removal named is still held; those two
  statements are distinguishable from one another and from the statement the surface
  makes for a place-hypothesis or remove-hypothesis refused with any other error code,
  which is that the request failed for a reason the surface does not recognise and
  nothing else — not the error code, not the refusal's message, not any value it
  carries.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

The composing acts a manifest surface exists to offer are refused by name, and a name this specification has already stated a condition for is a name the curator can act on. `a-hypothesis-position-is-unique-within-its-case` refuses a placement at a position a different hypothesis already holds, and the act that clears it — choosing another position, or moving the entry holding this one — is available on the very surface the refusal arrives at. `a-case-has-at-least-one-hypothesis` refuses a removal that would empty the manifest, and the act that clears it is placing a second hypothesis first. Neither refusal reports a breakage: in both, the manifest stands exactly as the curator left it and the version is no worse off than before the act.

`a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete` draws this same line for the reads a case-keyed surface makes, reserving the undifferentiated telling for a code that surface holds no reading of. It is written over reads, and a refused write is not a read that did not complete: the curator issued an act, and what the manifest on screen now holds is the question. So the notice owed for the residue is the one `scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so` already names in its own text — what the frontend shows when a request fails for a reason it does not recognise. That scenario's own reasoning is why the two named refusals may not fall there: a curator shown the unrecognised-failure notice learns the outcome is unknown and retries, reloads or escalates, while a curator told the position is taken, or that the manifest's floor was reached, learns which next act clears the condition.

That the manifest stands unchanged belongs to each named telling because the surface is displaying the very thing the act was aimed at. Without it, a refusal read beside a manifest the surface has not re-read leaves the curator unable to tell a write that was refused from one whose effect has not yet appeared — the indistinguishability `a-release-refusal-with-no-named-violation-says-so` refuses for a curator left to interpret a refusal on their own.

The rule adds no attribute, moves no pin and refuses no call; which control carries each statement, how it is worded and where it sits are form and belong to the interface, as they do everywhere else this specification states what a surface tells a reader. It decides nothing about `remove-hypothesis-for-an-absent-name-succeeds-with-no-effect`, which is no refusal at all and so has no refusal presentation to hold, and nothing about what `place-hypothesis` answers for a hypothesis the manifest already holds, which `a-hypothesis-is-manifested-at-most-once-in-a-case-version` expressly leaves open.

---
type: invariant
statement: >-
  An attempt to remove one of a-released-hypothesis-revision-is-never-altered's collects, where
  the revision's own case still holds at least one case-version, is not refused with an error; it
  is accepted and left with no effect, so every collect the revision held before the attempt
  still reads back unchanged after it — except where a-case-holding-no-version-may-be-deleted's
  own delete is the attempt, which removes the collect along with everything else that rule names
  once the case holds no case-version at all.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A revision's own content is what its own release promises to keep answering forever, and what every case version's manifest that comes to reference it then relies on in turn — a collect included, so a removal attempted against one leaves every collect the revision held unchanged, exactly as `a-released-hypothesis-revision-is-never-altered` leaves the criterion, the resolution and the state.

That promise is to a case a version's manifest can still name, and it ends where the naming does: `a-case-holding-no-version-may-be-deleted`'s own Description already draws this line for the revision as a whole ("nothing reads a released revision except through a manifest entry, and a case with no version has none"), and a collect is read through the same manifest entry the revision itself is. Once the case holds no case-version, this rule's own no-effect answer no longer applies to the one act that rule names — the case's own delete — because that act is deciding a different, later question: not whether a revision the case can still serve keeps its content, but whether an identity nothing can serve any more is worth keeping at all.

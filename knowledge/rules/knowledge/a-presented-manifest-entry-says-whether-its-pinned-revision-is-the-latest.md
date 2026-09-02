---
type: policy
statement: A presented manifest entry states whether the hypothesis-revision it pins is that hypothesis's highest existing revision, and where a higher revision exists it states that a higher revision exists — both readable on the entry as presented, without the reader opening that entry's revision selector.
expression: For a presented manifest entry e, latest(e) = the highest revision number the hypothesis e's revision belongs to currently holds; the presentation of e states whether e.revision == latest(e), and where e.revision < latest(e) it states that a higher revision exists, with neither statement conditional on e's revision selector being opened.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A manifest entry pins one revision deliberately, and nothing moves that pin on its own: a released version's entry keeps the revision it adopted however many later revisions of that same hypothesis exist, which is what lets slug and version name one content without a digest over it.
The consequence is that a pin standing behind the hypothesis's highest existing revision is never an error and never announces itself — the entry reads exactly as it would if its revision were the only one — so a reader comparing the two has no way to tell them apart from the entry alone.
This rule is what closes that: the entry itself carries the comparison, so being behind is something the reader learns rather than something the reader has to go looking for.

Both statements are the entry's own, not a selector's: a reader who never opens the revision selector still learns whether the pin is the hypothesis's highest existing revision and, where it is not, that a higher one exists.
Consistency is eventual because the comparison spans two aggregates — the manifest entry inside its case version, and the hypothesis whose revisions are counted — and a hypothesis gaining a revision does not reach into any version's manifest to change it.

The rule states what a presented entry says, and nothing about what may then be done: whether the pin may be moved at all, and to which revisions, stays case-version's own — its manifest is freely composed while draft state holds and never altered once released.
Which control carries the statement, and its wording, are form and belong to the interface, not here.

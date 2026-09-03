---
type: invariant
statement: A curator who revises a hypothesis is told the revision number the content was
  saved as — the number of the revision that revise wrote — whether the revise replaced the
  hypothesis's highest existing revision in place or created the hypothesis's next revision;
  that number is the whole of what the answer says about which revision was written, and the
  answer carries no further field distinguishing a revise that replaced the highest existing
  revision in place from one that created the next revision.
expression: For a revise of hypothesis h that wrote revision r of h, the answer to that
  revise states r.revision, and holds no field whose value differs between a revise that
  replaced h's own highest existing revision in place and a revise that created h's next
  revision.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

`a-hypothesis-revision-is-overwritten-while-unreleased` lands a revise on one of two revisions — the hypothesis's own highest existing one, replaced in place with its number unchanged, or the next number — and which of the two it was turns on whether any case version in released state references that highest revision.
That fact belongs to an aggregate the curator is not reading at the moment of the save, so the number the content now lives at is not derivable from what the curator supplied: the same edit, typed twice against the same hypothesis, can land on 2 and then on 3 with nothing the curator did differently.
A curator answered with nothing therefore cannot tell whether the number a draft's manifest entry already pins still names the content just written.

Stating the number is the smallest answer that closes that, and it is the same silence this specification has refused before: `a-manifest-entrys-pinned-revision-is-always-shown` refuses to let the revision a version actually uses vanish from the curator's view, and `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained emptiness over a stored set because absence and a failed read then read alike.
It is told in both branches because the branch is exactly what the curator cannot see — an answer given in only one of them would leave silent the case the curator most needs it for.

The number is also the whole of that answer: no further field names which of the two branches the revise took, because nothing decided on this answer needs the branch.
`a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` turns on a comparison of numbers — the revision written against the revision the draft's entry pinned immediately before — and that comparison does not follow the branch: an in-place overwrite of a highest revision the draft's entry does not pin stands above that pin exactly as a created next revision does, so a field naming the branch would answer a differently drawn question and set a second, disagreeing basis beside the comparison that rule states.
Nor is the branch the revision's own fact: it is read from whether a released case version references the highest revision, the cross-aggregate reading `a-hypothesis-revision-is-overwritten-while-unreleased` already makes to choose where the write lands, and carrying its outcome out in the answer would put that reading in a second place for no decision resting on it.

Both facts this rests on are the revision's own — the number it is identified by and the hypothesis it references — so this constrains that one aggregate and holds immediately, the reading `a-hypothesis-revisions-listing-answers-highest-revision-first` already took for what a read of these revisions answers.
The rule states that the number reaches the curator and nothing about form: which control carries it, its wording, and what a surface then does with it belong to the interface.
It states nothing about which revisions a pin may be moved to, which stays case-version's own.

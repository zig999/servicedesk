---
type: policy
statement: Revising a hypothesis that already holds a revision writes into that hypothesis's own
  highest existing revision, replacing its content in place and leaving its number unchanged,
  unless that revision is referenced by any case version in released state, in which case revising
  instead creates the hypothesis's next revision; a hypothesis holding no revision yet always
  creates revision 1.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A curator adjusting a criterion's wording before ever publishing it does not want a new number for every keystroke's worth of saving — the "draft" a revision passes through is not a state it declares, it is derived from whether a released version has adopted it yet, the same way a case version's own draft state already governs whether its manifest may still be composed.
`a-released-hypothesis-revision-is-never-altered` is what makes this safe: it already refuses to let this rule's own overwrite reach a revision any released version has adopted, so the two rules decide between them exactly once, over the same fact — whether a released case version references the hypothesis's highest revision — and never disagree, because this rule's "unless" clause is that rule's own condition read the other way.
This is a policy rather than an invariant because the fact it turns on belongs to a different aggregate than the one it writes to: whether the highest revision is frozen is answered by reading every case version that might reference it, not by anything the hypothesis or the revision itself declares.

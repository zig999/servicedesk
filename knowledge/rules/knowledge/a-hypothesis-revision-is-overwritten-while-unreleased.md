---
type: policy
statement: Revising a hypothesis that already holds a revision writes into that hypothesis's own
  highest existing revision, replacing its content in place and leaving its number unchanged,
  unless that revision is itself in released state, in which case revising instead creates the
  hypothesis's next revision; a hypothesis holding no revision yet always creates revision 1.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A curator adjusting a criterion's wording before ever publishing it does not want a new number for every keystroke's worth of saving — draft and released are the revision's own declared state, moved once by its own release, independently of any case version that may come to reference it.
`a-released-hypothesis-revision-is-never-altered` is what makes this safe: it already refuses to let this rule's own overwrite reach a revision whose own state is released, so the two rules read the same field and never disagree.
This is a policy rather than an invariant because deciding which of the hypothesis's revisions is its highest existing one still reads across every revision that references the hypothesis — a fact no single hypothesis-revision instance carries alone, and hypothesis and hypothesis-revision are separate aggregate roots.

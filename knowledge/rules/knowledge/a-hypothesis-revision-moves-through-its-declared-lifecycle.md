---
type: state-machine
statement: A hypothesis-revision moves only along its declared lifecycle; release asked of a
  revision not in draft state is refused with an HTTP 409 response reporting a
  HypothesisRevisionNotDraftAtReleaseError.
subject: domain/knowledge/hypothesis-revision
status: domain/knowledge/hypothesis-revision-state
initial: draft
terminal:
  - released
transitions:
  - from: draft
    trigger: release
    to: released
---

## Description

Draft is where a revision's own content may still be edited in place; release is the one trigger that ever leaves it, taken by a curator directly against this revision — never derived from, and never blocked or granted by, any case version's own manifest or its own release. Released is terminal: a further edit always creates the hypothesis's next revision instead of altering this one (`rules/knowledge/a-released-hypothesis-revision-is-never-altered`).
This is the same shape `a-case-version-moves-through-its-declared-lifecycle` already gives a case version — one forward transition, one terminal state — read here over the hypothesis-revision's own aggregate instead.

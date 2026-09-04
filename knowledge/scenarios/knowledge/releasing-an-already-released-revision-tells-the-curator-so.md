---
subject: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
given:
  - hypothesis customer-equipment-fault holds one revision, revision 1, itself in released
    state
when:
  - the curator asks to release revision 1
then:
  - the release is refused with an HTTP 409 response reporting a
    HypothesisRevisionNotDraftAtReleaseError
  - revision 1 stays released
  - the frontend tells the curator specifically that revision 1 is already released and so
    cannot be released again, never only the notice it shows when a request fails for a
    reason it does not recognise — the exact wording stays the frontend's own
involves:
  - domain/knowledge/hypothesis-revision
---

## Description

Release is the one trigger the lifecycle holds and released is terminal, so a second release asked of the same revision is refused rather than repeated — and the refusal's own condition is entirely undramatic: nothing is broken, nothing was lost, and the revision already stands in exactly the state the curator was asking for.
That is the whole reason the telling has to be distinguishable. A curator shown the frontend's notice for a failure whose reason it does not recognise learns that the request's outcome is unknown, and acts accordingly — retrying, reloading, escalating. A curator told the revision is already released learns the opposite, that there is nothing left to do, and the two readings are not interchangeable.
What the specification holds is that substance: the condition named, and named apart from the unrecognised-failure notice. Which control carries it, where it sits and how it is worded are form and belong to the frontend, not here — the same reading `constraints/no-route-enforces-authentication` already takes over its own disclosure.

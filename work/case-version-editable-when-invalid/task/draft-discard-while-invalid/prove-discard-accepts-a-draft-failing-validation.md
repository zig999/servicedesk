---
title: Prove discard accepts a draft failing validation
summary: Tests showing a discard of a draft is accepted while its manifest holds no
  entry or its declared subject fails glossary coherence.
rationale: The inventory found discard reading the store's assembled version and
  checking draft state alone, so no source change is planned; the task is cut to show
  the acceptance rule 3 states, over the failing conditions its scenario names, and
  any failure it hits is corrected within this task.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
objective: A discard of a draft case version is accepted whatever validator rule of
  validation-runs-at-every-read fails over it.
criteria:
  - A discard of a draft whose manifest holds no entry is answered HTTP 204.
  - After that discard, the store answers no case version at that draft's slug and
    number.
  - After that discard, a draft next created for the same case is not numbered with
    the discarded draft's number.
  - A discard of a draft whose stored subject names a subject type the glossary does
    not hold is answered HTTP 204.
implements:
  - rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  - constraints/a-successful-case-version-discard-answers-with-no-content
---

## What it is

This task holds rule 3's acceptance half, and its scenario, by proof against the discard route as it stands.

## Notes

A discard over a released version is still refused by only-a-draft-case-version-may-be-discarded's existing CaseVersionNotDraftError, and nothing here changes that.
UNDERDETERMINED, from the specification — constraints/a-successful-case-version-discard-answers-with-no-content's fitness requires the answer to carry no body, and the two 204 criteria assert only the status. Passes despite: a discard route that answers 204 but writes a response payload, such as the removed version's slug and number.
REMAINDER, from the specification — the candidate rule's clauses about the offer made on a surface presenting the draft, and the curator reproducing the case's own slug, reach no criterion here; this task covers only the acceptance side, through the API and the store. Belongs to: the task that implements the curator-facing surface presenting a draft case version, showing the discard control offered and taking the curator's reproduced slug; the draft-only refusal belongs with the tests of only-a-draft-case-version-may-be-discarded.
ADVISORY, from the specification — that a subject type the glossary does not hold is a failing validator rule of validation-runs-at-every-read is stated by nodes outside the epic's covers (rules/knowledge/validation-runs-at-every-read and rules/knowledge/case-terms-exist-in-the-glossary); the outcome still rests on the candidate rule's generic "any other validator rule failing over v", so this does not block, but the caller may want to grow the claim if the fixture's validity failure should be a stated fact.
Decision, beyond the covers — stand: rules/knowledge/validation-runs-at-every-read is cited only as background for why an unglossaried subject type counts as a failing validator rule, not as a fact this task implements; the candidate rule already covers the outcome generically.
Decision, beyond the covers — stand: rules/knowledge/case-terms-exist-in-the-glossary is cited only as background for the same reason; the fixture's validity failure is proved by observation, not by this task implementing the glossary-membership rule itself.
ADVISORY, from the specification — the objective's "whatever validator rule" is demonstrated here by two representative failures, a structural one and a coherence one, rather than by every named rule; the caller should decide whether two cases are enough.

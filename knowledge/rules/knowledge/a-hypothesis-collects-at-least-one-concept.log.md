---
entries:
- field: statement
  unstated: What HTTP status and error identity a hypothesis-revision request is refused with when it collects no concept at all.
  decided: HTTP 422 reporting a HypothesisRevisionCollectsNoConceptError.
  why: This specification's own decision log already settled the idiom for exactly this shape of refusal — a well-formed request whose content would violate a business invariant takes 422, the reading rules/knowledge/a-case-has-at-least-one-hypothesis's own sibling refusal (ManifestWouldHoldNoHypothesisError) already took, and which the release and registration refusals repeat throughout this log. The corrective scope that surfaced this gap (work/revise-hypothesis-status-map-hotfix/intake/scope.md) independently proposes this same pairing for the identical reason and states the human already reviewed and authorized it — but a proposal awaiting the specification's own decision is not yet a fact the specification holds, so it is recorded as decided rather than merely carried over.
---

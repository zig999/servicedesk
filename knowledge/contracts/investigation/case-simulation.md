---
type: api
direction: published
operations:
  - simulate-case
  - simulate-hypothesis
---

## Description

The curator's own entry to the same engine a diagnosis runs, open to a case version in either state — draft or released, where a diagnosis reads only released.
`simulate-case` runs the same collection, judgment, resolution and consolidation a diagnosis runs, and returns the whole record back: evidence per concept, evaluation per hypothesis with its citations, the resolved outcome, the assessment, cost and durations — the detail `rules/investigation/the-customer-sees-only-the-text` keeps from the customer, faced to the curator instead.
`simulate-hypothesis` narrows the same run to what one named hypothesis revision collects and judges, alone, and resolves no outcome — one hypothesis does not resolve a case.
Neither operation writes an investigation, emits an event, or lets anything it collects reach a cache: `rules/investigation/a-simulation-writes-no-investigation` holds both to that.
Neither operation carries a narrative or a ticket reference — both belong to the investigation record neither operation ever creates.

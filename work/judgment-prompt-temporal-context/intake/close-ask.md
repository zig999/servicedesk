# Close ask

Close the judgment-prompt-temporal-context initiative.

The corrective increment was delivered (implementation + proof) and reviewed via /review-change.
The one finding the human chose to prioritize — the missing test driving an actual retry through
judgment-stage.ts for rules/investigation/judgment-reads-the-current-instant-fresh — was closed via
a proof-only re-delivery, suite green (2374+ tests, 0 failures).

The remaining review findings were assessed as low-risk or pre-existing and deliberately left open,
documented in delivery/judgment-prompt-temporal-context/review/judgment-prompt-temporal-context.md
for whoever picks them up next, rather than blocking this initiative's closure:
- 2 partial coverage criteria (current_instant's top-level placement, the recency/staleness wording)
- 2 certifications still decided by reading rather than by test (observed_at UTC normalization,
  ttl's unit)
- 1 unstated fact (max_tokens: 1024 has no specification node)
- 1 contradicted-node finding in a pre-existing test this task did not write
  (domain/investigation/evaluation)
- 2 standard departures (STK-08 hand-written JSON guards instead of Zod, TST-01 an inlined
  act+assert)

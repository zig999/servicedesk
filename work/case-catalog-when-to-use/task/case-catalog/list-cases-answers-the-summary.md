---
title: The list-cases read answers each case's summary
summary: The published catalog read carries each case's derived summary alongside its slug, inside the
  paged envelope it already answers with.
rationale: 'Cut apart from the derivation because the store''s listing entry is the interface and the
  published read is its consumer: the derivation changes when the rule stating it changes, and the answered
  shape changes when the published contract or the paging constraint does.'
sources:
- intake/scope.md
objective: The published list-cases read answers each case in the page with its derived summary alongside
  the slug of the case it summarizes.
criteria:
- Each entry in the answer's data names the slug of the case it summarizes.
- Each entry in the answer carries every summary field the store derived for that case.
- A summary field the store left absent for a case is omitted from that case's entry rather than answered
  as null.
- The answer carries the page's data, the total currently held, and the offset, limit and page count applied.
- A request naming no offset and no limit is answered with offset 0 and the configured default limit.
- A request naming a limit above the configured maximum is answered with the maximum applied.
- list-cases accepts the same request shape it accepts today — an optional offset and an optional limit,
  and nothing further.
depends_on:
- task/case-catalog/store-derives-the-case-summary
implements:
- domain/knowledge/case-summary
- contracts/knowledge/case-query
- constraints/listings-are-paged
- rules/knowledge/a-case-listing-answers-cases-in-slug-order
---

## What it is

The published side of the catalog: what a consumer reading list-cases receives for each case in a page.
Each entry names its case and carries the summary fields derived for it, with an absent field simply not there.
The paged envelope, its bounds and the request's own shape are exactly what they already were.

## Notes

Per the inventory, the listing's read path passes the store's page through unshaped, so what this task owes is the declared answer and its proof rather than a mapping layer.
The consumers whose fixtures are built on the slug-only entry are part of this same seam, per the inventory.
UNDERDETERMINED, from the specification — no criterion holds this read to the answered sequence: rules/knowledge/a-case-listing-answers-cases-in-slug-order states the page is cut in ascending-slug order, but every criterion here speaks only to each entry's contents and the envelope's counters, never to the order the entries come out in, so a read that re-emits the store's already-ordered page in any sequence of its own (a slug-keyed map, reversed, sorted by last_updated during serialization) would satisfy every criterion while breaking the order the store composed.
REMAINDER, from the specification — every clause of rules/knowledge/a-case-summary-is-derived-from-its-existing-versions and scenarios/knowledge/a-catalog-entry-follows-the-released-version is demonstrated by the derivation, not by this read: this task carries whatever task/case-catalog/store-derives-the-case-summary derived, unaltered, and both nodes belong there.

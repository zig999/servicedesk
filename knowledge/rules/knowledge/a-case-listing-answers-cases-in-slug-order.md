---
type: invariant
statement: A listing of every case answers those cases ordered by slug ascending, compared character by character, so which cases a page carries follows from their slugs alone.
expression: For a listing of cases answering c1..cn in answer order, c_i.slug precedes c_i+1.slug in ascending character order for every i in 1..n-1; and the page selected by offset k carries the (k+1)-th through (k+limit)-th cases of that same ascending-slug ordering over every case currently held.
constrains:
  - domain/knowledge/case
---

## Description

The slug is the only ordering fact a case itself declares. A case's identity declares slug and next_version alone, and next_version names the number the case's next draft will be assigned rather than anything a reader of the catalog asked to order by; every other fact a catalog entry shows — current_state, version_count, last_updated, title, when_to_use, released_version — belongs to domain/knowledge/case-summary, derived per case from its own versions.

a-slug-identifies-one-case makes that fact a total order over the answered set: no two cases share a slug, so there is no tie to break and no second read to establish the order.
The derived summary cannot serve as the sort key. a-case-summary-is-derived-from-its-existing-versions leaves last_updated absent for a case that currently holds no version, so it does not order the whole set at all, and it moves as curation proceeds — a reader walking the catalog page by page with a fixed offset would meet a case twice, or never, because the order shifted underneath the offset. A slug never changes and a case never loses it.

listings-are-paged makes any listing of cases one page selected by an offset and a limit, and says nothing about which cases a given page carries.
Left undeclared, the order would be whatever the storage's own arrangement returned, and which cases a reader reaches without paging would follow from that arrangement rather than from a decision — the same substitution hypotheses-are-ordered-by-precedence refuses for a manifest's precedence and a-hypothesis-revisions-listing-answers-highest-revision-first already answered for one hypothesis's revisions.

The direction carries no preference, because no case is the one a reader came for.
A hypothesis's revisions have a newest that a curator adopts and an auditor compares against, which is why that listing answers highest first; the cases of the catalog have no such distinguished member — both readers contracts/knowledge/case-query serves reach for the whole set, the curator browsing what exists and an automated consumer comparing each entry's when_to_use before it chooses. So the order is the one over the name each reader already addresses a case by, read in the direction a name-ordered catalog is read, which also lets a reader holding a known slug predict which page it falls on.

The rule decides the order of this one listing and nothing about the other listings listings-are-paged governs. It adds no attribute to domain/knowledge/case or domain/knowledge/case-summary, changes no listing's paging, and refuses no call. It is an invariant over the case alone, because the sort key is that element's own declared slug and the condition is decidable from the answer itself.

---
type: invariant
statement: A curator whose delete of a case holding no case version is accepted is taken to the surface presenting the listing of every case, which list-cases answers, and never to any surface addressed by the deleted case's slug.
expression: For every delete of case c that is accepted, the curator's destination is the surface presenting the listing of every case; that destination is never a surface keyed on c's slug, whether alone or together with a version number.
constrains:
  - domain/knowledge/case
---

## Description

An accepted delete leaves nothing at the deleted slug. a-case-holding-no-version-may-be-deleted removes the case itself, and a-case-read-by-an-unknown-slug-or-version-is-refused refuses any read or lifecycle operation naming a slug that no case version answers with an HTTP 404 CaseNotFoundError. So a surface addressed by the deleted slug is one that no read answers. Landing the curator there would show a refusal right after the act that succeeded. a-successful-case-version-creation-lands-on-the-created-versions-own-surface sends a creation to the identity's own surface because the identity still resolves there. A delete leaves the identity resolving nowhere, so it cannot take that destination. rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing already gives the same answer for the removal of a concept, a capability and a connector configuration. This rule takes that answer again for a case.

The listing of every case is where every remaining case still resolves. It is also where scenarios/knowledge/a-case-holding-no-version-is-deleted already says the deleted case no longer appears, so the curator lands where the outcome can be seen. a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading gives that surface a route to author a new case. That matters because a-case-is-created-by-the-first-create-draft-naming-its-slug lets a future create-draft claim the freed slug.

This rule states only the destination an accepted delete takes. constraints/listings-are-paged answers which page of the listing the curator lands on. A refused delete moves nobody, and this rule says nothing about it. This is an invariant over the case alone because the slug it is keyed on is that element's own declared attribute. It is written as a rule rather than in contracts/knowledge/case-lifecycle, because an api contract cannot declare a presentation. That is the same home the creation landing took. It adds no field, refuses no call and changes no listing.

---
title: Glossary and Capabilities Browsers
summary: Two read-only screens over the published glossary and capability-registry reads — the six-tab Glossary Browser and the table-plus-client-side-detail Capabilities Browser — replacing GlossaryPlaceholder and CapabilitiesPlaceholder.
rationale: >-
  I agree with the caller's own exclusion of rules/integration/a-capability-is-read-only,
  rules/knowledge/a-collected-concept-declares-a-ttl and
  rules/knowledge/every-collected-concept-has-a-read-only-capability: I read all three myself and
  each governs a write-time or collection-time behavior — the registry refusing a non-read-only
  registration, a hypothesis-revision defaulting a ttl at collection time, a hypothesis-revision
  requiring a registered capability — none of which a read-only listing of the glossary or the
  capability catalog exercises or displays a fact from. None belongs in this epic's `covers`.

  I additionally kept domain/integration/capability-registry itself (the domain-service, distinct
  from contracts/integration/capability-registry, the published API) out of `covers`, beyond what
  the caller asked me to check. Its own Responsibility is exactly two operations, register-capability
  and resolve-concept, both write-time or per-concept-resolution behavior; the scope's own findings
  #5 and #6 confirm this epic never calls GET /v1/capabilities/:concept (the per-concept resolve) and
  no screen registers anything. What the Capabilities Browser actually renders is the capability
  aggregate's own declared attributes (domain/integration/capability, domain/integration/capability-nature)
  and the registry's published list read (contracts/integration/capability-registry) — covering the
  domain-service node itself would claim an operation this epic never exercises.

  I confirmed contracts/integration/glossary-vocabulary is normalization's own consumed contract
  (upstream contracts/glossary/glossary-query, read-concept only) by reading it directly: it is not
  what either screen reads. Both screens read contracts/glossary/glossary-query's own published
  list-vocabulary-terms and list-concepts operations directly, so only that contract is covered, not
  the internal consumer relationship.

  Both covered contracts also declare a single-item read operation this epic never calls
  (read-vocabulary-term, read-concept, read-capability, per the scope's own findings #4 and #5/#6) —
  I covered the contract nodes whole rather than declaring a partial `uncovered` entry against them,
  since a contract's identity is the whole file and this plan's sibling epics already established the
  same convention for contracts/knowledge/case-query.
covers:
  - domain/glossary/action
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/recipient
  - domain/glossary/subject-attribute
  - domain/glossary/subject-type
  - domain/integration/capability
  - domain/integration/capability-nature
  - contracts/glossary/glossary-query
  - contracts/integration/capability-registry
sources:
  - intake/onda-6-scope.md
---

## What it is
The two remaining read-only proposal screens, 2.8 Glossary Browser and 2.9 Capabilities Browser, over Onda 1's router, API client and reusable table alone.
The Glossary Browser publishes all six of the glossary's own vocabularies as tabs — the five discovered/global term vocabularies plus concepts, each with its own ttl and accepted subject types.
The Capabilities Browser publishes the capability registry's current contents as a table, with a client-side row-selection detail panel rather than a second network read, per the scope's own confirmed finding #5.
Neither screen writes anything: both are fixed vocabulary and a fixed registry the cases consume, never edited from this console.

## Notes
This epic depends on nothing this plan delivers elsewhere; the scope states it needs only Onda 1's already-delivered router, table and API client.
None of this epic's three tasks touches src/hooks/use-concept-options.ts or src/hooks/use-hypothesis-revision-form.ts, the two files the inventory's risk section names as the ones a widened shared type would otherwise leak into.

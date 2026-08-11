---
title: A complete, valid fixture case feeds the whole engine
summary: A fictitious case, together with the glossary terms, capability registrations and canned observations its own hypotheses need, exists as file-backed JSON documents.
rationale: >-
  The scope's front 3 asks for a complete test case without naming its file layout or stating
  that the glossary/capability/observation data it depends on must ship alongside it; I bundled
  all four as one task's delivery, since a case cannot validate or run without its own
  vocabulary, capability registrations and collectible observations existing, and chose the
  fixture's own slug and directory layout since neither the scope nor the inventory states one.
  The execution-contract-binder's own implements pass over the one task this epic holds returned
  four BLOCKING notes — the fixture's own glossary terms, capability registrations and canned
  observations are governed by glossary and integration nodes this epic's first cut never named,
  even though the task's own objective always required authoring them. I grew `covers` to add
  those nodes rather than splitting the task, since a case fixture that validates needs its own
  vocabulary and capability data to exist in the same delivery — they were never a separable
  concern, only an uncovered one.
covers:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/knowledge/consolidation-register
  - constraints/a-case-is-stored-as-one-json-document
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/every-position-declares-a-resolution
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - rules/knowledge/one-falsifiable-claim-per-criterion
  - rules/knowledge/the-slug-matches-the-file-name
  - domain/glossary/subject-type
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - domain/integration/capability
  - domain/integration/capability-registry
  - domain/integration/capability-nature
  - contracts/investigation/observation-source
  - contracts/integration/corporate-records-source
  - domain/investigation/evidence-result
sources:
  - intake/scope.md
---

## What it is

One authored case document, valid against every current knowledge rule, becomes this plan's shared test data.
Its own glossary terms, capability registrations and canned observations travel with it so nothing downstream has to invent them again.

## Notes

None.

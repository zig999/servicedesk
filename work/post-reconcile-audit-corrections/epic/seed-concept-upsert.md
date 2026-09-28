---
title: Re-seeding a concept replaces its ttl and its accepted subject types
summary: Fixes seedConcepts to replace a concept's ttl and accepted subject types whole on re-seed, matching
  how the glossary registers a concept.
covers:
- domain/glossary/concept
- rules/glossary/a-registered-concept-is-never-removed
---

## What it is

A seed-script defect found during a certification-audit reconciliation: seedConcepts hand-rolled an upsert that updates only description and only adds newly-named accepted subject types, instead of replacing a re-seeded concept's ttl and accepted subject types whole, the way the glossary's own concept registration does.

## Notes

None.

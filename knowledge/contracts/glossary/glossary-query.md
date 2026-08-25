---
type: api
direction: published
operations:
  - read-vocabulary-term
  - read-concept
  - list-vocabulary-terms
  - list-concepts
---

## Description

The synchronous read the published language offers: resolve a vocabulary term or a concept exactly as the glossary currently holds it; or list every term one vocabulary currently holds and every concept currently registered, in pages (constraints/listings-are-paged).
A read by a name nothing holds is a refusal of its own (rules/glossary/a-glossary-read-by-an-unheld-name-is-refused).

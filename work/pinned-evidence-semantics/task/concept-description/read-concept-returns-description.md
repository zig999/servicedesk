---
title: read-concept returns a concept's description
summary: GET /v1/glossary/concepts/{name} answers a held concept's description alongside
  its existing attributes, empty for a legacy concept.
rationale: Kept apart from the write-refusal task because reading a concept's description
  is a separate falsifiable outcome over a different route (GET rather than PUT),
  and it depends on persistence because what it answers is what the store actually
  holds, including a legacy row's empty value.
sources:
- intake/scope.md
objective: A read of a held concept, by name, answers its description exactly as the
  glossary holds it, including the empty string for a concept holding none.
criteria:
- Reading a held concept by name answers its description alongside its name, accepts
  and ttl.
- Reading a held concept with no stored description answers the empty string for description,
  never a refusal.
depends_on:
- task/concept-description/concept-registration-requires-a-description
- task/concept-description/concept-persistence-carries-description
implements:
- domain/glossary/concept
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
---

## What it is
The read-concept response carries the concept's own description.
A legacy concept with no stored description answers empty rather than refusing the read.

## Notes
REMAINDER, from the specification — rules/glossary/a-concept-declares-its-description's statement is entirely a write-path invariant over register-concept/update-concept; it states nothing about reading a held concept, so no clause of it maps to either criterion here. It belongs to task/concept-description/concept-registration-requires-a-description.

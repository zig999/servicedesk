---
title: A lookup matches a published name exactly
summary: A term consulted in the glossary is compared to a published name character for character, the same comparison hypothesis names get.
ddd: invariant
statement: A term looked up in the glossary MUST be answered as published only where it equals a published name of the kind it is looked up as under exact character comparison.
expression: lookup(term, kind) answers published iff some published entry of that kind has a name comparing equal to term character for character
sources:
  - intake/decisoes-cinco-perguntas-2026-08-06.md
constrains:
  - definition/glossary/concept
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
examples:
  - Given a glossary publishing the concept onu-offline, when onu-offline is looked up as a concept, then it is answered as published.
  - Given a glossary publishing the concept onu-offline, when ONU-Offline is looked up as a concept, then it is answered as not published, because the comparison is exact.
---

## What it is

The glossary is the published language, and a language spoken exactly is what keeps two spellings from being one term by accident.
A term differing only in letter case from a published name is another term, and a case naming it is refused rather than silently matched.
The comparison is the one the base already decided for hypothesis names inside a case, so the whole system compares names one way.

## Rules

None.

---
title: The curator prose never changes what is collected
summary: Anything that changes what an investigation collects belongs in the structured part of the case.
ddd: policy
aggregate: cases
statement: The prose a curator writes in a case MUST NOT change what is collected, and anything that would MUST be structured instead.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a note in the prose saying to also check the equipment, when the case runs, then nothing extra is collected and the note belongs in the structured part.
---

## What it is

A case is read by three audiences — what runs it reads the structured part, what judges a hypothesis reads that hypothesis's criterion, and the curator reads the prose.
The prose never reaches any prompt, so a fact that only lives there is a fact the system does not have.

## Rules

None.

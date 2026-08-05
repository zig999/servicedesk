---
title: Evidence arrives in the glossary's vocabulary
summary: A corporate system's language stops at the normaliser.
ddd: invariant
statement: An observation MUST reach the domain in the glossary's vocabulary and never in the vocabulary of the system that produced it.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/evidence
consistency: immediate
examples:
  - Given a database answering with its own column names, when the evidence is built, then the observation carries the glossary's names instead.
---

## What it is

The normaliser looks like boilerplate and is the only thing keeping a vendor's vocabulary from becoming the domain's, which is why it is not simplified.
A technology leak happens in the answer, not in the call.

## Rules

None.

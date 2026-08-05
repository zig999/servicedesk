---
title: The content hash covers the whole file
summary: A published case's hash is computed over its whole file, the curator prose included.
ddd: invariant
statement: A published case's content hash MUST be computed over the whole case file, including the prose a curator writes for other curators.
sources:
  - intake/decisoes-seis-perguntas-2026-08-05.md
constrains:
  - definition/knowledge/case
examples:
  - Given a published case whose curator prose is corrected and nothing structured changes, when it is published again, then its content hash differs and it is a different published case.
  - Given an investigation that pinned an earlier hash, when the prose is later corrected, then the investigation still points at the version it read.
---

## What it is

The hash identifies the file, not only the behaviour, so a replay reaches exactly what was read and nothing about the case escapes it.
The cost is accepted deliberately: correcting a sentence of prose publishes a new case, and the index grows faster than the behaviour changes.
Because the index keeps every published version, an investigation that pinned an older one stays reproducible rather than pointing at something that has moved.

## Rules

Nothing about a published case is outside its hash.

---
title: The content hash covers the whole file
summary: A published case's hash is computed over the bytes of its whole file, the curator prose included, and never over a re-serialisation of what parsed.
ddd: invariant
statement: A published case's content hash MUST be computed over the bytes of the whole case file, including the prose a curator writes for other curators, and never over a re-serialisation of the parsed case.
sources:
  - intake/decisoes-seis-perguntas-2026-08-05.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
examples:
  - Given a published case whose curator prose is corrected and nothing structured changes, when it is published again, then its content hash differs and it is a different published case.
  - Given an investigation that pinned an earlier hash, when the prose is later corrected, then the investigation still points at the version it read.
  - Given a case whose parsed form is unchanged and whose file bytes differ, when it is published again, then its content hash differs, because the hash is over the bytes and not over the parse.
---

## What it is

The hash identifies the file, not only the behaviour, so a replay reaches exactly what was read and nothing about the case escapes it.
No parse retains the curator prose, so hashing a re-serialisation would drop the very thing this rule exists to cover.
The cost is accepted deliberately: correcting a sentence of prose publishes a new case, and the index grows faster than the behaviour changes.
Because the index keeps every published version, an investigation that pinned an older one stays reproducible rather than pointing at something that has moved.

## Rules

Nothing about a published case is outside its hash.
The content hash is a named SHA-256.
A case is one file.

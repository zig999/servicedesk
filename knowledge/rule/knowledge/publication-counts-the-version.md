---
title: Publication counts the version
summary: A published case's version is a sequential integer per slug that publication assigns, and it does the ordering the hash cannot.
ddd: invariant
statement: On publishing a case, its version MUST be one greater than the greatest version already published for its slug, and MUST be 1 where no version of that slug has been published.
expression: published.version == max(versions already published for that slug) + 1, and 1 where none exists
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
examples:
  - Given a slug no version of which has been published, when a case of it is published, then its version is 1.
  - Given a slug whose greatest published version is 2, when a case of it is published, then its version is 3.
  - Given a curator writing a case, when it is published, then the version comes from publication and from nothing the curator wrote.
---

## What it is

The version does the work the hash does not — it orders, and it is legible to a person, where a digest is neither.
Nothing a curator writes carries it, so it is not a number anybody raises by hand.
It is not a reference into version control either, because identity by content is what the hash already gives, and a second form of that would order nothing.

## Rules

The content hash covers the whole file.
The content hash is a named SHA-256.

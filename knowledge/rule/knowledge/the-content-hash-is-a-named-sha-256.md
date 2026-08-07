---
title: The content hash is a named SHA-256
summary: A published case's hash is a SHA-256 digest written with the algorithm's name inside the value, so a later change of algorithm leaves no earlier pin ambiguous.
ddd: invariant
statement: A published case's content hash MUST be a SHA-256 digest, written as the algorithm name `sha256`, a colon, and the digest in sixty-four lowercase hexadecimal characters.
expression: case.content_hash matches ^sha256:[0-9a-f]{64}$
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
examples:
  - Given a published case, when its content hash is written, then it carries the algorithm name, a colon and sixty-four lowercase hexadecimal characters.
  - Given a value whose digest is written in uppercase, when it is read as a content hash, then it does not match, because the digest is lowercase.
---

## What it is

The value is identity visible to the business, because an investigation pins it in order to stay reproducible.
Naming the algorithm inside the value costs seven characters, and it is what keeps every earlier pin unambiguous if a second algorithm ever arrives.

## Rules

The content hash covers the whole file.

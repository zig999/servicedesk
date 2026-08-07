---
title: A case is one file
summary: A case is held by exactly one markdown file kept under version control, which is what lets a hash over that file identify the case whole.
ddd: invariant
rationale: The material states a case is one markdown file versioned in git, and the analysis reads that as a fact of the domain rather than one of storage, because the material also states the case files are the model and the specialists are who write them.
statement: A case MUST be held by exactly one markdown file, kept under version control.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/draft-case
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a case split across two files, when it is read, then it is not one case, because a case is one file.
  - Given one case file, when it is published, then the hash that identifies the published case is taken over that one file.
---

## What it is

The case files are the model and the specialists are the ones who write them, so the file is not a storage detail of the case but the thing the domain edits and reviews.
One file per case is what makes a hash over that file an identity for the case, and what makes a diff of it a review.

## Rules

A case's slug matches the name of the file that holds it.
The frontmatter of that file holds everything the case declares.
The content hash covers the whole file.

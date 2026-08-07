---
title: The frontmatter holds everything the case declares
summary: The structured part of a case file is its frontmatter and the body below it is prose for the curator, and the frontmatter's delimiters are the boundary between them.
ddd: invariant
rationale: The material states which audience reads which part of the file and in which format, and the analysis reads that partition as a fact of the domain rather than one of format, because it is the boundary that decides what the engine ever sees.
statement: Everything a case declares MUST sit in the frontmatter of its file, and the body below the frontmatter MUST hold nothing the case declares.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
examples:
  - Given a case whose collected concepts are listed in the body rather than in the frontmatter, when it runs, then nothing extra is collected, because what the engine reads is the frontmatter.
  - Given a hypothesis criterion, when the case file is read, then the criterion sits in the frontmatter, because the case declares it, even though it is prose.
  - Given the note a curator writes about why a hypothesis exists, when the case file is read, then it sits in the body, and it reaches no prompt.
---

## What it is

Three audiences read a case, and the boundary between the two parts of the file is what tells them apart — the delimiters that open and close the frontmatter.
Above them is what the engine reads and what a schema validates; below them is what only the curator reads.
Prose is not the same as body — a hypothesis criterion is prose the case declares, so it sits in the frontmatter, and a reader who takes the two words for one loses the criterion.

## Rules

The prose a curator writes never changes what is collected.
A case is one file.

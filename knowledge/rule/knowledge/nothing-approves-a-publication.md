---
title: Nothing approves a publication
summary: Publishing a case is gated by the checks the case must pass and by nothing else — no person and no step approves it.
ddd: invariant
statement: A case's publication MUST NOT require any approval beyond the checks the case itself must pass.
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/draft-case
  - lifecycle/knowledge/case-publication
examples:
  - Given a case every check passes, when it is published, then it publishes, and nobody's approval is waited for.
  - Given a case a check refuses, when it is published, then it does not publish, and what stopped it is the check and not an approver.
---

## What it is

The material asked who approves a case's publication, and the answer is that nobody does.
What stands between a written case and a published one is the checks, so the publish trigger has no refusal beyond them and the lifecycle records none.
The two rules no validator can check stay what they are — items of human review over the written case, and not a gate on the act of publishing.

## Rules

A case does not publish without the contract check.
A validation answers with every refusal its checks produced.

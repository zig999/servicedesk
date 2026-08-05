---
title: Every collected concept has a read-only capability
summary: The contract between curated knowledge and integration is checked when publishing, not when running.
ddd: invariant
aggregate: cases
statement: A case MUST NOT be published while any concept it names has no registered read-only capability declaring an output schema and a timeout.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/case
  - definition/integration/capability
consistency: immediate
examples:
  - Given a case naming a concept no capability answers, when it is published, then publication is refused.
---

## What it is

This is where the two contexts negotiate, and checking it at publication is what keeps a curator's mistake out of a live customer call.

## Rules

None.

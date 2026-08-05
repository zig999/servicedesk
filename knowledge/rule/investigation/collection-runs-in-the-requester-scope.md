---
title: Collection runs in the requester's scope
summary: What an investigation may see is bounded by what whoever asked for it may see.
ddd: invariant
statement: Collection MUST run in the authorization scope of the requester and never in that of the service.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/evidence
  - definition/integration/capability
consistency: immediate
examples:
  - Given an attendant whose scope excludes a customer's financial data, when the case collects the financial situation, then the evidence records that access was denied.
---

## What it is

The scope is propagated all the way to the connector, because retrofitting it later means rewriting every connector.
A refusal is an evidence like any other, so a narrowed scope degrades an investigation rather than failing it.

## Rules

None.

---
title: A case does not publish without the contract check
summary: A capability registry that cannot be consulted is not permission to postpone the check to execution.
ddd: invariant
statement: A case MUST NOT be published while the capability registry cannot be consulted.
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
  - intake/ratificacao-tres-decisoes-2026-08-07.md
constrains:
  - definition/knowledge/draft-case
  - definition/knowledge/check-unavailable
consistency: immediate
examples:
  - Given a capability registry that cannot be reached, when a case is published, then it does not publish.
  - Given the same registry once it can be reached again, when the same case is published, then the check runs and decides.
---

## What it is

The check runs at publication so a curator's mistake does not surface during a customer call, and publishing while it cannot run would spend exactly that.
A registry that is out is a reason to try again, never a reason to let the case through unchecked.

## Rules

Every concept a case collects has a registered read-only capability.
Where the registry cannot be consulted, that unavailability is never expressed as a refusal, and it is answered beside every refusal the other checks produced.

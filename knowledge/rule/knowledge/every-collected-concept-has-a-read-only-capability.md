---
title: Every collected concept has a read-only capability
summary: The contract between curated knowledge and integration is checked when publishing, not when running.
ddd: invariant
aggregate: cases
statement: A case MUST NOT be published while any concept it names has no registered read-only capability declaring an output schema and a timeout.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
  - definition/integration/capability
consistency: immediate
examples:
  - Given a case naming a concept no capability answers, when it is published, then publication is refused.
  - Given a case naming a concept no registered capability answers, when it is validated, then the refusal carries the text «Nenhuma capacidade registrada responde ao conceito «{conceito}». Um caso não publica enquanto algum conceito que ele coleta não tiver capacidade — registre a capacidade na integração.», with the concept named in place.
---

## What it is

This is where the two contexts negotiate, and checking it at publication is what keeps a curator's mistake out of a live customer call.
The registry is consulted by the name of the concept and answers the capability registered now, and a registry that cannot be consulted is answered as an unavailable check rather than as a refusal of this rule.

## Rules

The contract check reads the capability registered at the moment of publication.
A lookup in the registry names a concept and matches it character for character.
A case does not publish while the contract check cannot be decided.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.

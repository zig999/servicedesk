---
title: A resolution declares an outcome and a referral
summary: A conclusion says what was concluded and who acts on it, in every hypothesis and in both fallbacks.
ddd: invariant
aggregate: cases
statement: Every resolution a case declares MUST declare an outcome and a referral, and that referral MUST declare an action and a recipient.
expression: for every resolution the case declares — its own hypotheses' and both fallbacks' — resolution.outcome, resolution.referral.action and resolution.referral.recipient are present
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/ratificacao-tres-decisoes-2026-08-07.md
constrains:
  - definition/knowledge/resolution
  - definition/knowledge/referral
examples:
  - Given a hypothesis whose resolution declares no outcome, when its case is validated, then it is refused at the position of the missing field.
  - Given a case whose no-data fallback declares a referral naming no recipient, when it is validated, then it is refused at the position of the missing field.
  - Given a case whose two fallbacks each declare no outcome, when it is validated, then two refusals are answered, one at the position of each.
  - Given a resolution declaring no outcome, when its case is validated, then the refusal carries the text «Esta conclusão não declara «{campo}». Uma conclusão diz o que se concluiu e quem age sobre isso — declare desfecho e encaminhamento com acao e destinatario.», with the missing field named in place.
---

## What it is

A conclusion that names no outcome concluded nothing, and one that names no referral leaves nobody to act on what it concluded.
It reaches every resolution a case declares and not only a hypothesis's, because the fallbacks conclude a case as much as a confirmed hypothesis does.

## Rules

A resolution names an outcome and a referral, and a referral names an action and a recipient, all three from the glossary.
Every term any of them names exists in the glossary.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.

---
type: value-object
attributes:
  - name: outcome
    type: domain/glossary/outcome
    required: true
  - name: referral
    type: domain/knowledge/referral
    required: true
  - name: determining_hypothesis
    type: string
  - name: text
    type: string
    required: true
  - name: register
    type: domain/knowledge/consolidation-register
    required: true
  - name: usage
    type: usage
    required: true
  - name: elapsed_ms
    type: integer
    required: true
  - name: prompt
    type: string
    required: true
---

## Description

The answer (the material's "parecer"): outcome, referral and determining hypothesis come from the case's resolve-outcome and are never decided here; the text is the only field the writing produces.
The writing receives narrowed input, so the text cannot contradict the outcome — it is never given the material to do so.
The determining hypothesis is absent when nothing confirmed and the fallback answered.
register is the register the writing call actually used to produce the text — the pinned case version's own declared register when it holds one, or whatever register the consolidation adapter defaults to when the version declares none (`domain/knowledge/case-version`). It is required, never absent, because the writing call always settles on some one register before it can produce text at all, whichever side supplied it; a reader is never left to guess which register is behind the text now on hand.
usage is the consolidation call's own record — what the provider charged for producing the text — the same call-level shape `domain/investigation/evaluation`'s own usage attribute already carries for a judgment call. It is required rather than optional: cost's own "one writing call, linear in hypotheses" holds unconditionally, so a consolidation call, unlike a hypothesis's judgment, never has a no-data reason to have skipped running.
elapsed_ms and prompt are the same call's own record for how long that call took and the consolidation prompt as it actually materialized — the same call-level facts `domain/investigation/evaluation`'s own elapsed_ms and prompt attributes already carry for a judgment call. Like usage, both are required rather than optional here, for the same reason: a consolidation call never has a no-data reason to have skipped running, so neither is ever absent.

## Responsibility

Carry what the requester acts on, whole, and only after the record is written.

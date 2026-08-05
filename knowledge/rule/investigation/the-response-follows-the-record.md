---
title: The response follows the record
summary: Nobody acts on an assessment that has no record, so the whole response waits for the write.
ddd: invariant
statement: The response to the requester MUST leave only after the investigation is written, and MUST carry the referral and the text together.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/investigation
  - definition/investigation/assessment
consistency: immediate
examples:
  - Given a resolved referral and a text not yet written, when the attendant asks what to do, then nothing is answered until the investigation is written.
  - Given a failed write, when the requester is answered, then the answer is an error and never an unrecorded assessment.
---

## What it is

The referral is exactly the part somebody acts on, which is why sending it early to save a few seconds is the one shortcut this rule refuses.
It is also why the write is the single stage allowed to fail rather than degrade.

## Rules

None.

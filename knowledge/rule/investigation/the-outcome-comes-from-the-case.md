---
title: The outcome comes from the case
summary: Nothing produces an outcome or a referral except the case that declared them.
ddd: invariant
statement: An assessment's outcome and referral MUST be the ones the case resolved, and MUST NOT be produced anywhere else.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/assessment
  - definition/knowledge/case
consistency: immediate
examples:
  - Given every hypothesis refuted, when the assessment is built, then its outcome and referral are the case's fallback and nothing else.
---

## What it is

The case answers with the first confirmed hypothesis in its declared order, that hypothesis's outcome and referral, and that hypothesis as the determining one.
Leaving that decision to whatever runs the case would be the anaemic version of this model, with the runner reading the hypotheses and deciding for itself.

## Rules

None.

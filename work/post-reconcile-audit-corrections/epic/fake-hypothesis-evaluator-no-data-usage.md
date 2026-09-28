---
title: Fake hypothesis evaluator carries no usage or elapsed time for a no-data outcome
summary: Stops the fake hypothesis-evaluator test double from attaching a placeholder usage and elapsed
  duration to a seeded outcome whose reason is no-data.
covers:
- domain/investigation/evaluation
---

## What it is

A test-double defect found during a certification-audit reconciliation: the fake hypothesis-evaluator adapter unconditionally attaches a placeholder usage and elapsed_ms to every seeded outcome, including one seeded with reason no-data, where no call was ever made.

## Notes

None.

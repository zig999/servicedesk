---
title: Two tests assert a stricter real-timer millisecond guarantee than the specification makes
summary: The single corrective task that loosens two pre-existing test assertions (a strict > against
  durations_total, and a hard >= threshold against a mocked delay) so they tolerate the legitimate equality
  and near-miss a 1ms-resolution clock can produce, without changing any production code.
rationale: A corrective increment cuts no epic through survey/decomposition -- this is the structural
  container the validator still requires, holding only the one task claim.
covers:
- domain/investigation/durations
- domain/investigation/evaluation
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
sources:
- intake/scope.md
---

## What it is

A single-task epic for the corrective increment durations-total-test-threshold-too-strict.

## Notes

None.

---
title: Orphaned-connector-placeholder refusal checks any capability, not every capability
summary: Corrects the registration-time orphaned-placeholder check to refuse a placeholder absent from
  any one currently-registered capability sharing the connector.
covers:
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
- domain/integration/connector-configuration-registry
---

## What it is

A registration-time defect found during a certification-audit reconciliation: the orphaned-placeholder check took the intersection of every currently-registered capability sharing a connector, refusing only when a placeholder was absent from all of them, rather than the union that refuses when it is absent from any one.

## Notes

None.

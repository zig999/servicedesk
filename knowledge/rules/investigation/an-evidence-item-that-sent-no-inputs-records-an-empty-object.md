---
type: invariant
statement: >-
  An evidence item whose collection sent no inputs at all — because the capability it ran asked for
  none, or because the attempt ended before anything reached the connector — records its inputs as the
  empty JSON object text `{}`, never an empty string, never an absent value and never an invented
  parameter.
constrains:
  - domain/investigation/evidence
---

## Description

domain/investigation/evidence declares inputs a required string, which pins what was asked of the connector so the same ask can be replayed and so the evidence cache can be keyed by it; a string leaves open what is recorded when there was nothing to ask, and a call carrying no parameter is an ordinary outcome rather than a failure to record one.

The empty object is what was actually sent, expressed the same way a populated ask is: a reader replaying the item replays a parameterless call without first testing whether the recorded text is a payload at all, and the cache key that folds inputs in gets one definite value for every such collection instead of one value per collector's idea of nothing.

An empty string would not carry that: it is indistinguishable from an item whose inputs were never recorded, so a reader meeting it learns nothing about whether the call was parameterless or the record incomplete — the same confusion between an honest emptiness and an unrecorded fact that domain/investigation/evidence's own readings for its snapshotted semantics exist to prevent.

This fixes what is recorded, never what any reader does with it: an item that sent no inputs still ends exactly as its own result states, and nothing here refuses, degrades or re-collects it.

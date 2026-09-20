---
type: invariant
statement: >-
  An evidence item whose result is timeout, denied or unavailable records its observation as the empty
  JSON object text `{}` — never an empty string, never an absent value and never a message, an error
  name or any other rendering of the cause — so a reader parsing it finds no observed field to read or
  cite and learns what happened from that item's own result and result_detail instead.
constrains:
  - domain/investigation/evidence
---

## Description

domain/investigation/evidence declares observation a required string, and rules/investigation/an-observation-is-recorded-as-json-object-text fixes what that string holds only for an item that ended ok, deliberately leaving the other three endings outside itself. domain/investigation/evidence-result already holds what such an item is worth to a reader — the attempt's own fact rather than a usable observation — but the field is required all the same, and a required field with no decided value is filled by whoever writes the record next.

The empty object is that value, for the reason rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object already gives for the sibling string on this same element: one definite text for every collection that observed nothing, instead of one text per collector's idea of nothing, and one parse rather than a test of whether the recorded text is a payload at all. An empty string would not carry that — it is indistinguishable from an item whose observation was never recorded, so a reader meeting it cannot tell an honest emptiness from an incomplete record, the same confusion the element's own readings for its snapshotted semantics exist to prevent.

What a reader takes from it follows from the shape: parsing yields an object with no field, so no field name domain/investigation/field-semantics snapshots is present, nothing is citable from the item, and the account of what happened is read from result and result_detail — where rules/integration/an-unresolvable-observation-ends-unavailable, rules/integration/an-unreachable-connector-ends-unavailable and rules/integration/an-unclassified-status-ends-unavailable each already put their cause. A cause written into observation instead would sit in exactly the text a judgment and an operator-facing presentation parse for what was observed, and prose explaining the absence of data would be read as data the collection never returned.

This fixes what is recorded and nothing else: an item that observed nothing still ends exactly as its own result states, nothing here refuses, degrades or re-collects it, and constraints/the-evidence-cache-admits-only-ok-results keeps every such item out of the cache regardless.

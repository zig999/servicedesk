---
contract_version: siegard-reconcile/1
title: case-detail-screen.tsx drift, final sweep
summary: frontend/app/src/routes/case-detail-screen.tsx was reported as code drift by trace.py --check
  (domain/knowledge/case-version). The human asked to reconcile it against every node the trace binds
  it to.
target: frontend
files:
- path: src/routes/case-detail-screen.tsx
  change: unchanged; read fresh
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: the Simulate Link renders identically for a draft or a released row, since nothing about it depends
    on version state.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: contracts/knowledge/case-query
  conforms: true
  how: the Versions and Attributes tabs read from GET /v1/cases/:slug/versions and read-case respectively,
    matching this contract.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: the screen reads slug from its own route param and renders it as the case's identity.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: toRow's own version/state mapping matches this node's own fields.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: STATE_CELL's draft/released mapping matches this node's own closed vocabulary.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: the "New draft" link is gated on hasDraft, matching this rule.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: the Versions tab renders every version the response's own data page carries, never only the most
    recently opened one.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: true
  how: the empty-rows branch renders "This case currently holds no version."
  encoded_at:
  - src/routes/case-detail-screen.tsx
notes: One delegation ran, over the file's whole node set (8 nodes). All 8 cleared -- no finding against
  this file.
---

## What it is

A reconciliation of case-detail-screen.tsx, the one frontend file trace.py --check reported as
code drift, against every node the trace binds it to.

## Notes

All 8 nodes cleared.

---
title: GET /v1/capabilities/{concept}
summary: The HTTP route exposing the existing read-capability domain operation.
objective: GET /v1/capabilities/{concept} exposes the existing read-capability domain operation over HTTP.
criteria:
  - A valid request returns the capability currently answering the named concept, with its declared contract.
  - A request naming a concept no capability currently answers is refused with the status status-map assigns.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/integration/capability-registry
  - domain/integration/capability
  - domain/integration/capability-registry
  - rules/integration/one-capability-answers-one-concept
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-capability operation.

## Notes

Criterion 2's status refusal is not a specification silence: the specification already answers with `{ held: false }` rather than an error (ICapabilityQuery's own read-capability contract), and which transport status that unheld answer becomes is the standard's own COR-04 concern, resolved by task/case-lifecycle-http/status-map, not a domain fact this specification would state.

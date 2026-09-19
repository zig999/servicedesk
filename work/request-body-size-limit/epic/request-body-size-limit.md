---
title: Configured request-body size limit
summary: 'A corrective increment: the HTTP server carries no configured request-body size ceiling, leaving
  EDG-06 unanswered.'
covers:
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-database-is-externally-provisioned
- constraints/the-pool-bounds-are-positive-integers
- constraints/the-system-persists-to-one-relational-database
- contracts/glossary/glossary-authoring
- contracts/integration/capability-registry
- contracts/integration/capability-schema-draft
- contracts/integration/connector-configuration-draft
- contracts/integration/openapi-document-operations
- contracts/knowledge/case-input-requirements
- contracts/knowledge/case-lifecycle
- domain/integration/connector-configuration-registry
uncovered:
- node: constraints/the-connection-pool-is-bounded-by-configuration
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: constraints/the-database-is-externally-provisioned
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: constraints/the-pool-bounds-are-positive-integers
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: constraints/the-system-persists-to-one-relational-database
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/glossary/glossary-authoring
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/integration/capability-registry
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/integration/capability-schema-draft
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/integration/connector-configuration-draft
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/integration/openapi-document-operations
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/knowledge/case-input-requirements
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: contracts/knowledge/case-lifecycle
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
- node: domain/integration/connector-configuration-registry
  why: The trace's --encodes claim for env.ts and build-app.ts binds this node because those files also
    participate in other, unrelated concerns (the database pool, other registered contracts); this correction
    adds a request-body size ceiling, a fact no specification node states, and touches none of these nodes'
    own behavior.
---

## What it is

A corrective increment: adds a configured request-body size ceiling, closing the project's own
standard rule EDG-06 ("A payload above the configured size limit is refused at the middleware
boundary"), which nothing in src/config/env.ts or src/http/build-app.ts currently answers.

## Notes

`covers` is seeded mechanically from `trace.py --encodes src src/config/env.ts` and
`trace.py --encodes src src/http/build-app.ts`, per the corrective-increment route. Every node
returned is declared in `uncovered` with a why, since none governs a request-body size ceiling --
this is a gap against the project's own standard (EDG-06), not against any specification node, and
the task below implements no specification node, with its own rationale saying so.

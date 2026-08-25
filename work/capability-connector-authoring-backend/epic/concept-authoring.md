---
title: Concept authoring surface
summary: A write path for a concept, from a new glossary-store port method through the HTTP route that exposes register-concept.
rationale: Concept is split into its own epic because, unlike Capability and Connector Configuration, it has no write path at any layer today — the inventory records that the glossary store's port declares no write method and the relational store's read path is documented read-only — so this epic's scope necessarily includes a port change the other two epics do not need.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
covers:
  - domain/glossary/concept
  - contracts/glossary/glossary-authoring
  - constraints/no-route-enforces-authentication
---

## What it is

The epic delivering a concept write path: the store-port method and relational implementation, and the register-concept HTTP route built on it.
It covers the concept value-object and the glossary-authoring contract that names register-concept as its one operation.
It covers the no-authentication constraint because register-concept is a new route reaching the API layer.

## Notes

None.

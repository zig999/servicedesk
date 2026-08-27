---
title: Subject derivation
summary: The subject a simulation runs against, derived in the frontend from the version's own collection plan through the capability and connector-configuration registries, and rendered for the curator to complete.
rationale: The scope offers one cockpit epic or a split at the curator's judgment, naming subject-derivation explicitly as a candidate boundary because it depends only on already-published read endpoints (case-query, capability-registry, connector-configuration-registry) and nothing from the sibling backend initiative's still-undelivered simulate-case/simulate-hypothesis operations; I took that boundary because every task in this epic is independently demonstrable against endpoints that already exist in the tree, while every task in simulation-cockpit is written against a contract the backend has not yet delivered — keeping them apart lets this epic's tasks be delivered, and shown met, without waiting on anything the sibling initiative decides.
sources:
  - work/case-simulation-frontend/intake/scope.md
covers:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/integration/capability
  - domain/integration/connector-configuration
  - rules/integration/an-http-connector-configuration-declares-its-call
  - domain/knowledge/case-version
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - contracts/integration/capability-registry
  - contracts/integration/connector-configuration-registry
  - contracts/knowledge/case-query
---

## What it is

The one subject shared between a full-case run and a single-hypothesis run, per D7.
Its required fields are derived, not typed by the curator from nothing: the version's collection plan resolves to concepts, each concept resolves to a capability and its connector, and each connector's configuration address is read for `${subject:<attribute>}` placeholders.
The curator may still add free-form attributes on top of the derived set, drawn from the glossary rather than typed arbitrarily.

## Notes

None.

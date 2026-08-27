---
title: use-simulation-subject hook
summary: Derives the subject's required fields from a case version's collection plan through the capability and connector-configuration registries.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: A hook computes, for a given case version, the full set of subject fields required to run a simulation — one per distinct `${subject:<attribute>}` placeholder reachable from the version's collection plan through the capability registry and the connector configurations — accepts curator-added attributes and the requester on top, and reports whether the subject is complete enough to simulate.
criteria:
  - For a version whose collection plan names one or more concepts, the hook resolves, for every concept, the capability currently registered to answer it and that capability's declared connector.
  - For every resolved connector whose configuration embeds one or more `${subject:<attribute>}` placeholders — in its address, query, headers or body — the hook returns one required field per distinct placeholder name, each annotated with the connector and the capability that asked for it.
  - A required field's associated capability input_schema is carried through as a free-text hint, never parsed or validated as structured data.
  - The hook accepts curator-added attributes alongside the derived ones and represents every attribute — derived or added — as one attribute name paired with one value, matching domain/investigation/subject-attribute-value.
  - The hook's reported readiness is false while the requester or any derived required field is empty, and true only once every derived required field and the requester hold a non-empty value.
  - The hook's reported readiness never turns true for a subject holding zero attribute-values, even for a version whose collection plan derives no required field and to which the curator has added none, satisfying rules/investigation/a-subject-carries-at-least-one-attribute.
  - The same derived subject and readiness are exposed identically whether the caller intends a full-case run or a single-hypothesis run — one subject, shared, per D7.
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
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

The derivation the scope's "Subject (D7)" section walks step by step: collection plan to concepts, concepts to capability and connector, connector configuration to placeholder, placeholder to required field.
`ConnectorConfiguration.configuration` is read here as a JSON string whose address (and, per this task's own governing rule, its query, headers and body) this hook is the first consumer to parse for `${subject:<attribute>}` placeholders.

## Notes

The BLOCKING conflict standing here through two earlier rounds is resolved. `domain/integration/connector-configuration` and `rules/integration/an-http-connector-configuration-declares-its-call` previously stated an HTTP connector configuration carries only `method`/`responseMap`/`statusMap`, contradicting criterion 2's need to read `address` for placeholders. A `/reconcile` (`siegard-reconcile/http-connector-address-placeholder-gap.md`) found the delivered code already implementing the address/placeholder mechanism with no node holding it, and a following `/analyse` extended the rule's statement to declare it — logged at `rules/integration/an-http-connector-configuration-declares-its-call.md`/`statement`.
Criterion 2 widened on this same rebind from "the connector's configuration's address" to "its address, query, headers or body" — the binder found the rule now states a placeholder may sit in any of the four, and the original address-only wording would have left query/headers/body placeholders undetected against the rule's own broader claim.
The requester's shape and origin is stated at `domain/investigation/investigation.md`, outside this task's candidate set — form only, does not change this task's criteria.
The fact that the derived subject and readiness must be identical for a full-case and a single-hypothesis run (D7) is stated by `contracts/investigation/case-simulation`, also outside this task's candidate set.
Decision, beyond the covers — stand: `domain/investigation/investigation` is named only to point at where the requester's own shape is stated, never as a fact this task implements.
Decision, beyond the covers — stand: `contracts/investigation/case-simulation` is named only to point at where D7's shared-subject fact is stated, never as a fact this task implements.
Decision, beyond the covers — stand: `contracts/investigation/diagnosis`, named alongside `contracts/investigation/case-simulation` above as describing how the requester reaches a call, is named only for that pointer, never as a fact this task implements.

---
title: use-simulation-subject hook
summary: Derives the subject's required fields from a case version's collection plan through the capability and connector-configuration registries.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: A hook computes, for a given case version, the full set of subject fields required to run a simulation — one per distinct `${subject:<attribute>}` placeholder reachable from the version's collection plan through the capability registry and the connector configurations — accepts curator-added attributes and the requester on top, and reports whether the subject is complete enough to simulate.
criteria:
  - For a version whose collection plan names one or more concepts, the hook resolves, for every concept, the capability currently registered to answer it and that capability's declared connector.
  - For every resolved connector whose configuration's address contains one or more `${subject:<attribute>}` placeholders, the hook returns one required field per distinct placeholder name, each annotated with the connector and the capability that asked for it.
  - A required field's associated capability input_schema is carried through as a free-text hint, never parsed or validated as structured data.
  - The hook accepts curator-added attributes alongside the derived ones and represents every attribute — derived or added — as one attribute name paired with one value, matching domain/investigation/subject-attribute-value.
  - The hook's reported readiness is false while the requester or any derived required field is empty, and true only once every derived required field and the requester hold a non-empty value.
  - The hook's reported readiness never turns true for a subject holding zero attribute-values, even for a version whose collection plan derives no required field and to which the curator has added none, satisfying rules/investigation/a-subject-carries-at-least-one-attribute.
  - The same derived subject and readiness are exposed identically whether the caller intends a full-case run or a single-hypothesis run — one subject, shared, per D7.
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/integration/capability
  - domain/integration/connector-configuration
  - domain/knowledge/case-version
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - contracts/integration/capability-registry
  - contracts/integration/connector-configuration-registry
  - contracts/knowledge/case-query
---

## What it is

The derivation the scope's "Subject (D7)" section walks step by step: collection plan to concepts, concepts to capability and connector, connector configuration to placeholder, placeholder to required field.
`ConnectorConfiguration.configuration` is read here as a JSON string whose `address` field this hook is the first consumer to parse for `${subject:<attribute>}` placeholders.

## Notes

BLOCKING, from the specification — criterion 2 requires reading a resolved connector's configuration `address` for `${subject:<attribute>}` placeholders, but the specification states, through `domain/integration/connector-configuration` and the rule it points to for what its keys mean (`rules/integration/an-http-connector-configuration-declares-its-call`), that an HTTP connector configuration declares exactly `method`, `responseMap` and `statusMap` — no `address` key and no placeholder syntax at all; a configuration lacking any of the three issues no call. This directly contradicts what this criterion needs. The delivered code disagrees with the specification here, not just this task: `src/src/http-connector/connector-request-resolver.ts` already implements exactly the `${subject:<attribute>}`/`${requester}`/`${credential:...}` placeholder mechanism this task's criterion assumes, reading `configuration.address` and substituting placeholders in it, query, headers and body — the specification (`domain/integration/connector-configuration.md` and `rules/integration/an-http-connector-configuration-declares-its-call.md`) was simply never updated to state it. This is a pre-existing specification gap, unrelated to this plan's own scope, surfaced here because this is the first task to read that corner of the specification closely. A human settles this — either by routing a `/reconcile` (or an `/analyse` amendment) over `domain/integration/connector-configuration.md` and `rules/integration/an-http-connector-configuration-declares-its-call.md` against `src/src/http-connector/`, before this task is written, or by deciding a different, spec-conformant mechanism for deriving required subject fields.
The requester's shape and origin (an opaque string, supplied directly in the diagnose/simulate call's own payload) is stated at `domain/investigation/investigation.md`, outside this task's candidate set.
The fact that the derived subject and readiness must be identical for a full-case and a single-hypothesis run (D7) is stated by `contracts/investigation/case-simulation`, also outside this task's candidate set.
Decision, beyond the covers — stand: `domain/investigation/investigation` is named only to point at where the requester's own shape is stated, never as a fact this task implements.
Decision, beyond the covers — stand: `contracts/investigation/case-simulation` is named only to point at where D7's shared-subject fact is stated, never as a fact this task implements.
Decision, beyond the covers — stand: `rules/integration/an-http-connector-configuration-declares-its-call`, named in the BLOCKING entry above, is named only to point at what contradicts this task's own criterion 2, never as a fact this task implements.

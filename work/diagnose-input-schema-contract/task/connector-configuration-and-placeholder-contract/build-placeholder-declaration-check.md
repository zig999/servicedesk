---
title: Build the shared placeholder-declared-by-its-capability check
summary: A reusable check names every Subject-attribute placeholder a connector configuration's
  call text embeds that a capability's declared input-schema properties does not hold,
  and each registry can read the other's current registrations to run it.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: A pure check, given a connector configuration's embedded placeholders and
  a capability's declared input-schema properties, names every Subject-attribute placeholder
  absent from those properties; and the capability registry and the connector-configuration
  registry can each read the other's currently registered records so this check is
  runnable at either registration's write.
criteria:
- Given a connector configuration's call text embedding a placeholder naming a Subject
  attribute, and a capability's declared properties not naming that attribute, the
  check names that placeholder as orphaned.
- Given a connector configuration's call text embedding a placeholder naming a Subject
  attribute that a capability's declared properties does name, the check names no
  orphaned placeholder for it.
- A placeholder naming the requester or a credential is never named orphaned by the
  check.
- The capability registry can read every currently registered connector configuration
  through a narrow port the composition root supplies, backed by the same connector-configuration
  store already in use.
- The connector-configuration registry can read every currently registered capability
  through a narrow port the composition root supplies, backed by the same capability
  store already in use.
rationale: The inventory flags the cross-registry read as a shared concern across
  both registration-side tasks and names composeResources as the one composition root
  that currently keeps the two registries mutually unaware; cutting one task for the
  shared check-and-read seam, ahead of the three tasks that consume it (both registration
  refusals and the connector-test report), keeps each of those an independently demonstrable
  consumer rather than three copies of the same wiring. The placeholder-token extraction
  itself reuses the existing PLACEHOLDER_PATTERN walk rather than a new regex, per
  the inventory's must_not_duplicate note.
implements:
- domain/integration/capability
- domain/integration/capability-registry
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- contracts/integration/capability-registry
- contracts/integration/connector-configuration-registry
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
---

## What it is
A reusable check names every Subject-attribute placeholder a connector configuration's call text embeds that a capability's declared input-schema properties does not hold, and each registry can read the other's current registrations to run it.

## Notes
REMAINDER, from the specification — rules/integration/a-connector-placeholder-is-declared-by-its-capability's statement has a clause this task's criteria never reach: "Either refusal is an HTTP 422 response reporting a ConnectorPlaceholderOutsideInputSchemaError naming every orphaned placeholder together with the capability that fails to declare it." This task's criteria stop at the pure check naming orphaned placeholders and at the two read ports; nothing here wires that naming into either registration's write path or turns it into the stated HTTP 422 refusal. The same gap shows in scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused, whose first `then` line ("the registration is refused") is likewise not produced by anything this task's criteria require — only its second line (naming the orphaned placeholder and the capability) is. Belongs: the tasks of this epic that wire the shared check into the capability-registration and connector-configuration-registration write paths and issue the HTTP 422 ConnectorPlaceholderOutsideInputSchemaError refusal (refuse-connector-registration-with-orphaned-placeholder, refuse-capability-registration-with-orphaned-placeholder).

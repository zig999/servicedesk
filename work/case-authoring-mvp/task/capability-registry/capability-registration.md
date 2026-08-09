---
title: Capability registration
summary: register-capability with the registry's refusals, persisting registrations as plain JSON files.
rationale: Registration and resolution are two falsifiable outcomes over the registry, cut apart so the refusal rules and the lookup change independently; the scope stated the registry reads without cutting the registry itself.
objective: A capability registers only with a complete read-only contract, and every registration the registry holds persists as a plain JSON file.
criteria:
  - A registration whose nature is not read-only is refused.
  - A registration missing its input schema, its output schema or its connector is refused.
  - A registration that states no timeout takes the default of sixty seconds.
  - A registration with a complete read-only contract is not refused by these rules.
  - Registrations persist as plain JSON files and the dependency manifest declares no database driver.
implements:
  - domain/integration/capability
  - domain/integration/capability-nature
  - domain/integration/capability-registry
  - rules/integration/a-capability-is-read-only
  - rules/integration/a-capability-declares-its-contract
  - constraints/the-mvp-persists-to-no-database
sources:
  - intake/scope.md
---
## What it is
The refusing half of the registry: nature, both schemas, timeout and connector held to the declared contract at registration.

## Notes
UNDERDETERMINED, from the specification — domain/integration/capability declares name and version as required attributes, and no criterion refuses a registration that omits them. Passes as written: an implementation that accepts a registration stating no name or no version satisfies all five criteria while the specification requires both.
UNDERDETERMINED, from the specification — criterion 5 checks only a driver-free manifest and JSON files, but constraints/the-mvp-persists-to-no-database states the MVP runs against no database and its fitness adds that the deployment provisions none. Passes as written: an implementation persisting JSON files while also reaching a database service without a driver, over HTTP, which the constraint refuses.
REMAINDER, from the specification — the whole statement of rules/integration/one-capability-answers-one-concept reaches no criterion of this task, which resolves nothing. Belongs: the task of this epic that implements the registry's resolve-concept operation.
Advisory — domain/integration/capability-registry declares register-capability and resolve-concept; this task exercises only the refusal half, and contracts/integration/capability-registry neighbors it for the same reason and is left out of implements.
Advisory — criterion 3 states the default as sixty seconds while domain/integration/capability declares the timeout attribute in milliseconds; the defaulted value encoded in the field is 60000, and a delivery asserting 60 against that field reads the criterion's unit, not the specification's.
Advisory — domain/integration/capability declares no attribute linking a capability to the concept it answers, yet the registry is the one lookup from a concept to the capability answering it; the resolution task will need that link stated somewhere, and no candidate states where it lives.
Advisory — the constraint's clause that everything the system records persists as plain JSON files is system-scoped; this task answers it for registrations only.

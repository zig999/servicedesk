---
title: Capability payload_notes end-to-end surface
summary: The capability-registry, register-capability and read-capability-by-identity
  HTTP routes, relational capability persistence, investigation evidence snapshot,
  and hypothesis-judgment prompt assembly the payload_notes attribute must cross.
sources:
- work/capability-payload-notes/intake/scope.md
area:
- src/src/capability-registry/
- src/src/http/
- src/src/persistence/relational-capability-store.repository.ts
- src/src/investigation/
- src/migrations/
modules:
- name: capability-registry
  path: src/src/capability-registry
  role: touched
- name: capability-registry-service
  path: src/src/capability-registry/capability-registry.service.ts
  role: touched
- name: capability-registry-factory
  path: src/src/factories/capability-registry.factory.ts
  role: adjacent
- name: register-capability-http
  path: src/src/http/register-capability.controller.ts
  role: touched
- name: register-capability-dto
  path: src/src/http/dto/register-capability.dto.ts
  role: touched
- name: read-capability-by-identity-http
  path: src/src/http/read-capability-by-identity.controller.ts
  role: touched
- name: read-capability-by-identity-dto
  path: src/src/http/dto/read-capability-by-identity.dto.ts
  role: touched
- name: relational-capability-store
  path: src/src/persistence/relational-capability-store.repository.ts
  role: touched
- name: evidence-model
  path: src/src/investigation/evidence.ts
  role: touched
- name: evidence-collection-stage
  path: src/src/investigation/evidence-collection-stage.ts
  role: touched
- name: evidence-dto
  path: src/src/http/dto/evidence.dto.ts
  role: touched
- name: hypothesis-evaluator-port
  path: src/src/investigation/hypothesis-evaluator.port.ts
  role: touched
- name: judgment-stage
  path: src/src/investigation/judgment-stage.ts
  role: touched
- name: anthropic-hypothesis-evaluator-adapter
  path: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  role: touched
- name: fake-hypothesis-evaluator-adapter
  path: src/src/investigation/fake-hypothesis-evaluator.adapter.ts
  role: depends-on
- name: relational-investigation-store
  path: src/src/persistence/relational-investigation-store.repository.ts
  role: touched
- name: capability-store-migrations
  path: src/migrations
  role: touched
must_not_duplicate:
- what: The empty-string honest-snapshot convention for an optional string attribute
    captured once at collection time and never reread, established for concept_description
    in evidence-collection-stage.ts's resolvedBaseOf()/evidenceOf() and mirrored by
    migrations' DEFAULT '' TEXT NOT NULL columns.
  at: src/src/investigation/evidence-collection-stage.ts
- what: The additive-migration-after-a-shipped-table convention (never editing a migration
    already applied; a new ALTER TABLE script instead) already used to add capabilities.concept
    after capabilities shipped without it.
  at: src/migrations/0007-capability-concept.sql
- what: The omit-the-tag-when-empty rendering convention for an optional concept-level
    string reaching the judgment prompt, in conceptDescriptionLines().
  at: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- what: 'The zod .optional() / TypeScript ?: pairing already used for every currently-optional
    Capability registration field, and for Evidence''s own result_detail.'
  at: src/src/http/dto/register-capability.dto.ts
risks:
- risk: heldCapability() builds the returned Capability as an explicit field-by-field
    object literal; a new payload_notes attribute added to the Capability type but
    not named in this literal compiles yet is silently dropped from every registered
    capability.
  consumers:
  - src/src/capability-registry/capability-registry.service.ts
  - src/src/http/register-capability.controller.ts
- risk: relational-capability-store.repository.ts enumerates Capability's attributes
    three separate times (ICapabilityRow, toCapability(), upsertStatementFor()'s SELECT/INSERT/ON
    CONFLICT lists); missing payload_notes in any one silently drops or never persists
    it.
  consumers:
  - src/src/persistence/relational-capability-store.repository.ts
- risk: createCapabilitiesReader() in the capability-registry factory destructures
    only connector/input_schema off each stored Capability; it would not itself break,
    but stands as an existing example of a partial-attribute consumer a reviewer could
    mistake for a place payload_notes also needs to appear.
  consumers:
  - src/src/factories/capability-registry.factory.ts
  - src/src/connector-registry/capabilities-reader.port.ts
- risk: read-capability-by-identity.dto.ts's response schema requires every Capability
    field with no optional attribute currently declared; presenting a registered capability
    without updating this schema to admit payload_notes as absent would either reject
    every response or silently validate it away.
  consumers:
  - src/src/http/read-capability-by-identity.controller.ts
  - src/src/http/dto/read-capability-by-identity.dto.ts
- risk: evidence.dto.ts's evidenceSchema and hypothesis-evaluator.port.ts's EvidenceItem
    both currently enumerate Evidence's/EvidenceItem's fields by name; a new required
    capability_payload_notes attribute on Evidence not added to both will make evidence
    fail HTTP validation or never reach the judgment call.
  consumers:
  - src/src/http/dto/evidence.dto.ts
  - src/src/investigation/hypothesis-evaluator.port.ts
  - src/src/investigation/judgment-stage.ts
- risk: anthropic-hypothesis-evaluator.adapter.ts's itemBlock()/evidenceBlock() assemble
    the judgment prompt from a fixed set of named EvidenceItem fields; capability_payload_notes
    will not reach the model's prompt unless a rendering function parallel to conceptDescriptionLines()
    is added and wired into itemBlock().
  consumers:
  - src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/src/investigation/fake-hypothesis-evaluator.adapter.ts
- risk: migrations/0003-capability-registry.sql and the investigation_evidence table
    (extended by migrations/0013) are both already-shipped, applied schemas; adding
    payload_notes/capability_payload_notes columns must follow the additive-only,
    never-edit-a-shipped-migration convention, including a DEFAULT for the required
    capability_payload_notes column so legacy rows remain readable.
  consumers:
  - src/migrations/0007-capability-concept.sql
  - src/migrations/0013-investigation-evidence-semantics-snapshot.sql
  - src/src/persistence/relational-capability-store.repository.ts
  - src/src/persistence/relational-investigation-store.repository.ts
---

## What it is

heldCapability() in capability-registry.service.ts builds a Capability strictly from REQUIRED_REGISTRATION_ATTRIBUTES plus an optional timeout defaulted with ?? — an optional attribute already has a live precedent in the same function, though timeout is numeric with a code default rather than a nullable persisted string.
register-capability.dto.ts's registerCapabilityBodySchema uses zod .optional() on individual fields, and RegisterCapabilityRegistration in capability.ts marks every field optional (?:) at the type level, matching the DTO's own shape before refuseContractDepartures narrows it.
relational-capability-store.repository.ts's ICapabilityRow, toCapability() and upsertStatementFor() enumerate every Capability attribute by name across SELECT, object literal and INSERT/ON CONFLICT params — a fixed, hand-kept list rather than a generated mapping.
migrations/0003-capability-registry.sql created the capabilities table with every column NOT NULL, and migrations/0007-capability-concept.sql later added concept as its own additive ALTER TABLE — a required column added after the fact, with a comment recording that a migration already applied is never edited.
migrations/0012-glossary-concept-description.sql and migrations/0013-investigation-evidence-semantics-snapshot.sql both add a TEXT NOT NULL DEFAULT '' column, sanctioning the empty string, never SQL NULL, as the honest-empty reading for a string attribute a legacy row never held.
evidence-collection-stage.ts's resolvedBaseOf()/evidenceOf() snapshot concept_description from the glossary once, at collection time, onto every Evidence item, in the same call that resolves fields and origin/capability_name/capability_version.
evidence.ts declares concept_description as a required string (not optional) even though it can be the empty string, and separately declares result_detail as a genuinely optional (?:) attribute — two different shapes for "may be absent" already exist in the same type.
evidence.dto.ts's evidenceSchema marks result_detail .optional() but concept_description a bare z.string() (never absent, only possibly empty) — the DTO mirrors the domain type's own choice for concept_description.
judgment-stage.ts's toEvidenceItems() and hypothesis-evaluator.port.ts's EvidenceItem both carry concept_description straight through from Evidence into the judgment call, unchanged.
anthropic-hypothesis-evaluator.adapter.ts's conceptDescriptionLines() omits the concept_description tag entirely when the value is the empty string, rather than emitting an empty tag — the established pattern for presenting an honest-empty snapshot to the judgment prompt.
read-capability-by-identity.dto.ts's readCapabilityByIdentityResponseSchema requires every Capability attribute with .min(1)/no .optional(), mirroring capability.ts's fully-required Capability type — none of its fields currently admits absence.
capability-registry.factory.ts, at src/src/factories/ rather than under capability-registry/, wires RelationalCapabilityStore into CapabilityRegistryService and also exposes createCapabilitiesReader(), which destructures only connector and input_schema off each stored Capability for the connector-placeholder check.

## Notes

The scope named src/src/capability-registry/capability-registry.factory.ts, but no such file exists there; the actual factory lives at src/src/factories/capability-registry.factory.ts.
Because payload_notes is declared optional, unlike concept_description which is required-but-possibly-empty, the closest existing precedent for its Evidence-side counterpart (capability_payload_notes, required per the scope) is still concept_description's own snapshot-once, never-reread pattern; the Capability-side optionality itself has no matching prior optional-attribute-with-persistence example in this module.
capability-store.port.ts and capability-input-schema-shape.ts exist under src/src/capability-registry/ but were not read in depth, since neither declares or reads Capability's own attribute list.

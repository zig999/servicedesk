# Scope

Add DELETE routes for ConnectorConfiguration, Capability and Concept to the backend HTTP surface
(`src/`), implementing the operations and refusal rules `/analyse` just added to the specification:

- `remove-connector`, on `contracts/integration/connector-configuration-registry` and
  `domain/integration/connector-configuration-registry` — governed by
  `rules/integration/removing-a-connector-configuration-is-unconditional`: removal succeeds
  unconditionally, whether or not any capability currently names the connector.
- `remove-capability`, on `contracts/integration/capability-registry` and
  `domain/integration/capability-registry` — governed by
  `rules/integration/a-registered-capability-cited-by-evidence-is-never-removed`: removal succeeds
  unless some collected evidence item names that capability by name and version.
- `remove-concept`, on `contracts/glossary/glossary-authoring` — governed by the (now broadened)
  `rules/glossary/a-registered-concept-is-never-removed`: removal succeeds unless a registered
  capability answers the concept, a collected evidence item or its citation names it, or any
  hypothesis-revision's own collects lists it (manifested in a case version or not).

Each follows the same shape the existing `discard` (case version) and `remove-hypothesis` routes
already establish in this codebase: an HTTP `DELETE`, `204` on success, a named domain error on
refusal mapped through `status-map.ts`, and route/controller/DTO/operation files mirroring
`discard.*` / `remove-hypothesis.*`'s own separation.

Full analysis, including the schema-level evidence (foreign keys, or their absence) each condition
is grounded in, is at
`temp/2026-09-21-delete-routes-connector-capability-concept-proposal.md` (git history of the main
worktree, copied here for this plan). See also
`temp/relacao-case-hypothesis-concept-capability-connector.md` for the fuller domain map these
three entities sit in.

Target: backend (`src/`) only. No frontend surface (button, confirmation dialog) is in scope here —
that is a later, surface-only decision once these routes exist.

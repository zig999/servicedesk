Corrective increment (bug found by running the delivered system, not a task's criteria).

Wrong behavior observed: PUT /v1/glossary/concepts/:name (register-concept) fails with a generic
500 INTERNAL_ERROR whenever any existing concept is referenced elsewhere (by
capabilities.concept, investigation_evidence.concept, or
investigation_evaluation_citations.concept), even when that referenced concept is unrelated to
the one being created or updated.

Root cause: GlossaryService.registerConcept (src/src/glossary/glossary.service.ts) reads the
full held concept set, filters out the one being replaced, and writes the whole resulting set
back through RelationalGlossaryStore.writeConcepts
(src/src/persistence/relational-glossary-store.repository.ts:188-199), which unconditionally
runs DELETE FROM concept_accepts and DELETE FROM concepts for the entire table before
reinserting everything. Any row in capabilities/investigation_evidence/
investigation_evaluation_citations that foreign-keys to an existing concepts.name (with no ON
DELETE CASCADE) blocks that table-wide DELETE, which Postgres reports as a constraint
violation. That error is wrapped as GlossaryStoreError, which is unmapped in status-map.ts, so
it falls through to the generic 500.

This is the same bug already fixed once for capabilities via
task/capability-registry-write-upsert-hotfix
(delivery/capability-registry-write-upsert-hotfix/implementation/capability-registry-write-upsert-hotfix/scope-write-to-identity.md):
writeCapabilities was changed from a table-wide delete-and-reinsert into a per-identity upsert
(INSERT ... ON CONFLICT (name, version) DO UPDATE SET ...) that never deletes a row the given
batch does not name. That fix never touched the service layer
(CapabilityRegistryService.registerCapability still reads-all/filters/passes-the-whole-array),
only the store repository and its port docstring.

Corrective fix to cut as this task: apply the same upsert-by-identity shape to
RelationalGlossaryStore.writeConcepts, adapted for the glossary's two-table shape:

- concepts: per given concept, INSERT INTO concepts (name, ttl, description) VALUES (...) ON
  CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description — no
  table-wide DELETE FROM concepts.
- concept_accepts (child rows-per-parent list, unlike capabilities which has no child table):
  scope the reconciliation to the one concept being written — DELETE FROM concept_accepts WHERE
  concept_name = $1 for each given concept's own name, then reinsert that concept's given
  accepts rows — never a table-wide DELETE FROM concept_accepts.
- Keep the whole write inside one transaction (existing runInTransaction), preserving
  all-or-nothing per call.
- Update writeConcepts' docstring on the port (src/src/glossary/glossary-store.port.ts) and the
  repository method to state the corrected upsert-by-identity, never-deletes-what-it-doesn't-name
  semantics, mirroring capability-store.port.ts's current writeCapabilities docstring.
- GlossaryService.registerConcept is unchanged — it keeps passing the full kept+new array; the
  new upsert makes that safe.
- Out of scope: RelationalConnectorConfigurationStore.writeConnectorConfigurations has the same
  table-wide-DELETE bug (relational-connector-configuration-store.repository.ts:79) but is a
  separate, not-yet-cut corrective task — do not touch it here.

State this as a single corrective task, no survey, no decomposition, bound to the
glossary/concept specification nodes the way the capability hotfix task was bound to the
capability ones.

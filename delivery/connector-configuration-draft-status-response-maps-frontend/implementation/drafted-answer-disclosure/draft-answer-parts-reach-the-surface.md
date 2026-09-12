---
target: frontend
title: The grown draft answer reaches the surface whole
summary: use-draft-connector-configuration-from-openapi.ts's ConnectorConfigurationDraft type and its
  pickConnectorConfigurationDraftFields allow-list now admit status_readings, response_fields and reading_notes
  whole, instead of silently dropping them.
task: sha256:cad606032fcb4e07c22b7d40cc644ec5e59611380e02d36d2fb4a310c0c8b0d7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-draft-answer-parts-reach-the-surface-build-2
files:
- path: src/hooks/use-draft-connector-configuration-from-openapi.ts
  effect: Declares ConnectorConfigurationDraftStatusReading, ConnectorConfigurationDraftResponseField,
    ConnectorConfigurationDraftReadingNoteKind and ConnectorConfigurationDraftReadingNote; grows ConnectorConfigurationDraft
    with status_readings, response_fields and reading_notes; and grows pickConnectorConfigurationDraftFields
    to destructure and re-emit all three new arrays in both of its branches, so a drafted answer's status
    readings, response fields and reading notes survive the frontend's reading of it instead of being
    stripped by the allow-list.
- path: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  effect: 'Widened two pre-existing draft fixtures (FULL_DRAFT, DRAFT_WITHOUT_METHOD_MISMATCH) to also
    declare status_readings: [], response_fields: [] and reading_notes: [], since ConnectorConfigurationDraft
    now requires them; no assertion changed.'
- path: src/routes/connector-configuration-helper-fields-apply.spec.ts
  effect: Widened the pre-existing BASE_DRAFT fixture the same way; no assertion changed.
- path: src/routes/connector-configuration-helper-fields.spec.ts
  effect: Widened the pre-existing BASE_DRAFT fixture the same way; no assertion changed.
- path: src/services/connector-configuration-draft-disclosure.spec.ts
  effect: Widened the pre-existing BASE_DRAFT fixture the same way; no assertion changed.
criteria:
- criterion: A draft answer carrying status readings yields, on the frontend's reading of it, each status
    reading with its status, its ending and, where the answer carried it, what the document declared that
    status as.
  met: true
  how: ConnectorConfigurationDraftStatusReading declares status (required), ending (required) and declared_as
    (optional); status_readings is destructured and re-emitted unchanged by pickConnectorConfigurationDraftFields
    in both its branches.
- criterion: A draft answer carrying response fields yields each response field with its name, its path
    and its status, and with its declared type, its declared required listing and its envelope where the
    answer carried them.
  met: true
  how: ConnectorConfigurationDraftResponseField declares name, path and status as required and declared_type,
    declared_required and envelope as optional; response_fields is destructured and re-emitted unchanged
    by pickConnectorConfigurationDraftFields in both its branches.
- criterion: A draft answer carrying reading notes yields each reading note with its kind and its subject,
    and with its detail where the answer carried one.
  met: true
  how: ConnectorConfigurationDraftReadingNote declares kind and subject as required and detail as optional;
    reading_notes is destructured and re-emitted unchanged by pickConnectorConfigurationDraftFields in
    both its branches.
- criterion: The frontend's reading admits each of the nine kinds the draft's reading-note vocabulary
    holds and no kind outside it.
  met: true
  how: ConnectorConfigurationDraftReadingNoteKind is a closed nine-member string-literal union copied
    one-for-one from domain/integration/connector-configuration-draft-reading-note-kind's values.
- criterion: The frontend's reading of a draft answer admits one field per attribute the draft element
    declares and no capability name, version or count.
  met: true
  how: ConnectorConfigurationDraft now holds exactly one field per attribute domain/integration/connector-configuration-draft
    declares, and nothing naming, versioning or counting a capability; the node's own capability reference
    is not a field of the drafted answer at all.
- criterion: No module of the frontend issues a request to the OpenAPI document link the operator named;
    the draft and the operations listing are read only through the backend operations that fetch it.
  met: true
  how: The file's only network call remains apiFetch against the backend draft-connector-configuration-from-openapi
    operation; this task added no fetch and touched no other module.
nodes:
- node: contracts/integration/connector-configuration-draft
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: The frontend's ConnectorConfigurationDraft type is the shape the frontend reads the published draft-connector-configuration-from-openapi
    operation's answer into; it now mirrors that answer's full shape rather than a subset of it.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: ConnectorConfigurationDraft carries one field per attribute this element declares, on the same
    presence terms; pickConnectorConfigurationDraftFields admits every one of them through to the caller
    instead of stripping the three new ones.
- node: domain/integration/connector-configuration-draft-status-reading
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: ConnectorConfigurationDraftStatusReading declares status and ending as required and declared_as
    as optional, matching the element's attributes and presence terms.
- node: domain/integration/connector-configuration-draft-response-field
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: ConnectorConfigurationDraftResponseField declares name, path and status as required and declared_type,
    declared_required and envelope as optional, matching the element's attributes and presence terms.
- node: domain/integration/connector-configuration-draft-reading-note
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: ConnectorConfigurationDraftReadingNote declares kind and subject as required and detail as optional,
    matching the element's attributes and presence terms.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: ConnectorConfigurationDraftReadingNoteKind is the closed nine-value string-literal union this enumeration
    declares, copied value for value.
- node: rules/integration/a-connector-configuration-draft-response-carries-no-capability
  how: Honored rather than encoded -- this task adds no field to ConnectorConfigurationDraft naming, versioning
    or counting a capability. The rule's clause about how a generation-time capability read becomes an
    unresolved reason is the backend's, outside this task's reach.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  how: Honored, not newly encoded -- the file's one network call is unchanged, still made against the
    backend operation rather than against the operator-named OpenAPI document link.
inferences:
- inferred: A status reading's ending is typed as an unconstrained string rather than as the domain/investigation/evidence-result
    enumeration its node names.
  from: The task's own Notes (UNDERDETERMINED, resolved as "Decision, beyond the covers -- stand"), which
    found evidence-result unreachable from this task's candidates and settled that an unconstrained string
    satisfies criterion 1 as written.
- inferred: declared_as, declared_type, declared_required, envelope and detail are optional (TypeScript
    ?) fields rather than required ones.
  from: 'Each attribute''s own node leaves it without required: true in its frontmatter, the same presence
    convention the existing method_mismatch field already follows in this file.'
preserved:
- The existing connector, configuration, unresolved and generated_credentials fields and their shapes,
  unchanged.
- The existing method_mismatch optional field and the branch in pickConnectorConfigurationDraftFields
  that includes it only when present, unchanged.
- The mutation's single network call to the backend's /v1/draft-connector-configuration-from-openapi endpoint,
  with no new request added anywhere in the file.
- connector-configuration-draft-disclosure.ts's draftDisclosureFrom, which takes a whole ConnectorConfigurationDraft
  parameter rather than constructing one, and keeps compiling unchanged against the grown type.
deferred:
- what: The surfaces that state the three new parts (status readings, response fields, reading notes)
    to the operator are not built here.
  why: This task grows the type and its allow-list only, per its objective and the sibling-task split
    the rationale states; stating those parts to the operator is each sibling task's own.
---

## What it is
The frontend type of a connector configuration draft and the allow-list that filters the answer into it, both grown to admit the answer's three new parts.
It is the one place those parts are currently discarded before any surface could state them.

## Notes
Build round 1 failed typecheck -- five pre-existing draft fixtures across four test files were missing the three new required fields; fixed by mechanically widening each with empty arrays, no assertion changed. Build round 2 green.

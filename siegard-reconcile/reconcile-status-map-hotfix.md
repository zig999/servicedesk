---
contract_version: siegard-reconcile/1
title: status-map.ts rebind after the revise-hypothesis-status-map-hotfix corrective delivery
summary: The corrective task map-status-for-typed-refusals added four new entries to STATUS_BY_ERROR_CLASS
  and extended the header comment's specification-fixed-status count and citations from seven to eleven;
  that delivery's own bind restamped only the four nodes it implements, leaving the eleven pre-existing
  bindings on this same file stale.
target: backend
files:
- path: src/errors/status-map.ts
  change: STATUS_BY_ERROR_CLASS gained four entries (CaseHoldsNoDraftError, ConceptNotInGlossaryError,
    HypothesisRevisionCollectsNoConceptError, ConceptRefusesSubjectTypeError) and the header comment's
    running count and citation list grew accordingly; every other entry, citation and behavior is unchanged.
nodes:
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: header lines 6-8 and STATUS_BY_ERROR_CLASS still cite CapabilityIdentityNotFoundError's HTTP 404
    for this node, unchanged by the delivery.
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: the file states no fact of this contract beyond the class-to-status map itself; nothing here restates
    or contradicts its own facts (its three operations, paging, replace-on-register).
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: same scope limit as above; the file never restates that diagnose is synchronous, runs fresh each
    call, or treats the ticket reference as correlation only.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: header lines 19-24 and STATUS_BY_ERROR_CLASS still cite MalformedCapabilityInputSchemaError's HTTP
    422 for this node, unchanged.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: 'This rule fixes IncompleteConnectorConfigurationError''s HTTP 422 a second way -- for a configuration
    that is entirely absent or is present but neither a string nor a plain object -- but the file''s header
    closes with "while every other entry''s status stays this project''s own engineering decision, not
    a fact the specification holds", and never credits this second clause anywhere in the file: only the
    first clause (ConnectorConfigurationNotWellFormedError) is cited (header lines 11-14, body lines 108-109).
    A reader has no way to learn from this file that the same status is also fixed by that clause of the
    rule.'
  observed_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: false
  how: the file's body (lines 111-113) correctly cites this node for IncompleteConnectorConfigurationError's
    HTTP 422 ("one whose connector name is absent or an empty string (IncompleteConnectorConfigurationError,
    rules/integration/a-connector-configuration-names-its-connector)"), but the header's own "eleven specification
    nodes" list (lines 56-58) stops short of this row and its closing clause -- "while every other entry's
    status stays this project's own engineering decision, not a fact the specification holds or should
    hold" -- directly contradicts that citation two paragraphs later. The file disagrees with itself about
    whether this node governs the entry.
  observed_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: header lines 9-10 and STATUS_BY_ERROR_CLASS still cite ConnectorConfigurationNotFoundError's HTTP
    404 for this node, unchanged.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: header lines 31-38 and STATUS_BY_ERROR_CLASS still cite ConnectorPlaceholderOutsideInputSchemaError's
    HTTP 422 for this node, unchanged.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: header lines 25-30, body lines 114-117 and STATUS_BY_ERROR_CLASS still cite SubjectDoesNotCoverCaseInputsError's
    HTTP 422 for this node, unchanged.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: header lines 15-19 and STATUS_BY_ERROR_CLASS still cite HypothesisNotInManifestError's HTTP 404
    for this node, unchanged.
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: the file cites only the rule this scenario exemplifies (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes)
    and its owning task at body lines 114-117; it restates nothing of the scenario's own outcome differently.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: header comment lines 51-55 and map entry [ConceptRefusesSubjectTypeError, 422] (line 216) still cite
    this node's own refusal wording for a concept that does not accept the case version's declared subject
    type, exactly as the rule states it.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: header comment lines 47-50 and map entry [HypothesisRevisionCollectsNoConceptError, 422] (line 215)
    still cite this node's own refusal wording for a revision that would collect none, exactly as the rule
    states it; corroborated by this same fact's own decision-log entry.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: header comment lines 39-43 and map entry [CaseHoldsNoDraftError, 409] (line 204) still cite this
    node's own refusal wording for a revision requested while the case holds no draft version, exactly
    as the rule states it.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: header comment lines 43-46 and map entry [ConceptNotInGlossaryError, 404] (line 196) still cite this
    node's own refusal wording for a hypothesis-revision naming a concept the glossary does not hold, exactly
    as the rule states it.
  encoded_at:
  - src/errors/status-map.ts
notes: Two delegations ran over this one file. The first read the file's 11 pre-existing bindings, fresh,
  independent of the corrective delivery's own 4 nodes; the second, a completeness check, read those 4
  nodes the same delivery's own /implement-task run bound moments before this reconciliation, confirming
  no drift and no misattribution against decision-log.md. Two findings surfaced from the first delegation
  are pre-existing, internal to the file's own prose -- the delivery under reconciliation only appended
  new entries and revised the running count; it did not touch the header's 'eleven specification nodes'
  list or its closing clause, nor the body's own citation of rules/integration/a-connector-configuration-names-its-connector.
  Both findings are about the file's comments describing its own STATUS_BY_ERROR_CLASS table, not about
  the runtime behavior the table encodes -- no HTTP status the table actually returns is in question.
---

---
contract_version: siegard-reconcile/1
title: Trace drift left by delivering derive-subject-fields-from-input-requirements and present-each-requirement-with-its-required-standing
summary: 'Both tasks (case-simulation-input-requirements initiative, delivered and committed as eaffca8)
  rewrote these three files to compose useCaseInputRequirements/useCapabilities instead of scanning connector-configuration
  text for ${subject:<name>} placeholders. The rewrite is asserted correct as delivered -- both tasks''
  own proof records passed the full suite (149/149 files, 1026/1026 tests) -- and each delivering task''s
  own implementation record already re-bound the nodes it encodes. This reconciliation covers only the
  bindings that rewrite left stale: nodes bound to these three files before the rewrite, which the delivering
  tasks'' own binds never touched because a bind restamps only the delivering task''s own nodes.'
target: frontend
files:
- path: src/hooks/use-simulation-subject.ts
  change: no longer composes useConnectorConfigurations at all; composes useCaseInputRequirements(slug,
    version) and useCapabilities() instead, deriving requiredFields via the sibling derivation module's
    deriveSubjectFields rather than a connector-placeholder scan.
- path: src/services/simulation-subject-derivation.ts
  change: deriveRequiredFields and collectionPlanFromManifest (the manifest -> collection-plan -> connector-configuration
    placeholder walk) are removed entirely, replaced by deriveSubjectFields, a one-to-one map from an
    already-derived case-input-requirements read to editable fields; subjectPlaceholderNamesInConfiguration
    is kept byte-for-byte for its one remaining caller, use-test-connector-panel.ts.
- path: src/routes/case-simulation-subject-panel.tsx
  change: the requirement-rendering block now reads an array-of-capabilities shape (one input per case-input-requirement,
    its required flag, every resolvable asking capability's own identity) instead of a singular connector/capability/inputSchemaHint
    shape; the subject-type Select, subject-attribute glossary reads and requester Input were not touched.
nodes:
- node: contracts/integration/capability-registry
  conforms: false
  how: 'use-simulation-subject.ts only composes useCapabilities() and hands the plain `capabilities` array
    straight to deriveSubjectFields -- none of read-capability, read-capability-by-identity, list-capabilities
    or register-capability is named, and no paging of the listing is visible in this file. The contract''s
    own surface is stated in use-capabilities.ts, a file this reconciliation does not cover. Handed back
    rather than settled: either the node should bind to use-capabilities.ts and drop from this file (an
    encoding), or this file''s binding was always meant as a consumer link rather than an encoding, a
    distinction the trace does not express.'
  observed_at:
  - src/hooks/use-simulation-subject.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the file''s own header states the removal deliberately -- "no longer composes useConnectorConfigurations
    at all, since nothing this hook derives from here on reads a connector configuration''s own text"
    -- and no read, list, page or registration of a connector configuration appears anywhere in it. decision-log.md
    settles the succession: at rules/investigation/a-composed-subject-presents-every-case-input-requirement''s
    `statement` field, the log records the decision that the interface presents inputs "drawn only from
    that authoritative set" against the rejected alternative of scanning a connector''s own call-assembly
    text -- the fact this file used to hold for this node moved to the case-input-requirements read, which
    is already bound elsewhere. This binding should be dropped rather than rebound: the file holds no
    fact of this registry''s surface for a digest to restamp over.'
  observed_at:
  - src/hooks/use-simulation-subject.ts
- node: domain/investigation/subject
  conforms: true
  how: 'use-simulation-subject.ts: `type SimulationSubject = { readonly type: string; readonly attributes:
    readonly SubjectAttributeValue[]; }`, constructed as `{ type: source.subject, attributes: mergedAttributes(requiredFields,
    addedAttributes) }` with no per-concept filtering. case-simulation-subject-panel.tsx: the Type field
    is read from `state.subject.type` with no setter (`onChange={doNotChangeSubjectType}`), and the whole
    assembled subject is serialized unfiltered via `JSON.stringify(state.subject, null, 2)`. Both files
    state the node''s shape and filter nothing out of it.'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'use-simulation-subject.ts: `mergedAttributes` returns `[...attributeMap.entries()].map(([attribute,
    value]) => ({ attribute, value }))`, one name paired with one non-empty value. case-simulation-subject-panel.tsx:
    the curator''s added-attribute row pairs a Select-drawn `row.attribute` with an `Input`-typed `row.value`
    as one row keyed by `row.id`. Both files carry the node''s one-name/one-value pairing.'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/knowledge/case-version
  conforms: false
  how: 'Read by two delegations with opposite answers, folded to the negative since the node is not cleared
    everywhere it is bound. use-simulation-subject.ts: cleared -- `SimulationSubjectSource = { readonly
    subject: string }` plus `slug`/`version` threaded into `useCaseInputRequirements(slug, version)` is
    judged a deliberately narrowed read that contradicts nothing the node states (the node''s `manifest`
    and `collection-plan` attributes are simply not read here). simulation-subject-derivation.ts: NOT
    cleared -- the node''s own fact (the manifest and the collection plan as "the deduplicated union of
    every manifested revision''s collects") is stated nowhere in this file''s current text; what remains
    is a one-to-one map from an already-derived case-input-requirements read to fields, naming no manifest
    and no union. The trace still binds this file to case-version, pointing a reader at a file that answers
    to it in no line.'
  observed_at:
  - src/hooks/use-simulation-subject.ts
  - src/services/simulation-subject-derivation.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: '`isReady` reads `... && subject.attributes.length > 0`, with the line above it citing the node
    by identity: "never true for a subject holding zero attribute-values -- even where the derivation
    names no field at all (rules/investigation/a-subject-carries-at-least-one-attribute)".'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: 'subjectPlaceholderNamesInConfiguration''s own parameter and parse/plain-object guard read the
    node''s `configuration` attribute as JSON object text: `JSON.parse(configurationText)` guarded by
    `isPlainRecord(parsed)`, unchanged from before this task''s rewrite.'
  encoded_at:
  - src/services/simulation-subject-derivation.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: subjectAttributeNameOf, subjectPlaceholderNamesInStringRecord and subjectPlaceholderNamesInValue
    walk the configuration's address, query, headers and body for `${subject:<name>}` tokens exactly as
    before; this is the retained placeholder-scan function, kept byte-for-byte in behavior for its one
    remaining caller (use-test-connector-panel.ts, outside this file set).
  encoded_at:
  - src/services/simulation-subject-derivation.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: the curator's own attribute-add row reads `useGlossaryVocabularyOptions("subject-attribute")` and
    offers it through a Select bound to `subjectAttributeOptions`, naming no member of the vocabulary
    itself -- the node's own fact that attribute names are a discovered glossary vocabulary, never a designed
    list, is honored.
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: the Type control reads `useGlossaryVocabularyOptions("subject-type")` and presents `subjectTypeOptions`
    through a Select bound to `state.subject.type`, naming no subject-type member in this file.
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: false
  how: 'Read by two delegations with opposite answers, folded to the negative. case-simulation-subject-panel.tsx:
    cleared -- the curator''s own "add attribute" row uses a Select bound to `useGlossaryVocabularyOptions("subject-attribute")`,
    with no free-text path to an attribute name in this file, per the file''s own header comment citing
    this rule by identity. use-simulation-subject.ts: NOT cleared -- `mergedAttributes`'' curator-row
    loop admits `row.attribute.trim()` into the assembled subject on the strength of being non-empty alone
    (`if (attribute !== "" && row.value.trim() !== "") attributeMap.set(attribute, row.value)`), with
    no check against the glossary vocabulary at the one place the subject is actually assembled. The rule
    declares `consistency: eventual`, so this is not a plain contradiction, but nothing in this file names
    where the eventual check happens, so a reader cannot tell whether it is placed elsewhere deliberately
    or omitted.'
  observed_at:
  - src/routes/case-simulation-subject-panel.tsx
  - src/hooks/use-simulation-subject.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'already re-bound by this file''s own delivering task (derive-subject-fields-from-input-requirements),
    restated here only because this reconciliation''s file set includes the same file: useSimulationSubject
    consumes the already-delivered useCaseInputRequirements(slug, version) hook''s own `requirements`
    field as its whole authoritative source.'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: domain/knowledge/case-input-requirement
  conforms: true
  how: 'already re-bound by the two delivering tasks of this same initiative, restated here only because
    this reconciliation''s file set includes the same files. use-simulation-subject.ts and simulation-subject-derivation.ts:
    DerivedSubjectField mirrors this node''s own shape exactly (attribute, required, and every asking
    capability), resolved to registered Capability entries by identity alone. case-simulation-subject-panel.tsx:
    the node''s own shape -- one subject attribute, its required flag, and every currently-registered
    capability asking for it -- is what the panel renders per requirement, read as data the sibling derivation
    task already computed.'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/services/simulation-subject-derivation.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/integration/capability
  conforms: true
  how: 'already re-bound by the two delivering tasks of this same initiative, restated here only because
    this reconciliation''s file set includes the same files. simulation-subject-derivation.ts: resolvedCapabilitiesFor
    reads a matched capability''s own connector and input_schema fields, verbatim and unparsed, and none
    of its other declared fields. case-simulation-subject-panel.tsx: a capability''s own name, version
    and connector are displayed exactly as the resolved capability entries carry them, restating none
    of them as a fact this component asserts.'
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  conforms: true
  how: 'already re-bound by the two delivering tasks of this same initiative, restated here only because
    this reconciliation''s file set includes the same files. use-simulation-subject.ts and simulation-subject-derivation.ts:
    one field per requirement, required and optional alike, each carrying its own required flag unchanged
    and naming every currently-registered asking capability this derivation finds. case-simulation-subject-panel.tsx:
    one input per requirement, the required flag shown as a real marking, every asking capability named
    by its own name/version/connector, and the explicit empty-state disclosure in the rule''s own wording.'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/services/simulation-subject-derivation.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
  conforms: true
  how: 'already re-bound by this file''s own delivering task (derive-subject-fields-from-input-requirements),
    restated here only because this reconciliation''s file set includes the same files: because the field
    set now comes straight from the case-input-requirements read rather than from scanning any connector''s
    own call text, an attribute like this scenario''s own user_id -- required, but never literally embedded
    as a placeholder in any resolved connector''s own configuration -- is still presented as a required
    input.'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/services/simulation-subject-derivation.ts
notes: 'Judgment ran as three delegations, one per named file, per this skill''s own per-file discipline.
  Two further findings surfaced via a delegation''s own candidate-opening but are excluded from `nodes`
  above because the trace binds neither node to any file in this set at all (not a stale binding this
  reconciliation covers): (1) use-simulation-subject.ts''s `mergedAttributes` writes both its derived-field
  loop and its curator-row loop with `Map.set` (last-write-wins), while rules/investigation/a-subject-holds-one-value-per-attribute
  states the subject keeps the value recorded first, dropping a later one for the same attribute -- the
  file''s own comment calls this tie-break an uncovered inference, which is true of the task''s criteria
  and not of the specification, since the node already settles it and settles it the other way. (2) the
  same file''s curator-row loop is the one place a curator-typed attribute name reaches the assembled
  subject, and it is not held against the glossary vocabulary at all -- see the finding against rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  above, which folds the second half of the same observation into a node this reconciliation does cover.
  Both are disclosed to the human separately as real behavior findings for a corrective increment; neither
  is bound or unbound here.'
---

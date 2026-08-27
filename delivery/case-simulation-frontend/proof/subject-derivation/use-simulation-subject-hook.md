---
implementation: sha256:3ae47cb6d3a27a635597b8e5805ad726684636e7c902b2e3ea0e37e624c49a77
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-derivation-use-simulation-subject-hook-suite
title: use-simulation-subject hook proof
summary: Proves the pure derivation module and the composing hook against all seven criteria, the implementation's
  own recorded inferences, and MNT-04's stable-key convention, with the render-result-naming-convention
  lint failure in the criterion-7 test corrected by destructuring renderHook's own return.
tests:
- file: src/services/simulation-subject-derivation.spec.ts
  name: resolves a concept the collection plan names to the capability currently registered for it and
    that capability's own connector, annotating the derived field with both
  proves: For a version whose collection plan names one or more concepts, the hook resolves, for every
    concept, the capability currently registered to answer it and that capability's declared connector.
  fails_when: deriveRequiredFields stops resolving a concept to its registered capability or that capability's
    own connector, or the returned field no longer carries that connector/capability annotation.
- file: src/services/simulation-subject-derivation.spec.ts
  name: returns one required field per distinct attribute name even where the same placeholder is repeated
    across the address and the body of one connector's own configuration
  proves: For every resolved connector whose configuration embeds one or more ${subject:<attribute>} placeholders
    — in its address, query, headers or body — the hook returns one required field per distinct placeholder
    name.
  fails_when: the same placeholder repeated within one connector's own configuration produces more than
    one required field instead of being deduplicated.
- file: src/services/simulation-subject-derivation.spec.ts
  name: keeps the first connector/capability's own annotation for a placeholder two different connectors
    both name, in the collection plan's own declared precedence order, rather than the second, later-resolved
    one (this module's own inference over an untied criterion)
  proves: the implementation's own recorded inference that two connectors naming the same attribute resolve
    to the first asker in collection-plan precedence order, never a second entry.
  fails_when: the field returned for a shared attribute name carries the second, later-resolved connector/capability's
    annotation, or two entries are returned for the same name.
- file: src/services/simulation-subject-derivation.spec.ts
  name: contributes zero required fields for a concept with no capability currently registered to answer
    it (this module's own inference)
  proves: the implementation's own recorded inference that an unresolved concept-to-capability step contributes
    nothing, silently.
  fails_when: an unregistered concept throws, or a fabricated field is returned for it.
- file: src/services/simulation-subject-derivation.spec.ts
  name: contributes zero required fields for a capability whose own connector names no configuration currently
    registered (this module's own inference)
  proves: the implementation's own recorded inference that an unresolved connector-to-configuration step
    contributes nothing, silently.
  fails_when: a capability naming an unregistered connector throws, or a fabricated field is returned
    for it.
- file: src/services/simulation-subject-derivation.spec.ts
  name: reads a placeholder embedded in the connector's own declared address
  proves: the hook returns one required field per distinct placeholder name -- in its address (criterion
    2, address case)
  fails_when: subjectPlaceholderNamesInConfiguration stops scanning the address field for placeholders.
- file: src/services/simulation-subject-derivation.spec.ts
  name: reads a placeholder embedded in the connector's own declared query
  proves: criterion 2's query case.
  fails_when: the query object stops being scanned for placeholders.
- file: src/services/simulation-subject-derivation.spec.ts
  name: reads a placeholder embedded in the connector's own declared headers
  proves: criterion 2's headers case.
  fails_when: the headers object stops being scanned for placeholders.
- file: src/services/simulation-subject-derivation.spec.ts
  name: reads a placeholder embedded anywhere inside the connector's own declared body, including nested
    inside an array
  proves: criterion 2's body case, including recursive/nested shapes.
  fails_when: a placeholder nested inside an array or object within the body is no longer found.
- file: src/services/simulation-subject-derivation.spec.ts
  name: recognizes and skips a requester or credential placeholder rather than reading it as a subject
    attribute
  proves: rules/integration/an-http-connector-configuration-declares-its-call's placeholder-kind discrimination,
    and that criterion 2 counts only subject placeholders.
  fails_when: a ${requester} or ${credential:...} token is misread as a subject attribute name.
- file: src/services/simulation-subject-derivation.spec.ts
  name: contributes no name for a token missing the ':<argument>' the subject kind requires, or carrying
    an empty one
  proves: the placeholder grammar's own malformed-token handling under rules/integration/an-http-connector-configuration-declares-its-call.
  fails_when: a bare ${subject} token or one with an empty argument yields an attribute name.
- file: src/services/simulation-subject-derivation.spec.ts
  name: contributes zero placeholder names for a connector configuration whose own registered text does
    not parse as a well-formed JSON object (this module's own inference)
  proves: the implementation's own recorded inference that malformed configuration text contributes nothing
    rather than throwing.
  fails_when: malformed JSON throws out of subjectPlaceholderNamesInConfiguration, or returns a non-empty
    result.
- file: src/services/simulation-subject-derivation.spec.ts
  name: passes the resolved capability's own input_schema through untouched, even where it is not itself
    valid JSON, rather than parsing or validating it
  proves: A required field's associated capability input_schema is carried through as a free-text hint,
    never parsed or validated as structured data.
  fails_when: input_schema is parsed, validated, or otherwise transformed rather than carried through
    byte-for-byte.
- file: src/services/simulation-subject-derivation.spec.ts
  name: returns the deduplicated union of every manifested entry's own collects, ordered by each entry's
    declared position rather than the array's own order
  proves: the implementation's own recorded inference for domain/knowledge/case-version's collection-plan
    operation.
  fails_when: collectionPlanFromManifest stops deduplicating, or orders by array position instead of each
    entry's own declared position.
- file: src/services/simulation-subject-derivation.spec.ts
  name: derives an empty plan, rather than throwing, for a version whose manifest has not been read back
    yet
  proves: collectionPlanFromManifest's handling of an absent manifest.
  fails_when: calling it with an undefined manifest throws instead of returning an empty plan.
- file: src/hooks/use-simulation-subject.spec.ts
  name: includes a curator-added attribute in the assembled subject, as one {attribute, value} pair beside
    the filled derived required field
  proves: The hook accepts curator-added attributes alongside the derived ones and represents every attribute
    — derived or added — as one attribute name paired with one value.
  fails_when: a curator-added attribute is missing from subject.attributes, or the derived field's own
    filled value is dropped once a curator row is added.
- file: src/hooks/use-simulation-subject.spec.ts
  name: lets a curator-added row sharing a derived field's own attribute name override that field's typed
    value, rather than the two coexisting as separate entries (this hook's own inference over an untied
    criterion)
  proves: the implementation's own recorded inference that a curator-added row overrides a derived field
    of the same name rather than coexisting or being dropped.
  fails_when: subject.attributes ends up with two entries for the same name, or the derived field's value
    wins instead of the curator row's.
- file: src/hooks/use-simulation-subject.spec.ts
  name: does not add an entry to the assembled subject for a curator-added row still holding an empty
    attribute name or an empty value
  proves: criterion 4's one attribute name paired with one value is never satisfied by an incomplete row.
  fails_when: a row whose attribute name is still empty, or whose value is still empty, appears in subject.attributes.
- file: src/hooks/use-simulation-subject.spec.ts
  name: stays not-ready while the requester is empty, even once every derived required field holds a value
  proves: The hook's reported readiness is false while the requester or any derived required field is
    empty.
  fails_when: isReady turns true while the requester is still empty.
- file: src/hooks/use-simulation-subject.spec.ts
  name: stays not-ready while a derived required field is empty, even once the requester holds a value
  proves: the same criterion's required-field half.
  fails_when: isReady turns true while a derived required field is still empty.
- file: src/hooks/use-simulation-subject.spec.ts
  name: turns ready once every derived required field and the requester hold a non-empty value
  proves: '...true only once every derived required field and the requester hold a non-empty value.'
  fails_when: isReady stays false once every required field and the requester are filled.
- file: src/hooks/use-simulation-subject.spec.ts
  name: never turns ready for a subject holding zero attribute-values, even once the requester is filled,
    for a version whose collection plan derives no required field and to which the curator has added none
    (rules/investigation/a-subject-carries-at-least-one-attribute)
  proves: The hook's reported readiness never turns true for a subject holding zero attribute-values.
  fails_when: isReady turns true for an empty subject once only the requester is filled.
- file: src/hooks/use-simulation-subject.spec.ts
  name: computes the same subject and the same readiness from two independently mounted instances given
    the same version, registries and typed values -- the single instance a screen shares between both
    dispatches has nothing of its own that could make the two diverge
  proves: The same derived subject and readiness are exposed identically whether the caller intends a
    full-case run or a single-hypothesis run — one subject, shared, per D7.
  fails_when: two independently mounted hook instances given the same version, registries and typed values
    compute a different subject or a different readiness from each other.
- file: src/hooks/use-simulation-subject.spec.ts
  name: stays true while either composed registry read is still loading, even once the other one has already
    resolved
  proves: the implementation's own recorded inference that isLoadingRegistries is the OR of both composed
    reads' own loading flags.
  fails_when: isLoadingRegistries turns false while one of the two composed registry reads is still pending.
- file: src/hooks/use-simulation-subject.spec.ts
  name: turns true when either composed registry read fails, without throwing out of the hook itself
  proves: the implementation's own recorded inference that isRegistriesError is the OR of both composed
    reads' own error flags, and that a failing read never throws out of the hook.
  fails_when: isRegistriesError stays false after a composed read fails, or the failure propagates as
    a thrown error out of the hook.
- file: src/hooks/use-simulation-subject.spec.ts
  name: keeps a remaining row's own id and typed values unchanged after an earlier row is removed
  proves: MNT-04's stable-key requirement for the curator-added row list.
  fails_when: removing an earlier row changes the remaining row's own id or reassigns its typed value
    to a different row.
not_applicable:
- edge_case: a stated numeric range boundary (a minimum or maximum count of required fields, attributes,
    or rows)
  why: no criterion or bound node of this task states a bounded range for any value the hook derives or
    the curator adds; there is nothing to test at a boundary that was never stated.
- edge_case: two concurrent operations against one curator-added row (e.g. two simultaneous edits racing)
  why: React's own act()-batched state updates make every operation sequential within a test's control,
    and no criterion or node states concurrent-edit behavior for this local, single-tab hook; the closest
    applicable case — two independent consumers of one subject — is exactly criterion 7's own scenario,
    and is tested.
untested:
- a curator-added row that holds a non-empty value but still holds an empty attribute name is not itself
  exercised — the existing empty-row test only exercises the reverse (attribute set, value still empty),
  so mergedAttributes's attribute !== "" && value !== "" guard is proved from one side rather than both.
- the inference that SimulationSubjectSource narrows a version's read to exactly {subject, manifest} rather
  than the whole CaseVersionRecord is a type-level design choice; no runtime test can observe it, since
  a caller supplying the wider shape is refused by the compiler rather than by any behavior these tests
  can trigger.
- the inference that useSimulationSubject takes a fully-resolved SimulationSubjectSource unconditionally
  (never | undefined), with no loading branch of its own for the version argument, is likewise a type-signature
  decision no runtime test can exercise — TypeScript itself refuses a caller passing undefined, so there
  is no behavior here to fail against.
- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary is honored by absence (the hook performs
  no glossary-membership check of its own, per the implementation record); no test demonstrates a name
  being accepted or refused on glossary grounds, because the delivery adds no such enforcement to observe.
---

## What it is

Twenty-six tests across three spec files, proving the derivation module's own concept-to-capability-to-connector-to-placeholder walk (address, query, headers, body, malformed input, unresolved steps, precedence tie-break), the hook's own attribute merging and readiness gating (including the empty-subject guard and the shared-instance identity across a full-case and single-hypothesis run), and the loading/error pass-through and stable-key conventions the implementation record disclosed as inferred rather than stated.

## Notes

The two lint findings this delivery's own build first surfaced (testing-library/render-result-naming-convention, on the criterion-7 test's two renderHook() results named `first`/`second`) were fixed by destructuring renderHook's own return into `firstResult`/`secondResult` throughout that describe block — no assertion or behavior changed.

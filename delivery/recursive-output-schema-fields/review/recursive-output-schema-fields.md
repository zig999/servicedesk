---
target: backend
title: Recursive output-schema field paths, review
summary: What four passes found over the four deliveries making field-semantics.ts read a capability output
  schema recursively and its three consumers stay correct.
reviewed:
- src/investigation/field-semantics.ts
- src/investigation/citation-validation.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/__tests__/unit/investigation/field-semantics.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
tasks:
- task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths
- task/recursive-output-schema-field-paths/judgment-prompt-carries-path-names
- task/recursive-output-schema-field-paths/nested-citation-is-accepted
- task/recursive-output-schema-field-paths/observation-load-stays-top-level
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run over the whole change passed clean, so there was no failure to diagnose
coverage:
- criterion: A key at the output schema own root properties object names a field by that key alone, with
    no leading dot.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: answers one entry per top-level property key the schema declares, in the order the schema states
      them
- criterion: A schema whose root properties declares installations, whose items is one object schema declaring
    state under its own properties, is read into a field named installations[].state.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: snapshots installations[].state, installations and login among the collected evidence item's
      own fields, and no field named state alone, for a capability whose output schema declares state
      beneath installations' own items (scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path)
- criterion: That same schema is also read into a field named installations, because the walk names every
    node it reaches and not only its leaves.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: names every node the walk reaches by its full dot- and bracket-concatenated path, carrying each
      one's own declared type and description, while walking no further beneath a tuple-shaped items,
      a patternProperties or an additionalProperties (rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema)
- criterion: That same schema is read into no field named state alone.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: snapshots installations[].state, installations and login among the collected evidence item's
      own fields, and no field named state alone, for a capability whose output schema declares state
      beneath installations' own items (scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path)
- criterion: A node the walk reaches whose schema states a type is read into a field carrying that type.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: carries only the type, with no description key at all, when the schema declares a type but no
      description
- criterion: A node the walk reaches whose schema states a description is read into a field carrying that
    description.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: carries only the description, with no type key at all, when the schema declares a description
      but no type
- criterion: A node the walk reaches whose schema states neither is read into a field carrying its name
    alone.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: carries neither type nor description for a key whose own declared value is an empty object
- criterion: An items declared as more than one schema is walked no further and names no field beneath
    it.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: names every node the walk reaches by its full dot- and bracket-concatenated path, carrying each
      one's own declared type and description, while walking no further beneath a tuple-shaped items,
      a patternProperties or an additionalProperties (rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema)
- criterion: A node's own patternProperties is not walked and names no field of its own, whatever content
    it declares.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: names every node the walk reaches by its full dot- and bracket-concatenated path, carrying each
      one's own declared type and description, while walking no further beneath a tuple-shaped items,
      a patternProperties or an additionalProperties (rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema)
- criterion: A node's own additionalProperties is not walked and names no field of its own, whatever content
    it declares.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: names every node the walk reaches by its full dot- and bracket-concatenated path, carrying each
      one's own declared type and description, while walking no further beneath a tuple-shaped items,
      a patternProperties or an additionalProperties (rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema)
- criterion: An output schema that is absent, does not parse, or holds no object named properties at its
    root is read into no fields at all.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: answers an empty array for an undefined output schema
- criterion: An evidence item collected for a capability whose output schema declares state beneath installations'
    items snapshots installations[].state among its own fields.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: snapshots installations[].state, installations and login among the collected evidence item's
      own fields, and no field named state alone, for a capability whose output schema declares state
      beneath installations' own items (scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path)
- criterion: The recursive reading reuses the existing JSON-guard helpers parseJsonOrUndefined and isPlainObject
    rather than declaring its own.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: imports parseJsonOrUndefined and isPlainObject from citation-validation.ts, per this task's
      own third criterion
- criterion: The module performing the reading imports no framework, driver or provider client.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: imports no framework, driver or provider-client package directly — every import specifier is
      a relative path, reaching its two JSON-guard helpers from the sibling domain module alone
- criterion: An evidence item snapshotting a field named installations[].state renders a field element
    whose declared name is exactly installations[].state.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders a path-shaped field name exactly as its own evidence item carries it, with no splitting
      or reinterpretation of the path syntax
- criterion: A rendered field carries the type its own snapshot carries, where the snapshot carries one.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders a field's own type attribute independently of its own description text — present for
      one without the other in either direction, and never coupling the two together
- criterion: A rendered field carries the description its own snapshot carries, where the snapshot carries
    one.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders a field's own type attribute independently of its own description text — present for
      one without the other in either direction, and never coupling the two together
- criterion: The prompt carries no output schema text and no other output-schema content beyond the field
    semantics the evidence item snapshotted.
  state: partial
  why: The only assertion bearing on this is a single expect(content).not.toContain('properties') at the
    tail of an unrelated field-rendering test, asserted incidentally; nothing puts a capability output
    schema anywhere the prompt builder could reach and then asserts its text is absent.
- criterion: Prompt assembly makes no read of the capability registry.
  state: partial
  why: The tests binding this (judgment-stage.spec.ts) exercise the module that hands evidence to the
    evaluator, not anthropic-hypothesis-evaluator.adapter.ts itself, which has no assertion in the set
    forbidding a capability-registry read during prompt assembly.
- criterion: A citation naming concept tech-profile and field installations[].state, where that item snapshot
    carries installations[].state, is accepted.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: accepts a citation naming concept tech-profile and field installations[].state, where that item
      snapshot carries installations[].state, exactly as the acceptance scenario states it
- criterion: A citation naming a field no cited evidence item snapshotted is refused, whatever shape that
    field name has.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a path-shaped field, installations[].partition, that its own cited
      evidence item's snapshot did not carry — a citation is refused for an unmatched name whatever shape
      that name has
- criterion: A citation naming a concept outside its hypothesis's collects is refused even where the field
    it names is path-shaped.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a concept outside the hypothesis's collects even where the field it
      names, installations[].state, is path-shaped and matches that foreign evidence item's own snapshotted
      fields
- criterion: Acceptance is decided against the cited item own snapshotted field names, with no read of
    the capability registry at judgment time.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: accepts a citation naming a concept in the hypothesis's collects and a field present among that
      same evidence item's own snapshotted fields
- criterion: A capability re-registered with a different output schema between collection and judgment
    does not change which field names a citation of the already-collected item may carry.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: accepts a citation naming a field the evidence item's own snapshot declared at collection, even
      though a capability now re-registered at that same name and version would declare a different set
      of fields entirely
- criterion: For a capability whose output schema declares installations with state beneath its items,
    an observation carries a field named installations where a responseMap key named installations resolves
    in the response body.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: keeps the ok observation to installations alone under a nested output schema — excluding installations[].state
      even though its own responseMap path resolves, a top-level property whose own path never resolves,
      and a top-level property no responseMap key names
- criterion: That same observation carries no field named installations[].state, whatever the responseMap
    declares.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: keeps the ok observation to installations alone under a nested output schema — excluding installations[].state
      even though its own responseMap path resolves, a top-level property whose own path never resolves,
      and a top-level property no responseMap key names
- criterion: A responseMap key naming no key of the output schema's own top-level properties object contributes
    nothing to the observation, and the call still ends ok.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: ends ok with an empty observation, refusing nothing at read time, when every responseMap key
      names no output-schema property at all
- criterion: An output schema property no responseMap key names is absent from the observation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: excludes an output-schema property from the ok observation when no responseMap key names it,
      even though the response body happens to carry a same-named field
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
reconciliation: siegard-reconcile/recursive-output-schema-fields.md
findings:
- pass: conformance
  file: src/investigation/citation-validation.ts
  where: citesADeclaredField, lines 26-32
  evidence: function citesADeclaredField(context, citation) { const citedEvidence = context.evidence.find(item
    => item.concept === citation.concept); if (citedEvidence === undefined) { return false; } return citedEvidence.fields.some(field
    => field.name === citation.field); }
  cost: 'The invariant scopes the field check to citations that carry a field and states a no-data verdict''s
    citation carries none. This function applies fields.some(...) unconditionally: when citation.field
    is undefined and citedEvidence.fields is [], .some(...) is false on both counts, so isCitationValid
    rejects a citation the specification says is legitimately fieldless. Pre-existing, not introduced
    by this delivery, but the rule''s second clause has no test and no code branch honoring it.'
  correction: Guard the field check on citation.field being present — return true (no field to validate)
    when citation.field === undefined, and only run fields.some(...) when it is defined.
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: resolveHttpConnectorCallConfiguration's catch (lines 149-161), routing MalformedHttpConnectorConfigurationError
    through the generic unavailableFor helper
  evidence: 'function unavailableFor(error) { return { result: ''unavailable'', result_detail: error.name
    }; } ... if (error instanceof MalformedHttpConnectorConfigurationError) { return { ok: false, outcome:
    unavailableFor(error) }; }'
  cost: The rule states the result_detail beside a malformed key states the vocabulary that key was held
    to; this function discards the computed `problems` vocabulary and reports only the bare error class
    name. Pre-existing, not introduced by this delivery.
  correction: unavailableFor needs a MalformedHttpConnectorConfigurationError-specific branch, mirroring
    unavailableForUnreachableConnector's own explicit enrichment, that folds the computed problems vocabulary
    into result_detail.
- pass: conformance
  file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  where: the cross-item isolation assertions, lines 217-219
  evidence: expect(system).toContain('evaluate each in complete isolation from every other'); expect(system).toContain('is
    never attributed to another item, even where two items declare a field of the same name');
  cost: This cross-item isolation guarantee is stated only in the adapter's own system prompt and pinned
    only by this test; no specification node records it, unlike neighboring prompt facts the decision
    log shows were deliberately decided. Pre-existing, not introduced by this delivery.
  correction: Decide, as an invariant constraining domain/investigation/hypothesis-evaluator, that a hypothesis's
    judgment reads each evidence item's own field values independently of every other item's, and record
    why in the decision log.
- pass: conformance
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the 'imports no HTTP client package' / 'defaults to fetch' tests, lines 150-173
  evidence: const forbidden = ['axios', 'node-fetch', 'got', 'undici', 'superagent', 'request']; ... expect(offenders).toEqual([]);
  cost: The adapter's binding to the platform's own fetch, and the ban on these packages, lives only in
    this test; no node scopes this adapter's own infrastructure boundary the way constraints/the-domain-depends-on-no-infrastructure
    scopes the domain layer. Pre-existing, not introduced by this delivery.
  correction: State, in a node scoping this adapter's own infrastructure boundary, that the HTTP connector
    adapter reaches the network only through the platform's own fetch and depends on no HTTP client package.
- pass: conformance
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the two request-body-serialization tests, lines 828-852
  evidence: 'expect(httpClient.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ subjectId: ''a-subject-id''
    }));'
  cost: How a resolved request body reaches the wire (JSON-encoded unless already a string) is asserted
    only here; the specification states the symmetric rule for the read side but is silent for the outbound
    call. Pre-existing, not introduced by this delivery.
  correction: State, beside rules/integration/an-http-connector-configuration-declares-its-call, how a
    resolved request body is placed on the wire.
- pass: conformance
  file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: the expectedInputs helper, lines 273-275
  evidence: 'function expectedInputs(context) { return JSON.stringify({ concept: context.concept, subject:
    context.subject, requester: context.requester }); }'
  cost: The decision log fixes only inputs's type (string), leaving its content undecided; this fixture
    commits the whole file to a specific content the specification never settled. Pre-existing, not introduced
    by this delivery.
  correction: State, on the evidence node or a rule it points to, exactly what the recorded inputs value
    is composed of.
- pass: conformance
  file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: expectedOkEvidence/expectedNonOkEvidence/expectedUnavailableEvidence's origin field, lines 288,
    311, 330
  evidence: 'origin: context.capability.connector,'
  cost: The decision log fixes only origin's type (string), leaving what populates it unstated; this file's
    fixtures assert a specific mapping (the producing capability's connector, or '' when unresolved) no
    node confirms. Pre-existing, not introduced by this delivery.
  correction: State on the evidence node what origin holds — the producing capability's own connector,
    empty where none resolved.
- pass: standard
  file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: evidenceCollectionStageImports(), lines 1348-1366
  cites: MNT-03
  evidence: const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g; async function
    evidenceCollectionStageImports() { ... }
  cost: Re-types the same regex/read/match logic field-semantics.spec.ts's fieldSemanticsImports already
    has under a new name; the two have already diverged in name while staying identical in body.
  correction: Factor the pattern, read and match into one shared test helper both spec files call with
    their own module path.
- pass: standard
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: class FakeCapabilityQuery, lines 62-88
  cites: MNT-03
  evidence: class FakeCapabilityQuery implements ICapabilityQuery { private readonly held = new Map();
    ... }
  cost: evidence-collection-stage.spec.ts already declares a FakeCapabilityQuery with the same held-map
    and readCapability branch; this file retypes it from scratch.
  correction: Move the base FakeCapabilityQuery into a shared test double both spec files import, extending
    it here with the duplicate-concept behavior.
- pass: standard
  file: src/investigation/field-semantics.ts
  where: fieldSemanticsOf's guard, lines 9-17
  cites: MNT-03
  evidence: if (outputSchema === undefined) { return []; } const parsed = parseJsonOrUndefined(outputSchema);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.properties)) { return []; }
  cost: Character-for-character the same undefined-check/parse/double-validate citation-validation.ts's
    declaredFieldsOf already runs before Object.keys(parsed.properties); nothing enforces the two functions
    agree on what counts as a validly-shaped schema.
  correction: Extract the shared guard into one helper in citation-validation.ts that both declaredFieldsOf
    and fieldSemanticsOf call.
- pass: standard
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: function isPlainObject, lines 278-280
  cites: MNT-03
  evidence: function isPlainObject(value) { return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
  cost: citation-validation.ts already exports an isPlainObject with the identical body, and this file
    already imports declaredFieldsOf from that same module two lines above.
  correction: Import isPlainObject from ./citation-validation.js alongside declaredFieldsOf and delete
    the local definition.
---

## What it is

The review of the recursive-output-schema-fields initiative: four tasks making field-semantics.ts read a capability's output schema recursively, and three consumers (the judgment prompt, citation acceptance, the connector observation load) either already carrying or deliberately not widening with the new path-shaped names.
Coverage, specification conformance (one judge per file) and the project's own standard all ran; the failures pass did not, because the captured run over the whole change passed clean.

## Notes

All 11 findings this review surfaces were confirmed, by reading the diff, to be pre-existing code or tests this initiative's four tasks did not write or touch -- they surfaced only because the files that carry them sat in this review's own file set (three because the delivery's implementation records named them as read-but-unmodified, the rest because they are the very test files the deliveries extended).
Two specification nodes were not cleared by the conformance pass and stay exactly as they stood: rules/investigation/a-cited-field-exists-in-the-capability-output-schema (the no-data-citation contradiction) and rules/integration/an-http-connector-configuration-declares-its-call (the malformed-configuration detail contradiction).
The certification pass (coverage-auditor over six proof-offered demonstrations) returned four `partial` verdicts beyond the two `covered`: the array-items node itself is never composed onto an already-nested path in the test set; the fields snapshot-versus-re-read guarantee has no re-registration test of its own (unlike its sibling capability_payload_notes); the observation-boundary rule never exercises a falsy resolved value or a schema with no properties object; and the response-map-key-names-nothing scenario is exercised one layer below the evidence record it names. None of these are failures -- each names one concrete input/output pair that would close the gap, and none blocks this review's own soundness.
This review does not judge whether any finding should be acted on, or by whom -- that is a person's call, using the routes named below.

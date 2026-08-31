---
title: Read a case version's input requirements
summary: A new hook, useCaseInputRequirements(slug, version), reads GET /v1/cases/{slug}/versions/{version}/input-requirements
  through apiFetch and returns the requirements list and the malformed-input-schema capabilities list
  as two separate fields, in the loading/error/refetch shape use-capabilities.ts already keeps.
task: sha256:98b0f9361c834e7a859cdc01d78f0b1e286a91240d10913c1b4fb394558d2a7d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-read-case-input-requirements-hook-build
files:
- path: src/hooks/use-case-input-requirements.ts
  effect: reads one case version's derived input requirements and the capabilities named apart from them
    (malformed input schema) through apiFetch, exposing {requirements, capabilitiesWithMalformedInputSchema,
    isLoading, isError, refetch}.
criteria:
- criterion: The hook reads /v1/cases/{slug}/versions/{version}/input-requirements for the slug and version
    it is given, through the app's own apiFetch rather than a fetch of its own.
  met: true
  how: useCaseInputRequirements(slug, version)'s queryFn calls apiFetch<CaseInputRequirementsResponse>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}/input-requirements`);
    no fetch()/XHR call appears anywhere in the file.
- criterion: Each requirement it returns carries its own attribute name, its own required flag, and the
    capabilities that ask for that attribute.
  met: true
  how: CaseInputRequirement is typed {attribute, required, capabilities}, read straight from the response's
    own requirements array with no field dropped or renamed.
- criterion: Each capability a requirement names is carried by name and version alone, with no other field
    of that capability's registration restated.
  met: true
  how: capabilities is typed readonly CapabilityReference[], where CapabilityReference = {name, version}
    -- domain/integration/capability's other six attributes (nature, input_schema, output_schema, timeout,
    connector, concept) are never declared on it.
- criterion: The capabilities the read names apart from the requirements are returned as their own list,
    never merged into any requirement's own capabilities.
  met: true
  how: capabilitiesWithMalformedInputSchema is read from the response's own separate capabilities_with_malformed_input_schema
    field and returned as its own top-level result field; nothing in the hook concatenates it into any
    requirement's capabilities array.
- criterion: A read answering no requirements at all returns an empty requirement list rather than an
    error state.
  met: true
  how: requirements resolves as query.data?.requirements ?? [] -- the fallback only substitutes while
    query.data itself is absent (loading/error); a resolved response whose own requirements is [] is returned
    unchanged and isLoading/isError stay false/false.
- criterion: The hook reports its own loading state, its own error state and a void-returning refetch,
    in the registry list-hook shape use-capabilities.ts already keeps.
  met: true
  how: 'returns {requirements, capabilitiesWithMalformedInputSchema, isLoading: query.isLoading, isError:
    query.isError, refetch: () => { void query.refetch(); }}, mirroring use-capabilities.ts''s own return
    shape field-for-field.'
nodes:
- node: contracts/knowledge/case-input-requirements
  encoded_at:
  - src/hooks/use-case-input-requirements.ts
  how: the hook composes exactly the published read-case-input-requirements operation this contract names,
    with no version-state branch of its own -- honoring the contract's "answers for a case version in
    either state, draft included" by applying no conditional at all.
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/hooks/use-case-input-requirements.ts
  how: CaseInputRequirement's own {attribute, required, capabilities} shape mirrors the node's declared
    attributes and its one relationship to domain/integration/capability exactly; the node's own restraint
    against restating a referenced capability's registration is what CapabilityReference (name/version
    only) encodes.
- node: domain/integration/capability
  how: this task creates or reads no capability aggregate of its own -- it only references one by identity.
    The work honors the node by narrowing every capability reference (both a requirement's own capabilities
    and capabilitiesWithMalformedInputSchema) to exactly two of its eight declared attributes (name, version)
    and restating none of the other six (nature, input_schema, output_schema, timeout, connector, concept),
    rather than reaching this node's own record.
inferences:
- inferred: slug and version are received as this hook's own two function arguments rather than read from
    a route param, a context, or a shared cockpit state.
  from: use-case-simulation-version.ts's own useCaseSimulationVersion(slug, version) and use-simulate-hypothesis.ts's
    own useSimulateHypothesis(slug, version) -- the established convention for a hook scoped to one case
    version's pinned identity where the task names no screen or route of its own.
- inferred: the query key is a new, dedicated ["case-input-requirements", slug, version] tuple rather
    than reusing use-case-simulation-version.ts's own ["case-version", slug, version] key.
  from: every existing read hook in this app keys its own cache entry by its own resource name (use-capabilities.ts's
    ["capabilities"], use-connector-configurations.ts's ["connector-configurations"]) rather than sharing
    a key across two different endpoints.
- inferred: the response field capabilities_with_malformed_input_schema is exposed as capabilitiesWithMalformedInputSchema
    (camelCase transliteration of the wire field, unshortened).
  from: no criterion or node names this field's own returned property name; kept literal to the wire field,
    the same unshortened camelCasing use-connector-configurations.ts already applies to its own connector/configuration
    fields.
---

## What it is
The first frontend read of the published read-case-input-requirements operation, returning the requirements and the malformed-schema capabilities as two separate things because the response names them separately.

## Notes
No comment or code here re-derives the connector-placeholder scan this task's own sibling task retires; this file is wholly new.

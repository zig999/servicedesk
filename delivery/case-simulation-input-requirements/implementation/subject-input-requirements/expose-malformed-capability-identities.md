---
title: Carry malformed-input-schema capability identities onto the simulation subject state
summary: useSimulationSubject's returned SimulationSubjectState now exposes capabilitiesWithMalformedInputSchema,
  passed through unchanged from useCaseInputRequirements alongside requiredFields.
task: sha256:53f40e9a083fcfe44451a44ebfbad2e1982eb151a59b8f175a2c4217a7531f40
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-expose-malformed-build-4
files:
- path: src/hooks/use-simulation-subject.ts
  effect: SimulationSubjectState gains a new field, capabilitiesWithMalformedInputSchema (readonly CapabilityReference[]),
    documented on the type and returned from useSimulationSubject. The hook now also destructures capabilitiesWithMalformedInputSchema
    from useCaseInputRequirements(slug, version) and returns it unchanged (no transformation, no filtering,
    no re-derivation) alongside requiredFields. Imports CapabilityReference as a type from ./use-case-input-requirements.
    Both the file's own top-of-file header comment and the new field's own doc comment record this task's
    addition, its UNDERDETERMINED and REMAINDER notes, and why criterion 2 needs no filtering logic here.
criteria:
- criterion: Every capability the read names apart from its requirements is carried on the subject state
    by its own name and version.
  met: true
  how: useSimulationSubject destructures capabilitiesWithMalformedInputSchema from useCaseInputRequirements(slug,
    version) and returns it verbatim as SimulationSubjectState.capabilitiesWithMalformedInputSchema --
    a readonly CapabilityReference[] ({name, version}), the same type useCaseInputRequirements already
    types that field with, so every capability the read names apart from its requirements reaches the
    subject state by exactly that identity, unchanged.
- criterion: No such capability appears among the state's exposed fields or in any field's own capability
    annotation.
  met: true
  how: 'Confirmed by reading services/simulation-subject-derivation.ts''s deriveSubjectFields: requiredFields
    is built by mapping over `requirements` alone, and each field''s own `capabilities` array is built
    by resolvedCapabilitiesFor, which only ever resolves a requirement''s own asking-capability references
    (requirement.capabilities) against the currently-registered capabilities -- it never reads capabilitiesWithMalformedInputSchema
    and has no path by which a malformed capability (referenced by no requirement, per domain/knowledge/case-input-requirement
    and rules/knowledge/a-case-versions-input-requirements-are-derived) could enter either requiredFields
    or any field''s own capabilities. No filtering was added in use-simulation-subject.ts because none
    was needed: the two lists are populated from disjoint sources by construction, and adding an exclusion
    here would be redundant defensive code answering a case that cannot arise.'
- criterion: A read naming no such capability leaves that list empty rather than absent.
  met: true
  how: 'useCaseInputRequirements(slug, version) already guarantees this upstream -- `capabilitiesWithMalformedInputSchema:
    query.data?.capabilities_with_malformed_input_schema ?? []` -- and use-simulation-subject.ts passes
    that exact value through with no intermediate `?? undefined` or conditional, so an empty read reaches
    the subject state as an empty array, never as undefined.'
nodes:
- node: contracts/knowledge/case-input-requirements
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: The contract states the read names, apart from the attributes, every capability whose input schema
    does not currently hold a well-formed shape; this task's change is what carries that second half of
    the read forward from the hook that implements the read itself onto the composed subject state, unchanged,
    so the fact the contract states reaches the interface assembling the subject.
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: The node states such a capability is referenced by no requirement and reaches the composer by identity
    alone; the new field carries exactly that identity (name, version) and nothing more, matching CapabilityReference's
    own bare shape, and the doc comment on the field cites this node for why no filtering of requiredFields
    is needed.
- node: domain/integration/capability
  how: This task reaches this node only in that the identities carried (name, version) are two of this
    aggregate's own attributes; the work does not restate or resolve any of the capability's other attributes
    (nature, schemas, timeout, connector, concept) here, since the read itself already withholds those
    for a malformed capability. No fact of this node is newly encoded by this file; it is honored by carrying
    no more of it than the read already names.
- node: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
  how: 'This task implements only the carrying of the list onto state, not the disclosure clause itself
    (showing the identity to the person composing the subject) -- the task''s own REMAINDER note names
    this explicitly, attributing that remaining clause to the sibling task disclose-malformed-capabilities-to-the-curator.
    The rule is honored so far as this task reaches: capabilitiesWithMalformedInputSchema is available,
    unfiltered and by identity, on the state that sibling task will render from.'
inferences:
- inferred: The new field is named capabilitiesWithMalformedInputSchema, identical to useCaseInputRequirements's
    own field of that name, rather than a new name of its own.
  from: The task's own instruction to choose whatever field name fits the existing naming conventions
    of SimulationSubjectState; since this is an exact, untransformed pass-through of a value already named
    and documented at the hook boundary (use-case-input-requirements.ts's own header comment), reusing
    that name keeps the identity traceable across both hooks rather than inventing a second name for the
    same list, and SimulationSubjectState already reuses field names verbatim from what it composes elsewhere
    -- there is no existing convention against reusing an upstream hook's own field name where nothing
    about the value changes in transit.
preserved:
- requiredFields's own shape and derivation (deriveSubjectFields, resolvedCapabilitiesFor) is untouched
  -- no field, capability annotation, or filtering logic was added there.
- isReady's dispatch-gating logic (requester non-empty, every requiredFields entry non-empty, subject.attributes.length
  > 0) is untouched.
- isLoadingRegistries/isRegistriesError's own composition (isLoadingCaseInputRequirements || isLoadingCapabilities,
  isCaseInputRequirementsError || isCapabilitiesError) is untouched.
- No rendering file (case-simulation-subject-panel.tsx or any other) was touched; the new field is carried
  on state and shown to nobody by this task.
deferred:
- what: Rendering capabilitiesWithMalformedInputSchema to the curator (the disclosure clause of rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability).
  why: The task's own Notes name this as a REMAINDER belonging to the sibling task disclose-malformed-capabilities-to-the-curator,
    and this task's objective is limited to carrying the list on state.
---

## What it is
The second half of the case-input-requirements read, carried onto the subject state alongside the derived field set, ready for the sibling task that discloses it.

## Notes
None.

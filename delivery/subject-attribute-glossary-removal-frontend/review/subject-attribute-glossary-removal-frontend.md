---
target: frontend
title: Subject-attribute glossary removal, frontend, four passes over the whole change
summary: 'Coverage, conformance, standard and failures over the 17 files the four tasks of subject-attribute-glossary-removal-frontend
  wrote or touched: the glossary browser''s own tab reduction, the GlossaryVocabulary union narrowing,
  the case-simulation subject panel''s control removal, and useSimulationSubject''s own composition rewrite.'
reviewed:
- src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
- src/hooks/use-glossary-vocabulary.spec.ts
- src/hooks/use-glossary-vocabulary.ts
- src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
- src/hooks/use-simulation-subject.spec.ts
- src/hooks/use-simulation-subject.ts
- src/routes/case-simulation-subject-panel-attributes.spec.ts
- src/routes/case-simulation-subject-panel-json-view.spec.ts
- src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
- src/routes/case-simulation-subject-panel.spec.ts
- src/routes/case-simulation-subject-panel.test-support.ts
- src/routes/case-simulation-subject-panel.tsx
- src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
- src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
- src/routes/glossary-browser-screen.spec.ts
- src/routes/glossary-browser-screen.test-support.ts
- src/routes/glossary-browser-screen.tsx
tasks:
- task/glossary-vocabulary-reduction/drop-the-subject-attributes-tab-from-the-glossary-browser
- task/glossary-vocabulary-reduction/narrow-the-glossary-vocabulary-union
- task/composed-subject-attribute-inputs/remove-the-add-attribute-control-from-the-subject-panel
- task/composed-subject-attribute-inputs/compose-the-subject-from-case-input-requirements-alone
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so there was nothing to diagnose
coverage:
- criterion: The glossary browser renders exactly five tabs — Concepts, Subject types, Outcomes, Actions,
    Recipients — and no Subject attributes tab.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders exactly the tabs Concepts, Subject types, Outcomes, Actions and Recipients, in that
      order, with Concepts selected by default
  why: The assertion is an exact-equality over the rendered tab labels, so a sixth tab or a re-added Subject
    attributes tab fails it.
- criterion: No rendering of the glossary browser issues a glossary read for the vocabulary name "subject-attribute".
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
    name: never requests the subject-attribute vocabulary, and every path it does request is one of the
      glossary's five held endpoints
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders the newly active tab's own data in place of the previously active tab's, and issues
      no request for the other four vocabulary paths
  why: The removal spec visits every vocabulary tab before reading the recorded fetch calls, so the negative
    holds over the renderings a person can reach, not only the initial one.
- criterion: Each of the four surviving vocabulary tabs still renders its own VocabularyPanel with its
    own empty message and its own load-error message and Retry control.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET $path returns, by name, in the $tabLabel tab
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders its own explicit empty-state message and no table when GET $path returns zero terms,
      in the $tabLabel tab
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: shows $errorMessage plus a Retry button when GET $path fails, and Retry re-issues the same request,
      in the $tabLabel tab
  why: Each case is parametrised over the four surviving tabs and asserts that tab's own empty message
    and its own error message by distinct text, plus a Retry that re-issues that same path.
- criterion: The Concepts tab still renders ConceptsPanel unchanged.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders one row per concept GET /v1/glossary/concepts returns, each showing its own name, accepts
      and ttl
  - file: src/routes/glossary-browser-screen.spec.ts
    name: suffixes a concept's own ttl with 's' rather than rendering a bare number
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders a concept's own accepts list as one comma-joined string cell, not one cell per accepted
      subject type
  - file: src/routes/glossary-browser-screen.spec.ts
    name: shows a loading placeholder before GET /v1/glossary/concepts responds
  - file: src/routes/glossary-browser-screen.spec.ts
    name: shows a generic load-failure message plus a Retry button when GET /v1/glossary/concepts fails,
      and Retry re-issues the same request
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders an explicit empty-state message and no table when GET /v1/glossary/concepts returns
      zero concepts
- criterion: Every vocabulary name this screen reads is one the glossary holds, so this rule refuses none
    of the screen's own reads.
  state: partial
  tests:
  - file: src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
    name: never requests the subject-attribute vocabulary, and every path it does request is one of the
      glossary's five held endpoints
  why: 'The set of names the screen reads is pinned exactly, but that those five are names the glossary
    holds is nowhere exercised: every response is stubbed by the spec itself, so a read of a name the
    glossary does not hold would resolve just as happily and the rule''s refusal never occurs in this
    set.'
- criterion: The screen's test support holds no Subject attributes entry in its shared tab-label and tab-case
    fixtures.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
    name: excludes Subject attributes from ALL_TAB_LABELS, VOCABULARY_TAB_CASES and ALL_TAB_CASES
  why: Asserted directly over all three shared fixtures, by label and by path substring.
- criterion: Every surviving tab's own assertion passes against the shortened fixtures, including any
    that reads a fixture's length or position.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET $path returns, by name, in the $tabLabel tab
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders its own explicit empty-state message and no table when GET $path returns zero terms,
      in the $tabLabel tab
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: shows $errorMessage plus a Retry button when GET $path fails, and Retry re-issues the same request,
      in the $tabLabel tab
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders no control that creates, edits or deletes a term or concept, in the $tabLabel tab
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders no pagination control in the $tabLabel tab
  why: Every parametrised suite now enumerates the shortened fixtures, and each generated case clicks
    the tab its fixture names and waits on that fixture's own message.
- criterion: GlossaryVocabulary admits exactly "outcome", "action", "recipient" and "subject-type".
  state: partial
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: refuses a fifth, unheld vocabulary name at compile time
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: still issues a GET to /v1/glossary/$vocabulary and maps its own terms to {value, label} options,
      unaffected by the fifth vocabulary's addition
  why: The rejection is a @ts-expect-error directive decided by a typecheck, not runtime; and "exactly"
    is exercised only against "subject-attribute" — a union admitting some further name would go unnoticed.
- criterion: Passing the literal "subject-attribute" to useGlossaryVocabularyOptions is a type error rather
    than a call the frontend can express.
  state: partial
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: refuses a fifth, unheld vocabulary name at compile time
  why: The refusal is exercised on an assignment to a GlossaryVocabulary-annotated variable, not on a
    call to the hook itself.
- criterion: The hook's own spec exercises only vocabulary names the narrowed union admits, and no case
    in it names "subject-attribute".
  state: uncovered
  why: Nothing in the set asserts what the hook's spec exercises; the claim is about the spec file's own
    content, and no test reads it.
- criterion: The hook's options mapping, isLoading, isError and refetch shape are unchanged for every
    surviving vocabulary, and no second glossary-options hook is introduced.
  state: partial
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: still issues a GET to /v1/glossary/$vocabulary and maps its own terms to {value, label} options,
      unaffected by the fifth vocabulary's addition
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: returns an empty options array, rather than throwing or leaving it undefined, when the page
      holds no terms yet
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: reports isError, with options staying empty, when the request fails
  why: isError is exercised for "outcome" alone, refetch is never read or called anywhere in the set,
    and nothing bears on the absence of a second glossary-options hook.
- criterion: No vocabulary name this hook can be asked for is one the glossary does not hold, so this
    rule refuses no read the hook issues.
  state: partial
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: refuses a fifth, unheld vocabulary name at compile time
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: still issues a GET to /v1/glossary/$vocabulary and maps its own terms to {value, label} options,
      unaffected by the fifth vocabulary's addition
  why: 'That the glossary holds the four askable names is not exercised: fetch is stubbed by the spec,
    so a read for a name the glossary does not hold resolves normally.'
- criterion: The hook's own spec still exercises an empty-page case and an isError case, each re-pointed
    to a surviving vocabulary rather than dropped, so no coverage of those two states is lost by the narrowing.
  state: covered
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: returns an empty options array, rather than throwing or leaving it undefined, when the page
      holds no terms yet
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: reports isError, with options staying empty, when the request fails
- criterion: The subject panel renders no "+ attribute" control.
  state: covered
  tests:
  - file: src/routes/case-simulation-subject-panel-attributes.spec.ts
    name: renders no '+ attribute' control
- criterion: The subject panel renders no attribute row carrying its own Attribute select, Value input
    and Remove attribute button.
  state: covered
  tests:
  - file: src/routes/case-simulation-subject-panel-attributes.spec.ts
    name: renders none of an attribute row's own Attribute select, Value input or Remove-attribute button
- criterion: The panel issues no glossary read for the vocabulary "subject-attribute", and neither a subject-attribute
    loading message nor a subject-attribute load-error message with its Retry control is reachable.
  state: covered
  tests:
  - file: src/routes/case-simulation-subject-panel-attributes.spec.ts
    name: issues no fetch to the subject-attribute vocabulary and renders neither its loading nor its
      load-error message
- criterion: The panel's attribute inputs are exactly one per requirement named by the case-input-requirements
    read, required and optional alike, each carrying that requirement's own required flag through unchanged.
  state: covered
  tests:
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: renders a labeled input for a required requirement and for an optional one, neither filtered
      out
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: carries the native required attribute, and a visible asterisk on its own label
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: carries no required attribute and no asterisk
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: renders requirements in the order the state gives them, each with its own required marking held
      independently of the others
  - file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
    name: still renders every requirement's own input, each with its own required marking held independently,
      alongside a non-empty malformed-capability disclosure
- criterion: Where the read names no requirement at all, the panel still states that emptiness explicitly
    to the person composing the subject and that the simulate call is unavailable in that state, and the
    panel offers them no other way to name an attribute.
  state: partial
  tests:
  - file: src/routes/case-simulation-subject-panel-json-view.spec.ts
    name: states, in the rule's own terms, that the pinned case version's own case-input-requirements
      name no attribute
  why: The explicit emptiness statement is exercised, but nothing asserts the panel tells the person the
    simulate call is unavailable in that state; the "no other way" half is exercised only against a state
    that already holds a requirement.
- criterion: The subject-type Select still renders the surviving subject-type vocabulary's own options,
    with its own loading and load-error branches intact.
  state: covered
  tests:
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: renders the Type field as a combobox, never a free-text input
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: offers exactly the subject-type vocabulary's own current terms as options
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: shows the given state.subject.type as the Type field's own selected value
  - file: src/routes/case-simulation-subject-panel-json-view.spec.ts
    name: shows a loading message while the subject-type vocabulary is still loading
  - file: src/routes/case-simulation-subject-panel-json-view.spec.ts
    name: shows a load-error message with a Retry control when the subject-type vocabulary fails to load,
      and Retry re-issues the request
- criterion: The requester input, each input's own asking-capability attributions and the malformed-input-schema
    list render as delivered.
  state: covered
  tests:
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: shows state.requester as the Requester field's own value
  - file: src/routes/case-simulation-subject-panel.spec.ts
    name: shows a single asking capability's own connector, name and version
  - file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
    name: shows a single malformed capability's own name and version
- criterion: The panel's own specs assert the above without reading state.addedAttributes, state.onAddAttribute,
    state.onRemoveAttribute or state.onAttributeChange.
  state: uncovered
  why: Nothing in the set asserts what the panel's specs read; a re-introduced reference would be caught
    only by a typecheck against SimulationSubjectState, not by any assertion here.
- criterion: SimulationSubjectState exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange
    member.
  state: covered
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange member
- criterion: The composed subject's attributes are exactly the requirement inputs holding a non-empty
    value, one attribute-value pair each, paired as an attribute name with the value it holds.
  state: covered
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: composes one {attribute, value} pair per filled requirement input, each holding that field's
      own typed value
  - file: src/hooks/use-simulation-subject.spec.ts
    name: omits the attribute for a requirement input left empty, while still pairing a sibling field
      that was filled
- criterion: The composed subject carries at most one value per attribute name; where two requirement
    inputs name the same attribute, the value of the one recorded first stands and the later one's value
    is dropped.
  state: partial
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: carries only one attribute-value pair when two requirement inputs name the same attribute
  why: 'The at-most-one half is exercised, but the precedence half is not: the test fills only the first
    same-named input, so the single pair observed is equally explained by the empty-input rule; nothing
    gives both same-named inputs different non-empty values.'
- criterion: A requirement whose input is empty contributes no attribute-value pair to the composed subject.
  state: covered
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: omits the attribute for a requirement input left empty, while still pairing a sibling field
      that was filled
- criterion: isReady is true exactly when the requester is non-empty and the composed subject carries
    at least one attribute-value pair.
  state: covered
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: stays not-ready while the requester is empty, even once the one derived required field holds
      a value
  - file: src/hooks/use-simulation-subject.spec.ts
    name: turns ready once every derived required field and the requester hold a non-empty value
  - file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
    name: stays ready with the required field's own input still empty, as long as another requirement
      input and the requester are filled
- criterion: The requiredFields, capabilitiesWithMalformedInputSchema, requester, isLoadingRegistries
    and isRegistriesError members are unchanged, and the case-input-requirements read they derive from
    is not modified.
  state: partial
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: exposes a required field for an attribute the read names, with no capability resolving for it
      at all
  - file: src/hooks/use-simulation-subject.spec.ts
    name: derives a different field set once the pinned version changes, with the same source and the
      same registries
  why: capabilitiesWithMalformedInputSchema is asserted only against the panel's hand-built fixture, never
    off the hook's own return, and requester is exercised only indirectly.
- criterion: The hook's own specs and both missing-requirement specs drive readiness and dispatch-hold
    through requirement inputs alone, with no call to a removed member, and still assert the dispatch
    hold they asserted before.
  state: partial
  tests:
  - file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
    name: stays ready with the required field's own input still empty, as long as another requirement
      input and the requester are filled
  - file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
    name: issues the /v1/simulate request once the requester and a second requirement input are filled,
      with the one required field still empty
  why: The dispatch hold is still asserted, but "with no call to a removed member" is a claim about the
    spec files' own content that only a typecheck would catch.
- criterion: 'The { type, attributes: [{ attribute, value }] } shape reaching use-simulate-case and use-simulate-hypothesis
    is field-for-field unchanged.'
  state: partial
  tests:
  - file: src/hooks/use-simulation-subject.spec.ts
    name: composes one {attribute, value} pair per filled requirement input, each holding that field's
      own typed value
  - file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
    name: issues the /v1/simulate request once the requester and a second requirement input are filled,
      with the one required field still empty
  why: The shape is asserted on the hook's own subject member, but the dispatch tests never read the request
    body reaching use-simulate-case/use-simulate-hypothesis.
- criterion: SubjectAttributeRow stays defined in use-test-connector-panel.ts serving that panel's own
    placeholder-derived rows, and its row-reconciliation helper there is untouched.
  state: uncovered
  why: Nothing in this set exercises use-test-connector-panel.ts at all.
- criterion: case-simulation-ready-view.test-support.ts composes its subject fixture without naming any
    removed member.
  state: uncovered
  why: That file is not in the set and nothing in the set reads it.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/subject-attribute-glossary-removal-frontend.md
findings:
- pass: conformance
  file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  where: the twoRequirementsResponse fixture, lines 27-35
  evidence: "requirements: [\n  { attribute: \"account-id\", required: true, capabilities: [] },\n  {\
    \ attribute: \"escalation-flag\", required: false, capabilities: [] },\n],"
  cost: The fixture models a case-input-requirement carrying zero asking capabilities, for both the required
    and the optional attribute driving criterion 1 and criterion 2. A reader treating this proof as documentation
    of the wire shape learns that an entry can exist without a capability behind it; the domain node the
    entry answers to says the opposite — an attribute no currently-registered capability asks for is not
    a requirement at all — so a future read that produced such an entry through a real defect would pass
    unnoticed against this fixture rather than being caught by it.
  correction: Give each requirement in the fixture at least one capability entry (name and version), the
    way REQUIRED_FIELD_RESPONSE in use-case-simulation-cockpit.test-support.ts already does, so the fixture
    states a reachable case-input-requirement rather than one the domain node rules out.
- pass: conformance
  file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  where: twoRequirementsResponse() and threeRequirementsResponse(), lines 21-22 and 31-33
  evidence: '{ attribute: "account-id", required: true, capabilities: [] },

    { attribute: "escalation-flag", required: false, capabilities: [] },'
  cost: 'The node holds a case-input-requirement to at least one asking capability — "never fewer than
    one, since an attribute nobody currently asks for is not a requirement at all" — but every requirement
    entry these fixtures hand the hook carries capabilities: []. A reader who takes these two response
    builders as a model of what a case-input-requirements read actually returns learns a shape the specification
    says cannot occur.'
  correction: Give each mocked requirement at least one capability entry (name, version, connector, concept),
    so the fixture's shape matches the cardinality the node declares.
- pass: conformance
  file: src/hooks/use-simulation-subject.ts
  where: composedAttributes, line 50
  evidence: if (field.value.trim() === "" || attributeMap.has(field.attribute)) {
  cost: An attribute input made of only spaces is silently treated the same as an untouched, truly empty
    input — dropped from the assembled subject and from the count isReady uses. The specification's own
    decided reading of an empty attribute input is scoped to the empty string exactly; whitespace-equivalence
    for this field is decided nowhere, so the next reader who wants to know what counts as "no attribute-value"
    here will find only the literal empty string in the specification and a wider rule living only in
    this file.
  correction: Either drop the .trim() and compare field.value === "" alone, matching the node's decided
    "left empty" reading, or have the specification decide and state the whitespace-equivalence for this
    field before the code applies it.
- pass: conformance
  file: src/hooks/use-simulation-subject.ts
  where: isReady, line 96
  evidence: const isReady = requester.trim() !== "" && subject.attributes.length > 0;
  cost: A requester made of only whitespace is treated as no requester for readying a simulate call. rules/investigation/a-simulation-carries-its-requester
    states only "a call whose payload carries no requester, or an empty one, is refused" — none of the
    specification's four scoped empty-string readings is stated with a whitespace extension for this field.
  correction: Compare requester !== "" alone, or have the specification decide and state whitespace-equivalence
    for the requester field before the code applies it.
- pass: conformance
  file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  where: the two it() blocks under the describe at line 93, lines 94-100 and 102-108
  evidence: "it(\"discloses nothing while state.isLoadingRegistries is true, even though the array is\
    \ non-empty\", async () => {\n    await renderPanel(baseState({ isLoadingRegistries: true, capabilitiesWithMalformedInputSchema:\
    \ [malformedCapability()] }));\n    expect(screen.queryByText(\"legacy-lookup 9.9.9\")).toBeNull();\n\
    \  });"
  cost: The rule that a malformed capability's identity is withheld from the composer while the registries
    read is loading or has errored lives only in this test. Neither rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability,
    its sibling empty-set rule, nor contracts/knowledge/case-input-requirements says anything about a
    loading or error window during which the disclosure is suppressed. A future reader will not find this
    in the specification, and nothing stops the next change from silently dropping or altering it.
  correction: Decide, in rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
    (or a new node beside it), whether the disclosure is withheld while the read is outstanding or has
    failed, and record the reasoning.
- pass: conformance
  file: src/routes/case-simulation-subject-panel.spec.ts
  where: the last it() in the describe block "every asking capability for a requirement is shown by its
    own name, version and connector, never only one (criterion 4)", lines 166-173
  evidence: "it(\"renders no capability list under a requirement whose own capabilities array is empty\
    \ (edge case: no currently-registered capability resolves)\", async () => {\n    await renderPanel(\n\
    \      baseState({ requiredFields: [buildRequiredField({ attribute: \"account-id\", capabilities:\
    \ [] })] }),\n    );\n    const [row] = requirementRows();\n    expect(within(row).queryByRole(\"\
    list\")).toBeNull();\n  });"
  cost: 'domain/knowledge/case-input-requirement declares its capabilities relationship 1..* and says

    outright that "an attribute nobody currently asks for is not a requirement at all" — a

    requirement the derivation produces at all always names at least one asking capability.

    This test builds and locks in rendering behavior for exactly the state the node says cannot

    occur: a present requirement with a zero-length capabilities array, calling it a legitimate

    "edge case." Any future branch written to satisfy this test would have no node behind it.'
  correction: Drop the empty-capabilities fixture and assertion, or replace it with the case the node
    actually admits — a requirement absent from the set entirely.
- pass: conformance
  file: src/routes/case-simulation-subject-panel.tsx
  where: the header preceding the required-fields list, line 69
  evidence: 'Required by the connectors:'
  cost: The list under this header is populated from state.requiredFields, whose per-field entries are
    then shown alongside the currently-registered capabilities that ask for the attribute — each already
    labelled with its own connector. The header instead names the connector as the thing an attribute
    is "required by". A reader maintaining this panel who takes the header at its word could dedupe or
    key the section by connector identity, when the requirement's own cardinality (1..* per domain/knowledge/case-input-requirement)
    and its derivation are per-capability, not per-connector — a connector is only a string a capability
    declares, not an entity that itself asks for anything.
  correction: State what actually governs presence in the list — e.g. "Required by the case version's
    case-input-requirements" or "Required by the following capabilities" — rather than attributing the
    requirement to the connector.
- pass: conformance
  file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  where: the it.each block under "GlossaryBrowserScreen — five term-vocabulary tabs, empty state (edge
    case)", lines 44-56
  evidence: '"renders its own explicit empty-state message and no table when GET $path returns zero terms,
    in the $tabLabel tab",

    expect(await screen.findByText(emptyMessage)).toBeTruthy();

    expect(screen.queryByRole("table")).toBeNull();'
  cost: whether an empty glossary-vocabulary listing must state its own emptiness explicitly, rather than
    leaving a bare absence of rows the person browsing could read as a stalled load, lives only in this
    test and the screen it drives, for all four vocabulary tabs; the specification decided the identical
    question for a case holding no versions (rules/knowledge/a-case-holding-no-versions-is-told-explicitly),
    so the next reader who checks the specification for whether the glossary owes the same disclosure
    finds nothing, though the sibling read already answers it.
  correction: decide, the way a-case-holding-no-versions-is-told-explicitly was decided for its own listing,
    whether and how each glossary vocabulary listing states its own emptiness explicitly, then bind this
    test to that node.
- pass: conformance
  file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  where: the it.each block under "GlossaryBrowserScreen — five term-vocabulary tabs, generic load-failure
    plus Retry (disclosed inference)", lines 60-85
  evidence: '"shows $errorMessage plus a Retry button when GET $path fails, and Retry re-issues the same
    request, in the $tabLabel tab",

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));'
  cost: whether a failed vocabulary-listing read is disclosed to the person browsing the glossary, and
    whether they are offered a control that re-issues exactly that same read, lives only in this test
    (and the screen it drives) for all five vocabulary tabs; the specification's own precedent for every
    comparable read required a dedicated decided rule naming that disclosure and that operator-initiated
    reattempt, so the next reader who checks the specification for what a failed glossary listing tells
    its user finds nothing, though the same question was answered for every sibling read.
  correction: decide, the way those sibling rules were decided for their own reads, what a failed glossary-vocabulary-listing
    read states to the person browsing it and whether it offers an operator-initiated reattempt — then
    bind this test to that node.
- pass: standard
  file: src/routes/case-simulation-subject-panel.tsx
  where: line 102, inside the per-capability list item of the required-field renderer
  cites: ARC-03
  evidence: "{capability.inputSchemaHint.trim() !== \"\" && (\n                        <span> — {capability.inputSchemaHint}</span>\n\
    \                      )}"
  cost: Whether a capability's own input-schema hint counts as "present" is a business decision -- the
    panel's own test suite treats a whitespace-only hint the same as an empty one -- and that decision
    is made inline in the render function rather than in the hook or service that derives the field set.
    Any other view that needs to disclose the same capability data has to reimplement .trim() !== "" itself,
    and the two checks can drift the day one of them is adjusted.
  correction: Have deriveSubjectFields (or the capability-reference type it returns) expose an already-trimmed
    hint or a boolean such as hasInputSchemaHint, so the component only renders what it is handed.
- pass: standard
  file: src/routes/glossary-browser-screen.tsx
  where: lines 49-52, VocabularyPanel, immediately before the StatusTable is returned
  cites: API-01
  evidence: "const rows: StatusTableRow[] = options.map((option) => ({\n            id: option.value,\n\
    \            name: option.label,\n          }));"
  cost: StatusTable's row shape ({id, name}) is reshaped from useGlossaryVocabularyOptions' own option
    shape ({value, label}) inline in the component rather than through a named adapter. A second screen
    that also needs to feed a StatusTable from the same vocabulary hook has no adapter to call and has
    to reinvent the mapping itself, and the two mappings are free to disagree the next time either field
    is renamed.
  correction: 'Extract a named function (e.g. toVocabularyRows(options: SelectOption[]): StatusTableRow[]),
    placed beside the hook or in a service module, and call it here instead of the inline .map.'
---

## What it is

Four passes over the whole delivered frontend change: whether the tests prove each task's own criteria, whether the source states only what the specification holds, whether the source follows the project's own standard, and (skipped, since the captured run passed clean) why a run failed.

## Notes

None.

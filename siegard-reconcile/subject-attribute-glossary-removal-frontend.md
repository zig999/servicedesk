---
contract_version: siegard-reconcile/5
title: Subject-attribute glossary removal, frontend
summary: The glossary browser drops the Subject attributes tab and the GlossaryVocabulary union narrows
  to four members; the case-simulation subject panel drops its "+ attribute" control and useSimulationSubject
  composes the subject from case-input-requirements alone.
target: frontend
files:
- path: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  change: drives the cockpit's dispatch-hold behavior through requirement inputs alone, with no call to
    a removed useSimulationSubject member.
- path: src/hooks/use-glossary-vocabulary.spec.ts
  change: removed the subject-attribute describe block; added a compile-time-rejection test and re-pointed
    the empty-page and isError cases to a surviving vocabulary.
- path: src/hooks/use-glossary-vocabulary.ts
  change: GlossaryVocabulary no longer admits "subject-attribute"; admits exactly outcome, action, recipient,
    subject-type.
- path: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  change: drives readiness/dispatch-hold through requirement inputs alone, with no call to a removed member.
- path: src/hooks/use-simulation-subject.spec.ts
  change: asserts the removed members are absent and the composed-attributes pairing, empty-input and
    first-recorded-wins rules, through requiredFields alone.
- path: src/hooks/use-simulation-subject.ts
  change: removed addedAttributes/onAddAttribute/onRemoveAttribute/onAttributeChange and mergedAttributes;
    composes the subject's attributes from requiredFields alone via a new composedAttributes function.
- path: src/routes/case-simulation-subject-panel-attributes.spec.ts
  change: asserts the "+ attribute" control, its row controls, and the subject-attribute glossary read
    are all absent from the panel.
- path: src/routes/case-simulation-subject-panel-json-view.spec.ts
  change: unchanged in substance; still asserts the empty-requirement-set disclosure and the subject-type
    loading/error branches.
- path: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  change: unchanged in substance; still asserts the malformed-capability disclosure alongside the requirement
    inputs.
- path: src/routes/case-simulation-subject-panel.spec.ts
  change: one pre-existing test's use of getAllByRole("button") replaced with queryAllByRole("button"),
    tolerating the panel now legitimately rendering zero buttons.
- path: src/routes/case-simulation-subject-panel.test-support.ts
  change: removed the addedAttributes/onAddAttribute/onRemoveAttribute/onAttributeChange fields from the
    baseState fixture, matching useSimulationSubject's narrowed real type.
- path: src/routes/case-simulation-subject-panel.tsx
  change: removed the "+ attribute" control, its attribute rows, the availableAttributeOptions filter
    and the subject-attribute glossary read; renders exactly one input per case-input-requirements entry.
- path: src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
  change: new spec asserting the glossary browser never reads the subject-attribute vocabulary and the
    shared fixtures hold no entry for it.
- path: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  change: new spec parametrising the listing/empty/error-plus-retry behavior of the four surviving vocabulary
    tabs.
- path: src/routes/glossary-browser-screen.spec.ts
  change: the tab-order assertion now expects the selected-tab marker prefix; otherwise unchanged.
- path: src/routes/glossary-browser-screen.test-support.ts
  change: removed the Subject attributes entry from the shared ALL_TAB_LABELS and VOCABULARY_TAB_CASES
    fixtures.
- path: src/routes/glossary-browser-screen.tsx
  change: removed the Subject attributes TabsTrigger/TabsContent pair and its VocabularyPanel instance;
    renders exactly five tabs.
nodes:
- node: contracts/glossary/glossary-query
  conforms: true
  how: "src/hooks/use-glossary-vocabulary.ts: held at the useQuery call inside useGlossaryVocabularyOptions,\
    \ which issues the list-vocabulary-terms read — queryFn: () => apiFetch<GlossaryTermsPage>(`/v1/glossary/${vocabulary}`),\n\
    src/routes/glossary-browser-screen.tsx: held at the VocabularyPanel's use of useGlossaryVocabularyOptions\
    \ and the ConceptsPanel invocation, which source the list-vocabulary-terms and list-concepts reads\
    \ respectively — const { options, isLoading, isError, refetch } = useGlossaryVocabularyOptions(vocabulary);\n\
    ...\n<TabsContent value=\"concepts\">\n  <ConceptsPanel />\n</TabsContent>"
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/glossary-browser-screen.tsx
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at the capabilities value read via useCapabilities(),
    lines 69-73 — const { capabilities, isLoading: isLoadingCapabilities, isError: isCapabilitiesError
    } = useCapabilities();'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-simulation-subject.ts read `nowhere` — import
    { useCapabilities } from "./use-capabilities";'
  observed_at:
  - src/hooks/use-simulation-subject.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at the useCaseInputRequirements(slug, version) call,
    lines 63-68 — const { requirements, capabilitiesWithMalformedInputSchema, ... } = useCaseInputRequirements(slug,
    version);'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: domain/glossary/action
  conforms: true
  how: "src/hooks/use-glossary-vocabulary.ts: held at the GlossaryVocabulary union — export type GlossaryVocabulary\
    \ =\n  | \"outcome\"\n  | \"action\"\n  | \"recipient\"\n  | \"subject-type\";\nsrc/routes/glossary-browser-screen.tsx:\
    \ held at the \"action\" tab trigger and its VocabularyPanel instance — <TabsTrigger value=\"action\"\
    >Actions</TabsTrigger>\n...\n<VocabularyPanel\n  vocabulary=\"action\"\n  emptyMessage=\"The glossary\
    \ currently holds no actions.\"\n  loadErrorMessage=\"Unable to load actions.\"\n/>"
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/concept
  conforms: true
  how: "src/routes/glossary-browser-screen.tsx: held at the \"concepts\" tab trigger and its ConceptsPanel\
    \ instance — <TabsTrigger value=\"concepts\">Concepts</TabsTrigger>\n...\n<TabsContent value=\"concepts\"\
    >\n  <ConceptsPanel />\n</TabsContent>"
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/outcome
  conforms: true
  how: "src/hooks/use-glossary-vocabulary.ts: held at the GlossaryVocabulary union — export type GlossaryVocabulary\
    \ =\n  | \"outcome\"\n  | \"action\"\n  | \"recipient\"\n  | \"subject-type\";\nsrc/routes/glossary-browser-screen.tsx:\
    \ held at the \"outcome\" tab trigger and its VocabularyPanel instance — <TabsTrigger value=\"outcome\"\
    >Outcomes</TabsTrigger>"
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/recipient
  conforms: true
  how: "src/hooks/use-glossary-vocabulary.ts: held at the GlossaryVocabulary union — export type GlossaryVocabulary\
    \ =\n  | \"outcome\"\n  | \"action\"\n  | \"recipient\"\n  | \"subject-type\";\nsrc/routes/glossary-browser-screen.tsx:\
    \ held at the \"recipient\" tab trigger and its VocabularyPanel instance — <TabsTrigger value=\"recipient\"\
    >Recipients</TabsTrigger>"
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: "src/hooks/use-glossary-vocabulary.ts: held at the GlossaryVocabulary union — export type GlossaryVocabulary\
    \ =\n  | \"outcome\"\n  | \"action\"\n  | \"recipient\"\n  | \"subject-type\";\nsrc/routes/case-simulation-subject-panel.tsx:\
    \ held at the vocabulary-options hook call and the Select bound to it, lines 23 and 32-36 — useGlossaryVocabularyOptions(\"\
    subject-type\")\nsrc/routes/glossary-browser-screen.tsx: held at the \"subject-type\" tab trigger\
    \ and its VocabularyPanel instance — <TabsTrigger value=\"subject-type\">Subject types</TabsTrigger>"
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/case-simulation-subject-panel.tsx
  - src/routes/glossary-browser-screen.tsx
- node: domain/integration/capability
  conforms: true
  how: 'src/routes/case-simulation-subject-panel.tsx: held at the per-field capability list (lines 94-108)
    and the malformed-capability list (lines 124-131) — ← {capability.connector} ({capability.name} {capability.version})'
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/investigation/subject
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at the subject object, lines 91-94 — const subject:
    SimulationSubject = { type: source.subject, attributes: composedAttributes(requiredFields) };

    src/routes/case-simulation-subject-panel.tsx: held at the read-only Select bound to state.subject.type
    (line 34) — value={state.subject.type}'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/investigation/subject-attribute-value
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-simulation-subject.ts, src/routes/case-simulation-subject-panel.tsx,
    and src/hooks/use-glossary-vocabulary.ts read `nowhere` — the GlossaryVocabulary union — outcome,
    action, recipient, subject-type — names no attribute/value pair, and no other construct in the file
    assembles an attribute name paired with a value; the hook only lists governed vocabulary terms. —
    a binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/knowledge/case-input-requirement
  conforms: false
  how: "src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts, the\
    \ twoRequirementsResponse fixture, lines 27-35: requirements: [\n  { attribute: \"account-id\", required:\
    \ true, capabilities: [] },\n  { attribute: \"escalation-flag\", required: false, capabilities: []\
    \ },\n], — The fixture models a case-input-requirement carrying zero asking capabilities, for both\
    \ the required and the optional attribute driving criterion 1 and criterion 2. A reader treating this\
    \ proof as documentation of the wire shape learns that an entry can exist without a capability behind\
    \ it; the domain node the entry answers to says the opposite — an attribute no currently-registered\
    \ capability asks for is not a requirement at all — so a future read that produced such an entry through\
    \ a real defect would pass unnoticed against this fixture rather than being caught by it.\nsrc/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts,\
    \ twoRequirementsResponse() and threeRequirementsResponse(), lines 21-22 and 31-33: { attribute: \"\
    account-id\", required: true, capabilities: [] },\n{ attribute: \"escalation-flag\", required: false,\
    \ capabilities: [] }, — The node holds a case-input-requirement to at least one asking capability\
    \ — \"never fewer than one, since an attribute nobody currently asks for is not a requirement at all\"\
    \ — but every requirement entry these fixtures hand the hook carries capabilities: []. A reader who\
    \ takes these two response builders as a model of what a case-input-requirements read actually returns\
    \ learns a shape the specification says cannot occur.\nsrc/routes/case-simulation-subject-panel.spec.ts,\
    \ the last it() in the describe block \"every asking capability for a requirement is shown by its\
    \ own name, version and connector, never only one (criterion 4)\", lines 166-173: it(\"renders no\
    \ capability list under a requirement whose own capabilities array is empty (edge case: no currently-registered\
    \ capability resolves)\", async () => {\n    await renderPanel(\n      baseState({ requiredFields:\
    \ [buildRequiredField({ attribute: \"account-id\", capabilities: [] })] }),\n    );\n    const [row]\
    \ = requirementRows();\n    expect(within(row).queryByRole(\"list\")).toBeNull();\n  }); — domain/knowledge/case-input-requirement\
    \ declares its capabilities relationship 1..* and says\noutright that \"an attribute nobody currently\
    \ asks for is not a requirement at all\" — a\nrequirement the derivation produces at all always names\
    \ at least one asking capability.\nThis test builds and locks in rendering behavior for exactly the\
    \ state the node says cannot\noccur: a present requirement with a zero-length capabilities array,\
    \ calling it a legitimate\n\"edge case.\" Any future branch written to satisfy this test would have\
    \ no node behind it.\nsrc/routes/case-simulation-subject-panel.tsx, the header preceding the required-fields\
    \ list, line 69: Required by the connectors: — The list under this header is populated from state.requiredFields,\
    \ whose per-field entries are then shown alongside the currently-registered capabilities that ask\
    \ for the attribute — each already labelled with its own connector. The header instead names the connector\
    \ as the thing an attribute is \"required by\". A reader maintaining this panel who takes the header\
    \ at its word could dedupe or key the section by connector identity, when the requirement's own cardinality\
    \ (1..* per domain/knowledge/case-input-requirement) and its derivation are per-capability, not per-connector\
    \ — a connector is only a string a capability declares, not an entity that itself asks for anything."
  observed_at:
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: domain/knowledge/case-version
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-simulation-subject.ts read `nowhere` — export
    function useSimulationSubject(source, slug: string, version: number): SimulationSubjectState {'
  observed_at:
  - src/hooks/use-simulation-subject.ts
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-glossary-vocabulary.ts read `nowhere` — isError:
    query.isError, — the hook exposes one generic error flag for any failure of the GET, with no branch
    reading or distinguishing a 404/VocabularyTermNotHeldError response from any other failure.; src/routes/glossary-browser-screen.tsx
    read `nowhere` — the only reads this file performs are the plural, listing forms; there is no by-name
    term or concept read, and so no refusal path for one, anywhere in this component'
  observed_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/glossary-browser-screen.tsx
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at requiredFields, lines 83-89 — const requiredFields:
    SimulationRequiredField[] = definitions.map((definition) => ({ ...definition, ... }));

    src/routes/case-simulation-subject-panel.tsx: held at the field list rendering both required and optional
    inputs with the required flag carried through unchanged, lines 76-93 — {field.required && (<span aria-hidden="true"
    className="text-destructive">'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
  conforms: true
  how: 'src/routes/case-simulation-subject-panel.tsx: held at the malformed-capability disclosure block,
    lines 116-134 — Asking for nothing at all — their own stored input schema holds no well-formed shape:'
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
- node: rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
  conforms: true
  how: 'src/routes/case-simulation-subject-panel.tsx: held at the empty-set branch, lines 70-73 — The
    pinned case version''s own case-input-requirements name no attribute.'
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
- node: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at isReady, line 96 — never inspects an individual field''s
    required flag or fill state — const isReady = requester.trim() !== "" && subject.attributes.length
    > 0;'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: rules/investigation/a-simulation-carries-its-requester
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at the requester state and isReady, lines 81, 96, 101-102
    — const [requester, setRequester] = useState("");'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at isReady, line 96 — const isReady = requester.trim()
    !== "" && subject.attributes.length > 0;'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: rules/investigation/a-subject-holds-one-value-per-attribute
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-simulation-subject.ts, and src/routes/case-simulation-subject-panel.tsx
    read `nowhere` — this file only renders one input per already-distinct field.attribute key; the first-recorded-wins
    dedup itself is not present here. — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-simulation-subject.ts
  - src/routes/case-simulation-subject-panel.tsx
- node: rules/investigation/an-empty-attribute-input-is-no-attribute-value
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at composedAttributes, line 50 — if (field.value.trim()
    === "" || attributeMap.has(field.attribute)) { continue; }'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-glossary-vocabulary.ts read `nowhere` — the file''s
    whole body concerns only fetching and mapping one vocabulary''s terms for a select control; it names
    no case version, hypothesis-revision, or ConceptNotInGlossaryError.; src/routes/glossary-browser-screen.tsx
    read `nowhere` — the file''s imports are Button, Tabs/TabsContent/TabsList/TabsTrigger, StatusTable
    and its types, useGlossaryVocabularyOptions/GlossaryVocabulary, and ConceptsPanel — nothing referencing
    a case version or hypothesis-revision'
  observed_at:
  - src/hooks/use-glossary-vocabulary.ts
  - src/routes/glossary-browser-screen.tsx
- node: scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
  conforms: true
  how: 'src/routes/case-simulation-subject-panel.tsx: held at the malformed-capability disclosure block,
    lines 116-134 — {state.capabilitiesWithMalformedInputSchema.map((capability) => ('
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
- node: scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
  conforms: true
  how: 'src/hooks/use-simulation-subject.ts: held at requiredFields, lines 83-89 — const requiredFields:
    SimulationRequiredField[] = definitions.map((definition) => ({ ...definition, ... }));'
  encoded_at:
  - src/hooks/use-simulation-subject.ts
unstated:
- file: src/hooks/use-simulation-subject.ts
  where: composedAttributes, line 50
  evidence: if (field.value.trim() === "" || attributeMap.has(field.attribute)) {
  cost: An attribute input made of only spaces is silently treated the same as an untouched, truly empty
    input — dropped from the assembled subject and from the count isReady uses. The specification's own
    decided reading of an empty attribute input is scoped to the empty string exactly; whitespace-equivalence
    for this field is decided nowhere, so the next reader who wants to know what counts as "no attribute-value"
    here will find only the literal empty string in the specification and a wider rule living only in
    this file.
- file: src/hooks/use-simulation-subject.ts
  where: isReady, line 96
  evidence: const isReady = requester.trim() !== "" && subject.attributes.length > 0;
  cost: A requester made of only whitespace is treated as no requester for readying a simulate call. rules/investigation/a-simulation-carries-its-requester
    states only "a call whose payload carries no requester, or an empty one, is refused" — none of the
    specification's four scoped empty-string readings is stated with a whitespace extension for this field.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
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
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
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
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
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
unbound:
- src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
- src/hooks/use-glossary-vocabulary.spec.ts
- src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
- src/hooks/use-simulation-subject.spec.ts
- src/routes/case-simulation-subject-panel-attributes.spec.ts
- src/routes/case-simulation-subject-panel-json-view.spec.ts
- src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
- src/routes/case-simulation-subject-panel.spec.ts
- src/routes/case-simulation-subject-panel.test-support.ts
- src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
- src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
- src/routes/glossary-browser-screen.spec.ts
- src/routes/glossary-browser-screen.test-support.ts
notes: 'Judged by 17 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/subject-attribute-glossary-removal-frontend.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/investigation/subject-attribute-value,
  domain/knowledge/case-input-requirement, rules/investigation/a-composed-subject-presents-every-case-input-requirement,
  rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set, rules/investigation/a-subject-holds-one-value-per-attribute,
  rules/glossary/a-glossary-read-by-an-unheld-name-is-refused, rules/investigation/an-empty-attribute-input-is-no-attribute-value
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  domain/glossary/subject-attribute is bound to src/hooks/use-glossary-vocabulary.ts and the specification
  no longer holds it; no judge was handed it, and --prune is its route.

  domain/glossary/subject-attribute is bound to src/routes/case-simulation-subject-panel.tsx and the specification
  no longer holds it; no judge was handed it, and --prune is its route.

  rules/investigation/a-subject-attribute-is-drawn-from-the-glossary is bound to src/routes/case-simulation-subject-panel.tsx
  and the specification no longer holds it; no judge was handed it, and --prune is its route.

  domain/glossary/subject-attribute is bound to src/routes/glossary-browser-screen.tsx and the specification
  no longer holds it; no judge was handed it, and --prune is its route.

  Candidates: 17 opened across 6 of 17 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 5 fact(s) the source states that no node holds, over 3 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/subject-attribute-glossary-removal-frontend.returns/`, which are the evidence behind every entry above.

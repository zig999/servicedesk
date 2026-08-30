---
title: Connector test panel placeholder attributes, first review
summary: What four passes found over the parallel-delivered extraction of placeholder-parsing
  primitives and the configurationText prop route.
reviewed:
- src/shared/services/connector-placeholder-token.ts
- src/shared/services/connector-placeholder-token.spec.ts
- src/services/simulation-subject-derivation.ts
- src/hooks/use-test-connector-panel.ts
- src/routes/connector-test-panel.tsx
- src/routes/connector-configuration-detail-ready-view.tsx
- src/routes/connector-configuration-form-dialog.tsx
- src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
- src/routes/connector-test-panel-forwards-configuration-text.spec.ts
- src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
tasks:
- task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing
- task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed cleanly (all 8 steps), so there was no failure
    to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: A module under frontend/app/src/shared/services/ exports the placeholder
    regex, the kind/argument split at the first ':', and the filter keeping only kind
    === "subject" that simulation-subject-derivation.ts used to declare directly.
  state: covered
  tests:
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: finds every placeholder occurring anywhere inside one string value, in the
      order they occur
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: finds no match inside a string that carries no '${...}' token at all
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: splits an ordinary '${subject:attribute-name}' token into its kind and its
      argument
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: splits a bare token with no argument, such as '${subject}' with no ':' at
      all, to that whole token as its kind and no argument
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: splits a token whose argument is empty, such as '${subject:}', to an empty-string
      argument rather than undefined
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: splits a token carrying more than one ':' at the first one only, keeping
      every later ':' as part of the argument
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: accepts a split token naming the subject kind with a non-empty argument
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: rejects a bare '${subject}' token that names no argument at all
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: rejects a '${subject:}' token whose argument is present but empty
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: rejects a non-subject kind such as a bare '${requester}' token
  - file: src/shared/services/connector-placeholder-token.spec.ts
    name: rejects a non-subject kind that does carry an argument, such as '${credential:x}'
- criterion: simulation-subject-derivation.ts imports these primitives from that new
    module rather than declaring them itself.
  state: uncovered
  why: This is a fact about the shape of the source (import versus re-declaration),
    not about behavior. Every test in the set exercises subjectPlaceholderNamesInConfiguration
    and deriveRequiredFields only through their observable output; none would fail
    if simulation-subject-derivation.ts stopped importing the primitives and instead
    re-declared identical copies inline, since both versions would behave identically
    under every assertion the set makes.
- criterion: simulation-subject-derivation.spec.ts and use-simulation-subject.spec.ts
    pass unchanged, evidencing subjectPlaceholderNamesInConfiguration's own observable
    behavior did not change.
  state: covered
  tests:
  - file: src/services/simulation-subject-derivation.spec.ts
    name: resolves a concept the collection plan names to the capability currently
      registered for it and that capability's own connector, annotating the derived
      field with both
  - file: src/services/simulation-subject-derivation.spec.ts
    name: returns one required field per distinct attribute name even where the same
      placeholder is repeated across the address and the body of one connector's own
      configuration
  - file: src/services/simulation-subject-derivation.spec.ts
    name: reads a placeholder embedded in the connector's own declared address
  - file: src/services/simulation-subject-derivation.spec.ts
    name: reads a placeholder embedded in the connector's own declared query
  - file: src/services/simulation-subject-derivation.spec.ts
    name: reads a placeholder embedded in the connector's own declared headers
  - file: src/services/simulation-subject-derivation.spec.ts
    name: reads a placeholder embedded anywhere inside the connector's own declared
      body, including nested inside an array
  - file: src/services/simulation-subject-derivation.spec.ts
    name: recognizes and skips a requester or credential placeholder rather than reading
      it as a subject attribute
  - file: src/services/simulation-subject-derivation.spec.ts
    name: contributes no name for a token missing the ':<argument>' the subject kind
      requires, or carrying an empty one
  - file: src/services/simulation-subject-derivation.spec.ts
    name: contributes zero placeholder names for a connector configuration whose own
      registered text does not parse as a well-formed JSON object (this module's own
      inference)
  - file: src/hooks/use-simulation-subject.spec.ts
    name: includes a curator-added attribute in the assembled subject, as one {attribute,
      value} pair beside the filled derived required field
  - file: src/hooks/use-simulation-subject.spec.ts
    name: turns ready once every derived required field and the requester hold a non-empty
      value
  - file: src/hooks/use-simulation-subject.spec.ts
    name: computes the same subject and the same readiness from two independently
      mounted instances given the same version, registries and typed values -- the
      single instance a screen shares between both dispatches has nothing of its own
      that could make the two diverge
- criterion: Configuration text that is not valid JSON, or not a plain object, still
    resolves to no placeholders through the extracted primitives, exactly as before
    the extraction.
  state: partial
  tests:
  - file: src/services/simulation-subject-derivation.spec.ts
    name: contributes zero placeholder names for a connector configuration whose own
      registered text does not parse as a well-formed JSON object (this module's own
      inference)
  why: Only the "not valid JSON" half of the criterion is exercised (configuration
    text a plain un-parseable string). Nothing in the set calls subjectPlaceholderNamesInConfiguration
    or deriveRequiredFields with text that parses as valid JSON but is not a plain
    object (an array, a bare string, a number, a boolean or null), so that half of
    the criterion is unexercised.
- criterion: ConnectorConfigurationDetailReadyView passes its own live state.configuration.value
    text into ConnectorTestPanel through a new configurationText prop.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
    name: passes the loaded configuration's own current text as configurationText,
      scoped to this route's own connector
  - file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
    name: passes the edited text once the operator changes Configuration, rather than
      only the value loaded at mount (its own live value)
- criterion: ConnectorTestPanel forwards configurationText into useTestConnectorPanel(connector,
    configurationText).
  state: covered
  tests:
  - file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
    name: forwards exactly its own connector and configurationText props as useTestConnectorPanel's
      two positional arguments
  - file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
    name: 'forwards an empty configurationText exactly as an empty string, not as
      undefined or a placeholder (edge case: empty input)'
  - file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
    name: forwards a re-rendered configurationText prop into the hook's own second
      argument again, not only at first mount (its own live value)
- criterion: Every existing caller of useTestConnectorPanel's returned state and handlers
    continues to compile and behave exactly as before, aside from the hook now accepting
    the new argument.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: offers the matching capability and omits one registered against a different
      connector
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: 'shows an alert rather than silently offering no options when the capabilities
      read itself fails (edge case: a dependency that fails)'
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: offers exactly the subject-type vocabulary's own current terms as options,
      once the read resolves
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: lets the operator add an attribute row and type its own attribute name and
      value
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: removes exactly the row whose own Remove action was clicked, leaving the
      other rows' own values intact (stable-row-identity inference)
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the method, resolved address, headers and body exactly as the response
      echoed them back
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the status, elapsed time, headers and body exactly as the response
      carried them
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows only the elapsed time for a timed-out call, with no status or body
      rendered as though a response had arrived
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: issues no further read of the connectors, capabilities or subject-type vocabulary
      after a completed test call
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: renders the Test button disabled, and issues no call, before any field has
      been filled
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: issues only one POST /v1/test-connector call when Test is clicked twice
      before the first call settles
- criterion: connector-configuration-form-dialog.tsx's own ConnectorTestPanel call
    site supplies a configurationText value so the file continues to type-check and
    compile.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
    name: mounts its own Test section, forwarding this dialog's own currently-typed
      Configuration text into it -- the same field this dialog already reads at configuration={state.configuration}
  why: 'The test proves a genuine, non-undefined configurationText value reaches the
    call site. It cannot exercise the "continues to type-check and compile" half:
    vitest''s transform does not type-check. That half is proven instead by this review''s
    own captured run (typecheck step passed), not by a test in this set.'
findings:
- pass: standard
  file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  where: lines 28-35, the vi.mock of ./connector-test-panel
  cites: TST-03
  evidence: "vi.mock(\"./connector-test-panel\", () => ({\n  ConnectorTestPanel: (props:\
    \ { connector: string; configurationText: string }) =>\n    createElement(\n \
    \     \"p\",\n      { \"data-testid\": \"connector-test-panel-stub\" },\n    \
    \  `connector-test-panel-stub-received:${props.connector}:${props.configurationText}`,\n\
    \    ),\n}));"
  cost: The whole ConnectorTestPanel component -- its own rendering logic, not a network,
    storage or clock boundary -- is replaced by a stand-in that renders fabricated
    markup. Nothing of the real component's own render tree executes under this test,
    so the suite keeps passing even if ConnectorTestPanel's actual JSX were deleted
    or broken; it asserts only that a prop value was forwarded, using a substitute
    for the very thing route composition is meant to prove.
  correction: Observe the forwarded value through a boundary stand-in only (e.g. a
    spy on the network call the real ConnectorTestPanel eventually reaches once configurationText
    is read), or accept that this plumbing is not independently observable and drop
    the assertion rather than fabricate an observation point by replacing the component.
- pass: standard
  file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  where: lines 21-44, the vi.mock of ../hooks/use-test-connector-panel
  cites: TST-03
  evidence: "vi.mock(\"../hooks/use-test-connector-panel\", () => ({\n  useTestConnectorPanel:\
    \ (connector: string, configurationText: string) => ({\n    ...\n    requester:\
    \ `received:${connector}:${configurationText}`,\n    ...\n  }),\n}));"
  cost: useTestConnectorPanel is the hook this task's own header comment names as
    holding all business logic (capability filtering, subject assembly, dispatch)
    -- none of that is a network, storage or clock boundary. Replacing the whole hook
    means the test exercises none of its real behavior; it reads a value smuggled
    through a hand-built requester field on a fake return object, so a change to the
    real hook's own dispatch or state logic cannot be caught by this file at all.
  correction: Reach the forwarded value through the one real boundary the hook eventually
    crosses (the mutation's request body), rather than substituting the hook itself.
- pass: standard
  file: src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
  where: lines 29-61, the vi.mock of ../hooks/use-test-connector-panel
  cites: TST-03
  evidence: "vi.mock(\"../hooks/use-test-connector-panel\", () => ({\n  useTestConnectorPanel:\
    \ (connector: string, configurationText: string) => ({\n    ...\n    selectedCapability:\
    \ {\n      name: \"stub-capability\",\n      ...\n      input_schema: `received:${connector}:${configurationText}`,\n\
    \      ...\n    },\n    ...\n  }),\n}));"
  cost: Same substitution as the sibling file above, over the same hook -- the whole
    useTestConnectorPanel is replaced rather than only a boundary it crosses, and
    the value is smuggled here through a fabricated selectedCapability.input_schema
    field so a real capability's own shape is never exercised by this test either.
  correction: Same as the sibling file -- observe the forwarded value at a real boundary
    the hook crosses, not by replacing the hook's own return value.
---

## What it is
Four passes over the parallel-delivered integration of two tasks: extract-connector-placeholder-parsing and route-configuration-text-to-test-panel, merged from two git worktrees into main.
Coverage pairs each of the 8 stated criteria with the tests that would fail if it stopped holding; conformance reads the file set against the specification nodes the tasks implement; standard reads the file set against the project's own frontend-typescript.yaml; failures did not run because the captured run (install, typecheck, lint, style, build, a11y, secret-scan, test) passed cleanly end to end.

## Notes
This review is the integration gate the parallel-worktree delivery route calls for: each task passed its own suite alone, in its own worktree, before either was merged -- this run is the first time both tasks' files were built and tested together.
The three standard-pass findings (TST-03, over the three new configurationText-forwarding spec files) were already disclosed by the implementing task's own proof record as divergences, for the same reason the standard-conformance-reviewer independently arrived at: configurationText is a value the real hook deliberately does not read yet, so no real component/hook boundary exists to observe it through -- the standard pass was not shown that disclosure and reached the same three findings reading the source fresh.
The coverage pass's two partial states are not gaps in what was verified: one half of each partial criterion is proven by this review's own captured run rather than by a spec test -- the "not a plain object" half of the JSON-validity criterion has no test exercising an array/string/number/boolean/null configuration text (only the not-valid-JSON half is tested), and the "continues to type-check and compile" half of the form-dialog criterion is proven by the captured run's own passing typecheck step, which vitest's transform does not exercise.
This review does not audit the pre-existing, unrelated trace drift the target tree already carries (151 code-drift findings across 20 files, 110 of them suppressed as frontend's own edits_freely declaration, plus 1 moved binding) -- that is reported below as the trace section states, and is nothing this review's four passes were asked to settle.

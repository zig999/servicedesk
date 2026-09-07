---
title: Review — the detail hook knows a configuration's validity before it reports ready
summary: Coverage, specification-conformance, standard-conformance and failures passes over the connector-configuration-validity-race
  initiative's one delivered task.
reviewed:
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-connector-configuration-detail-validity.spec.ts
tasks:
- task/connector-configuration-validity-race/hook-computes-validity-before-ready
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
run: run/connector-configuration-validity-race
failures_counted: 1
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/connector-configuration-validity-race.md
coverage:
- criterion: At the moment the hook's outcome first reports the ready phase, the isValid it carries reflects
    the loaded configuration's own text rather than a value the hook has not yet corrected.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: useConnectorConfigurationDetail — the very first render reporting the ready phase already reflects
      a non-object configuration's invalidity > carries configuration.isValid as false in the render log's
      first ready entry when the loaded configuration parses as $label rather than an object
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: useConnectorConfigurationDetail — the very first render reporting the ready phase already reflects
      an object configuration's validity > carries configuration.isValid as true in the render log's first
      ready entry when the loaded configuration parses as a JSON object
- criterion: A loaded connector configuration whose text does not parse to a plain object — a bare string,
    an array, a number, a boolean or null among them — is reported as not valid at every reading of the
    ready outcome, including the first.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: useConnectorConfigurationDetail — configurationValid rejects a non-object parsed value right
      after load (criterion 1) > reads configuration.isValid as false when the loaded configuration parses
      as $label rather than an object
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: useConnectorConfigurationDetail — the very first render reporting the ready phase already reflects
      a non-object configuration's invalidity > carries configuration.isValid as false in the render log's
      first ready entry when the loaded configuration parses as $label rather than an object
- criterion: A loaded connector configuration whose text parses to a plain object is reported as valid
    at every reading of the ready outcome, including the first.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: useConnectorConfigurationDetail — configurationValid continues to read true for an object right
      after load (criterion 2) > reads configuration.isValid as true when the loaded configuration parses
      as a JSON object
  - file: src/hooks/use-connector-configuration-detail-validity.spec.ts
    name: useConnectorConfigurationDetail — the very first render reporting the ready phase already reflects
      an object configuration's validity > carries configuration.isValid as true in the render log's first
      ready entry when the loaded configuration parses as a JSON object
findings:
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: isValidConfigurationObject, lines 14-21, and the submit guard at lines 119-124
  evidence: return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  cost: The registry's own well-formedness criteria — must parse as JSON, must be an object, neither null
    nor an array — is re-derived independently here to gate submission, rather than the hook submitting
    and surfacing the server's own refusal. If the invariant's definition ever changes at rules/integration/a-connector-configuration-holds-a-well-formed-object,
    a reader who updates only the specification has no reason to know this file also encodes the same
    test, and the two can silently diverge — the client accepting or rejecting something the registry
    no longer agrees with.
  correction: Submit and surface the registry's own refusal, rather than re-deriving the invariant's test
    in the client to gate the submission.
- pass: standard
  cites: STA-01
  file: src/hooks/use-connector-configuration-detail.ts
  where: useConnectorConfigurationDetail, lines 55-61, the syncedConfigurationData state and the render-body
    sync block
  evidence: "const [syncedConfigurationData, setSyncedConfigurationData] = useState(query.data);\nif (query.data\
    \ !== syncedConfigurationData) {\n  setSyncedConfigurationData(query.data);\n  if (query.data) {\n\
    \    setConfigurationValid(isValidConfigurationObject(query.data.configuration));\n  }\n}"
  cost: 'The hook now carries two representations of the same fetched value: react-query''s cache entry
    and this mirrored copy, kept in step by a hand-written comparison instead of by reading the cache
    directly. The same responsibility — react to query.data changing — is already handled by the useEffect
    a few lines below, so there are two independent paths that must agree; whichever one a future change
    updates and the other does not leaves configurationValid disagreeing with what the cache actually
    holds.'
  correction: Drop the syncedConfigurationData mirror and derive configurationValid from query.data directly,
    rather than duplicating that dependency tracking with a second piece of state.
- pass: failures
  cause: setup
  file: src/routes/version-manifest-screen-reorder.spec.ts
  where: VersionManifestScreen — reordering (criterion 3) > issues one PUT naming the neighbor's own current
    position when an enabled up control is clicked, and a 204 re-renders the list in the new order, line
    41
  evidence: 'TestingLibraryElementError: Unable to find a label with the text of: H1 — at src/routes/version-manifest-screen-reorder.spec.ts:41:18,
    preceded by repeated Error: Not implemented: window.scrollTo from @tanstack/react-router''s scroll-restoration
    path'
  cost: A single mount-settle guard timed out in a route the file set under review never touched — version-manifest-screen
    reordering, not connector configuration — while five sibling tests using the identical findByLabelText
    guard in the same file and the same run passed; nothing about the reviewed hook or its spec is implicated,
    and the finding gives no signal about the change under review either way.
  correction: Nothing about connector-configuration-detail changes here. If this recurs it belongs to
    whoever owns VersionManifestScreen reordering — either raise the guard's wait timeout, or wait on
    the row's own settle condition instead of a label lookup that races router scroll-restoration under
    load.
---

## What it is
The review of the connector-configuration-validity-race initiative's one task: whether its tests prove its criteria, whether its source states only what the specification holds, whether it follows the project's own standard, and why the captured run failed.

## Notes
All three criteria came back covered, and the coverage pass confirmed the point the delivery was written for: the two render-log tests fail deterministically against the pre-fix implementation, on every run and for each of the five shapes, rather than only when timing exposes the race.
It also routed two facts rather than states: only the true literal is loaded as a boolean, so an implementation treating false differently would pass, and every reading is pinned at two commits rather than at all of them, so an implementation oscillating across intermediate commits would pass.
The standard finding is against the correction itself: the render-time guard mirrors query.data into its own state, which is a second representation of a cached value beside a useEffect that already tracks the same dependency.
The conformance finding is older than this delivery — isValidConfigurationObject predates it — and this is the first time a judge read it against the node it re-derives.
The captured run went red on one test of 1188, in a route this change never touched, diagnosed as setup; the review reports it and settles nothing about it.
The conformance pass cleared 2 of the 3 node-file pairs it read and restamped them; it did not clear rules/integration/a-connector-configuration-holds-a-well-formed-object, held by the conformance finding above.

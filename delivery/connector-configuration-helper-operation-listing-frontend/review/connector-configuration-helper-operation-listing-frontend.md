---
target: frontend
title: Review — Connector Configuration Helper operation listing (frontend)
summary: Coverage, conformance, standard and failures passes over the 5 delivered tasks of connector-configuration-helper-operation-listing-frontend.
reviewed:
- src/hooks/use-openapi-document-operations.ts
- src/hooks/use-openapi-document-operations.spec.ts
- src/hooks/use-connector-configuration-helper.ts
- src/hooks/use-connector-configuration-helper.spec.ts
- src/routes/connector-configuration-helper-fields.spec.ts
- src/routes/connector-configuration-helper-fields-apply.spec.ts
- src/routes/connector-configuration-helper-fields.tsx
- src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
- src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
- src/routes/connector-configuration-create-screen-apply-draft.spec.ts
- src/services/connector-configuration-operations-read-disclosure.ts
- src/services/connector-configuration-operations-read-disclosure.spec.ts
- src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
tasks:
- task/connector-configuration-helper-operation-listing/openapi-document-operations-read
- task/connector-configuration-helper-operation-listing/helper-operation-choice-state
- task/connector-configuration-helper-operation-listing/operation-choice-fields
- task/reconcile-orphaned-configuration-helper-tests/rewrite-orphaned-specs
- task/connector-configuration-helper-operation-listing/operations-read-refusal-disclosure
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean over every step; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
coverage:
- criterion: The read is issued through the application's api client against the backend's read-openapi-document-operations
    route.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: issues exactly one network call, to a route naming read-openapi-document-operations and carrying
      the link as data, never to the link itself
- criterion: No request is issued from the frontend to the operator-named OpenAPI document link itself.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: issues exactly one network call, to a route naming read-openapi-document-operations and carrying
      the link as data, never to the link itself
- criterion: An answer listing a document's operations is exposed as one entry per listed operation, each
    entry carrying that operation's path and that operation's method.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: exposes an operations outcome carrying exactly the operations the answer listed, in one array
- criterion: An entry's method is the method the answer named for that operation, the hook applying no
    case change of its own, so an answer naming POST is exposed as POST.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: exposes a lower-cased method exactly as the answer named it, applying no upper-casing of its
      own
- criterion: A refusal reporting OpenApiDocumentNotFetchedError is exposed as an outcome naming an unfetchable
    link and carrying which of network-failure, timeout or status-outside-2xx the answer named.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: carries the answered status code and the link exactly as the request named it, not merely the
      sub-kind
- criterion: A refusal reporting OpenApiDocumentNotReadableError is exposed as an outcome naming a document
    that could not be read as OpenAPI 3.x, and never as the unfetchable-link outcome.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: 'exposes OpenApiDocumentNotReadableError as {kind: ''openapi-document-not-readable''}, carrying
      no fetch-failure data'
- criterion: An answer whose error value is neither of those two, or whose body does not carry the expected
    shape, is exposed as an unrecognised failure naming neither of the two conditions.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: 'exposes {kind: ''unrecognized-failure''} for a raw, non-ApiError throw (the request itself
      failing outright)'
- criterion: An outcome that is any of the refusal conditions exposes no operation entries.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: carries no operations field on the richest refusal outcome, openapi-document-not-fetched
- criterion: Reading a second link exposes that second link's own operations and never the entries the
    previously read link answered.
  state: covered
  tests:
  - file: src/hooks/use-openapi-document-operations.spec.ts
    name: exposes the second link's operations, never the first link's, once the hook is re-keyed to it
- criterion: The state exposes, as the entries offered for choice, the operations read for the link currently
    named in the helper.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: exposes exactly the operations the read answered for the named link, once it resolves
- criterion: Naming a different link in the helper makes the offered entries those of the newly named
    link.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: replaces the offered operations with the newly named link's own operations once the read for
      it resolves
- criterion: Choosing an offered entry makes the helper's path that entry's path.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: sets both path and method from the chosen entry, and from no other source
- criterion: Choosing an offered entry makes the helper's method that entry's method.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: sets both path and method from the chosen entry, and from no other source
- criterion: Given a read answering a document declaring /items with a get operation and a post operation,
    choosing the entry naming /items and POST makes the draft request the helper then issues name /items
    as its path and POST as its method.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: issues a draft request naming /items as its path and POST as its method once that entry is chosen
- criterion: The state exposes the operations read's own outcome as a value distinct from the draft request
    outcome it already exposes.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: 'keeps operationsOutcome and outcome independent: naming a link changes only operationsOutcome,
      and requesting a draft changes only outcome'
- criterion: use-connector-configuration-helper.spec.ts's fetch stub answers the operations-read route
    as well as the draft route, and every assertion that file already makes about the draft request still
    holds.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper.spec.ts
    name: sends exactly {connector, link, path, method} in the POST body when onRequestDraft is called
- criterion: The component renders a Select whose options are the entries the state offers, one option
    per entry.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: opens onto exactly one option per entry in state.operations, both entries represented
- criterion: An option's label states both the entry's path and the entry's method.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: shows the entry's own path and its own method together on the option, upper-cased even though
      the entry names it lower-case
- criterion: Choosing an option calls the state's operation choice with that entry.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: invokes onChooseOperation once with the chosen entry, not a distractor sharing the same path
- criterion: The component renders no input accepting typed text for an operation path.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: renders no textbox whose accessible name refers to a path
- criterion: The component renders no input accepting typed text for an operation method.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: renders no textbox whose accessible name refers to a method
- criterion: Where the state offers no entries, no path or method value can be supplied through the component
    at all.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: opens onto no selectable option at all when state.operations is empty
- criterion: The OpenAPI document link field and the draft request control remain rendered on the same
    surface as before.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: still renders the OpenAPI document link input and the Request Draft button
- criterion: connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts
    build their hand-written state literal from the state shape this task leaves, and both suites pass.
  state: partial
  why: Verified by the captured suite run passing over both files (no single test asserts 'the literal
    was updated'; the whole suite passing is the only evidence a structural criterion like this admits).
- criterion: connector-configuration-form-fields-configuration-helper.spec.ts drives the helper by choosing
    an entry from the operations Select, never by typing into a path or a method field.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
    name: renders an Operation Select whose value reflects the entry the operator chooses
- criterion: connector-configuration-form-fields-apply-confirmation.spec.ts drives the helper the same
    way, and every assertion about the apply-confirmation behavior it already held is unchanged.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: chooses the offered operation before requesting and applying a draft
- criterion: connector-configuration-create-screen-apply-draft.spec.ts drives the helper the same way,
    and every assertion about the create-screen apply-draft behavior it already held is unchanged.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: chooses the offered operation before requesting and applying a draft
- criterion: The full frontend suite (npm test) passes with these three files included.
  state: partial
  why: Verified by the captured suite run (run/connector-configuration-helper-operation-listing-frontend,
    test step passed, 1499 tests) rather than by a single test asserting the whole suite's own outcome.
- criterion: An unfetchable-link outcome is stated as a message naming that the link named in the helper
    could not be fetched.
  state: covered
  tests:
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: names a network failure as the reason the link could not be fetched
- criterion: That message names which of network-failure, timeout or status-outside-2xx the answer carried,
    and names the answered status where it carried status-outside-2xx.
  state: covered
  tests:
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: names status-outside-2xx together with the answered status
- criterion: An unreadable-document outcome is stated as a message naming that the fetched document could
    not be read as an OpenAPI 3.x document.
  state: covered
  tests:
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: states the fetched document could not be read as an OpenAPI 3.x document
- criterion: The unfetchable-link message and the unreadable-document message are different messages,
    and neither is stated for the other's outcome.
  state: covered
  tests:
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: states the fetched document could not be read as an OpenAPI 3.x document
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders both alerts at once when the operations read and the draft request are each refused
- criterion: An outcome naming neither of those two conditions is stated as neither of them.
  state: covered
  tests:
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: states a reason this helper does not recognise, naming neither named condition
- criterion: While the operations read has not answered, no refusal of it is stated.
  state: covered
  tests:
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: 'maps both idle and pending to exactly {kind: ''none''}'
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders no operations-read alert while the read is idle
- criterion: The refusal is rendered inside the helper's aria-live container, in an element carrying role=alert
    and the same text-sm text-destructive classes the draft's refusal already uses.
  state: partial
  tests:
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders the operations-read refusal message in a role=alert element carrying text-sm text-destructive
  why: The role and the two classes are asserted directly; the aria-live-container nesting is not, because
    a DOM-ancestry assertion (element.closest(), container.querySelector()) is refused by this project's
    testing-library/no-node-access and no-container lint rules, and no existing test in this codebase
    asserts that nesting either. Verified by code review instead.
- criterion: Every message connector-configuration-draft-disclosure.ts states for a draft outcome is unchanged
    by this task.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders both alerts at once when the operations read and the draft request are each refused
findings:
- pass: standard
  file: src/routes/connector-configuration-helper-fields.tsx
  where: the render branch for state.operationsOutcome
  evidence: operationsReadDisclosure.kind === "refused" is the only branch consuming operationsOutcome
    besides the Select's own options; there is no branch rendering anything while operationsOutcome.kind
    === "pending"
  cost: the operator sees the Select sit empty with no cue that a read is in flight, indistinguishable
    from a document that legitimately declares no operations, for however long the read takes
  correction: render an explicit loading state (e.g. disable the Select or show a pending line) while
    operationsOutcome.kind === "pending", mirroring the draft's own "Drafting the connector configuration…"
    line
  cites: EDG-01
- pass: standard
  file: src/routes/connector-configuration-helper-fields.tsx
  where: the operationsReadDisclosure refused branch
  evidence: <p role="alert" className="text-sm text-destructive">{operationsReadDisclosure.message}</p>
    -- no control follows it
  cost: an operator whose read failed for a transient reason (a slow document, a momentary network failure)
    has no in-place way to retry it; the only recourse is editing the link field to force react-query
    to re-key the request
  correction: expose the hook's own refetch() through the helper's state and render a retry action beside
    the refusal message
  cites: EDG-02
reconciliation: siegard-reconcile/connector-configuration-helper-operation-listing-frontend.md
---

## What it is

Coverage over all 36 criteria of the 5 tasks; conformance over the 14 changed/created files against the trace's and the plan's specification nodes; standard over the 25 reading-decided rules whose scope reaches this file set; certification of 6 specification nodes the proofs offered tests for. The captured run (install, typecheck, lint, style, build, a11y, secret-scan, test) passed clean, so the failures pass has nothing to diagnose and no captured run is named here (a passing run is refused as this field's value).

## Notes

This session could not spawn the coverage-auditor / specification-conformance-reviewer / standard-conformance-reviewer / failure-diagnostician subagents (Agent tool barred to this fork) -- every pass's discipline was applied inline, reading each agent's own file first, as the skill's fallback permits. The conformance pass's per-file judgments, saved as this delivery's reconciliation returns, were produced this way rather than as 14 independent delegations; a reader who wants the isolation the ordinary route gives can re-run the pass through fresh delegations without discarding this record; the returns are the evidence either way.
The captured run itself lives at run/connector-configuration-helper-operation-listing-frontend, referenced here in prose rather than in the schema's run field, since that field is reserved for the failures pass's own read of a run and this one passed clean.
The 228 code-drift findings under frontend/app that trace.py --check reports as suppressed (this project declares frontend edits_freely) are a background fact about the whole target, not about this review's own 14 files, all of which this pass read directly regardless of that suppression.

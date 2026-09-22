---
target: frontend
title: Version editor states a version that does not read back as a case — proof
summary: Tests the version editor's not-valid/load-error distinction, the manifest
  route it offers, and the four UNDERDETERMINED entries the task's own notes raised,
  against the three nodes this task implements.
implementation: sha256:2b754f7b940f151b4884031ec1bc1fba8e0230d5c87a28f216b797a2fb4cc603
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-version-editor-states-a-version-that-does-not-read-back-suite-4
tests:
- file: src/routes/case-version-editor-screen-not-valid.spec.ts
  name: CaseVersionEditorScreen — a version refused for validation states explicitly
    that it does not read back as a case... > renders the explicit statement and no
    attribute of the version or its manifest when validation refuses the read, renders
    neither that statement nor any load-error text once the same version reads back
    as a validated case
  proves: Criterion 1 (explicit not-read-back-as-a-case statement on a validation
    refusal) and criterion 2's refused-reading direction (the not-valid statement
    is never the load-error statement), together with the whole fact of rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case.
  fails_when: The not-valid statement is missing on the refused reading, the load-error
    text also appears there, an attribute or manifest entry the refusal's own body
    carries is rendered, or the not-valid statement appears once the version has read
    back as a validated case.
  demonstrates: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- file: src/routes/case-version-editor-screen-not-valid.spec.ts
  name: CaseVersionEditorScreen — no attribute of the version recovered from an earlier
    successful read still cached reaches the not-valid statement... > renders only
    the not-read-back-as-a-case statement, never an attribute of the version left
    over in the query cache from an earlier successful read, once a later reading
    of the same version is refused for validation
  proves: UNDERDETERMINED entry 1's cached-payload/earlier-successful-read variant
    — the implementation resolved this narrower than the criteria alone required.
  fails_when: An attribute of the version recovered from an earlier successful read
    still sitting in the query cache is rendered beside the not-valid statement.
- file: src/routes/case-version-editor-screen-not-valid.spec.ts
  name: CaseVersionEditorScreen — the route to this version's own manifest on the
    reading refused for validation (criterion 3) > renders a Manifest link targeting
    this same version's own manifest route on the same reading that refused the version
    for validation, with no successful read of the version having occurred first
  proves: Criterion 3, exactly as it states itself (the refused reading alone).
  fails_when: The manifest link is absent, or targets a different slug or version,
    on the reading refused for validation.
- file: src/routes/case-version-editor-screen-not-valid.spec.ts
  name: CaseVersionEditorScreen — the route to this version's own manifest is offered
    on every reading, not only the one refused for validation... > renders a Manifest
    link targeting this same version while the read is still pending, once it has
    failed to complete, once it has answered a validated case, and once it has been
    refused for validation alike
  proves: The whole fact of rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
    (route present on every reading, turning on nothing about the read's outcome or
    the version's state), as the implementation now delivers it across all four of
    the screen's own phases — loading, load-error, not-valid, and ready alike.
  fails_when: The manifest link is absent on any reading of the version editor — pending,
    failed, ready, or refused for validation.
  demonstrates: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
- file: src/routes/case-version-editor-screen-not-valid.spec.ts
  name: CaseVersionEditorScreen — a refusal carrying an error code the screen holds
    no presentation of its own for states only the read-did-not-complete statement...
    > renders only the fixed read-did-not-complete statement, never the not-valid
    statement, the refusal's own error code, its own message, or any attribute the
    refusal carries, when the version's own read fails with a code the screen holds
    no presentation of its own for
  proves: Criterion 4 and criterion 2's other direction (the load-error statement
    is never the not-valid statement), together with the whole fact of rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete.
  fails_when: The not-valid statement appears instead, or the refusal's own code,
    message, or any attribute it carries is rendered alongside the fixed statement.
  demonstrates: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- file: src/routes/case-version-editor-screen-not-valid.spec.ts
  name: CaseVersionEditorScreen — no attribute of the version recovered from an earlier
    successful read still cached reaches the read-did-not-complete statement... >
    renders only the read-did-not-complete statement, never an attribute of the version
    left over in the query cache from an earlier successful read, once a later reading
    of the same version fails with a code the screen holds no presentation of its
    own for
  proves: UNDERDETERMINED entry 4 — no attribute of the version, from any source including
    an earlier cached read, stands beside the incomplete-read statement.
  fails_when: An attribute of the version recovered from an earlier successful read
    still sitting in the query cache is rendered beside the read-did-not-complete
    statement.
not_applicable:
- edge_case: A read refused with CaseNotFoundError (an unknown version number).
  why: Flagged ADVISORY, not owed a test, by the task's own notes; the hook's pre-existing
    case-not-found handling (unchanged by this task, listed in the implementation
    record's preserved) redirects away before either the not-valid or load-error branch
    is ever reached, and criterion 4 explicitly decides this as written.
- edge_case: A save or a release mutation racing the version's own read.
  why: No criterion or node this task implements reaches a concurrent-mutation scenario;
    the mutation-side error handling (patchMutation, releaseMutation) is explicitly
    listed in the implementation record's preserved section as untouched by this task.
- edge_case: The refused version being draft versus released.
  why: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
    itself states the version's state does not narrow the route or the statement;
    a dimension that does not alter what an obligation requires is not multiplied,
    and neither the not-valid nor the load-error branch ever reads record.state before
    rendering.
- edge_case: More than one validator rule of validation-runs-at-every-read failing
    at once on the same version.
  why: The wire answers a single CaseVersionNotValidError code regardless of which
    or how many rules failed; the screen's classification does not vary by which rule
    triggered it.
- edge_case: A slug or version parameter containing characters needing URL-encoding.
  why: Pre-existing, unchanged encodeURIComponent handling inside the query's own
    queryFn; no criterion or node of this task touches request construction.
untested:
- 'new-case-draft-screen.tsx''s own ''not-valid'' render branch is not covered by
  a new test: per the implementation record, it exists only so TypeScript narrows
  the now-wider shared EditDraftVersionFormState before CaseVersionEditorReadyView
  reads ready-only fields, and its own create-draft logic is untouched. Its route
  (/cases/$slug/versions/new) names no version a reader chose, so the identity rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  and rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  constrain does not reach it; whether that screen owes its own manifest route across
  its four readings is left, by the implementation record''s own deferred entry, to
  whichever task claims it.'
- The inference that the 'not-valid' phase is named to match use-case-current-version-validity.ts's
  own vocabulary, the inference that the manifest route renders as a plain Link rather
  than a Button in every phase, and the inference that the 'loading' phase's return
  was widened from a bare <p> to a <section> wrapping the same text and the added
  Link, are all inferences about arrangement rather than about behavior; pinning any
  of them with a test would pin the arrangement the task was free to choose, not protect
  an obligation.
- The inference that the 'not-valid' phase renders no Retry control is an inference
  about behavior no criterion or node states one way or the other. Recorded here as
  unproven rather than pinned by a test asserting its absence.
---

## What it is
The proof for the version-editor task: case-version-editor-screen-not-valid.spec.ts covers the not-valid/load-error distinction, the manifest route, and the four UNDERDETERMINED entries the task's notes raised, plus a minimal test-support extension (a registered manifest child route, and an optional pre-seeded QueryClient parameter on mountCaseVersionEditor) needed to observe them.

## Notes
The "route offered on every reading" test originally stated the full fact of rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading against an implementation that had narrowed it to the refused reading alone, and failed on the first suite run. A failure-diagnostician read that failure against the specification and returned cause: code — the node requires the route on every reading, with no ambiguity. The task-implementer widened case-version-editor-screen.tsx accordingly, and this proof's pin was updated to the revised implementation record; the test now passes as originally written, and no disagreement remains recorded.

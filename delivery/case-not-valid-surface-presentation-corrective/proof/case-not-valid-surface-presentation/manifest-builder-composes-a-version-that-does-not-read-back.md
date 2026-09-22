---
target: frontend
title: Manifest builder states a version that does not read back as a case — proof
summary: Tests the manifest builder's not-valid/load-error distinction, the add-hypothesis
  offer across every reading the node declares (loading, load-error, not-valid, draft
  — empty or not — and withheld on released), and the manifest surface's own presentation
  for each composing refusal it names, against the four nodes this task implements
  and the four UNDERDETERMINED entries this task's notes raised.
implementation: sha256:7bccf7ca3a0e1a571db4d9ebe2a048033444fc3716c0355f381f11395837e1eb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-manifest-builder-composes-a-version-that-does-not-read-back-suite-3
tests:
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: VersionManifestScreen — a version refused for validation states explicitly
    that it does not read back as a case... > renders the explicit statement and no
    manifest entry when validation refuses the read, renders neither that statement
    nor any load-error text once the same version reads back as a validated case
  proves: Criterion 1 (explicit not-read-back-as-a-case statement on a validation
    refusal), criterion 2's refused-reading direction (the not-valid statement is
    never the load-error statement), and UNDERDETERMINED entry 2 (the statement is
    absent once the same version reads back cleanly), together with the whole fact
    of rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case.
  fails_when: The not-valid statement is missing on the refused reading, the load-error
    text also appears there, the refusal's own carried manifest entry is rendered,
    or the not-valid statement appears once the version has read back as a validated
    case.
  demonstrates: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: VersionManifestScreen — no manifest entry recovered from an earlier successful
    read still cached reaches the not-valid statement... > renders only the not-read-back-as-a-case
    statement, never a manifest entry left over in the query cache from an earlier
    successful read, once a later reading of the same version is refused for validation
  proves: UNDERDETERMINED entry 1 — a manifest builder that keeps rendering manifest
    entries recovered from the store or a prior read alongside the not-valid statement
    is exactly the implementation the specification refuses; this test fails over
    it.
  fails_when: A manifest entry recovered from an earlier successful read still sitting
    in the query cache is rendered beside the not-valid statement.
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: VersionManifestScreen — the add-hypothesis act on the reading refused for
    validation (criterion 3) > renders the + Add hypothesis link targeting this version's
    own new-hypothesis route on the reading refused for validation, with no successful
    read of the version having occurred first
  proves: Criterion 3, exactly as it states itself (the refused reading alone; the
    not-valid phase structurally carries no manifest content regardless of entry count,
    so the "including no entry at all" clause is reached by this one representative).
  fails_when: The add-hypothesis link is absent, or targets a different route, on
    the reading refused for validation.
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: VersionManifestScreen — the add-hypothesis act is offered on every reading
    short of one answering the version released... > renders the + Add hypothesis
    link while the read is pending, once it has failed to complete, once it has been
    refused for validation, once it has answered a draft version with entries and
    once with none, and withholds it only once it has answered a version released
  proves: The whole fact of rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions,
    as implemented — the offer present on loading, load-error, not-valid, and both
    an empty and a populated draft reading, and withheld exactly once the version
    reads back released (version-manifest-screen.tsx's ready branch now gates the
    link on `!state.isReleased`).
  fails_when: The add-hypothesis link is absent on any reading short of one answering
    the version released, or present once the version reads back released.
  demonstrates: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: VersionManifestScreen — a refusal carrying an error code the screen holds
    no presentation of its own for states only the read-did-not-complete statement...
    > renders only the fixed read-did-not-complete statement, never the not-valid
    statement, the refusal's own error code, its own message, or any value it carries,
    when the version's own read fails with a code the screen holds no presentation
    of its own for
  proves: Criterion 4 and criterion 2's other direction (the load-error statement
    is never the not-valid statement), together with the whole fact of rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete.
  fails_when: The not-valid statement appears instead, or the refusal's own code,
    message, or a value it carries (including a manifest entry) is rendered alongside
    the fixed statement.
  demonstrates: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- file: src/hooks/use-manifest-builder-unnamed-refusal-disclosure.spec.ts
  name: useManifestBuilder — a move refused for a reason this hook holds no classification
    of its own for discloses neither the refusal's own error code nor its own message...
    > raises only the fixed generic-failure toast, never the refusal's own error code
    or its own message, when a move is refused with a code other than the two this
    hook recognises
  proves: 'UNDERDETERMINED entry 3''s toast-payload half — a manifest builder that
    shows the raw error code or message for a place/remove refused with any other
    code is exactly the implementation the specification refuses; this test fails
    over it by inspecting what the toast mechanism itself was called with, which the
    screen-level DOM tests cannot observe (no Toaster is mounted in that harness).
    Move stands as one representative of "either act": place''s and remove''s onError
    handlers funnel every unclassified code through the same toast.error(GENERIC_FAILURE_MESSAGE)
    call, so the two are one class, not two boundaries.'
  fails_when: The toast raised for a move refused with an unrecognised code carries
    that code or its own message, instead of only the fixed generic text.
- file: src/routes/version-manifest-screen-remove-refusal-telling.spec.ts
  name: VersionManifestScreen — the manifest surface's own presentation for each composing
    refusal it names, and the generic notice for every other one... > states the position-occupied
    refusal and the would-hold-no-hypothesis refusal distinctly from each other, and
    discloses no code, message or value for a place or a remove refused with any other
    code
  proves: 'The whole fact of rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
    — a declared, finite transition set decided pairing by pairing: place refused
    as ManifestPositionOccupiedError states its own telling; remove refused as ManifestWouldHoldNoHypothesisError
    states its own telling, distinguishable from the first (this also carries UNDERDETERMINED
    entry 4, now resolved by use-manifest-builder.ts''s removeError state and version-manifest-screen.tsx''s
    matching role="alert" rendering); and a place or a remove refused with any other
    code shows neither named telling and discloses no raw code or message anywhere
    on screen (reinforcing UNDERDETERMINED entry 3''s DOM-observable half).'
  fails_when: The two named tellings are absent, identical, or indistinguishable from
    each other, or a place or a remove refused with an unrecognised code renders either
    named telling or discloses that code or its own message anywhere on screen.
  demonstrates: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
not_applicable:
- edge_case: A read refused with CaseNotFoundError (an unknown version number).
  why: Same class as any other code this screen holds no presentation for; already
    represented by the "SomeUnrecognizedError" test above.
- edge_case: A save or a release mutation racing the version's own read.
  why: No criterion or node this task implements reaches a concurrent-mutation scenario;
    the mutation-side error handling is explicitly listed in the implementation record's
    preserved section as untouched by this task.
- edge_case: The refused version being draft versus released.
  why: The not-valid phase never reads the version's own state at all — the hook's
    not-valid branch returns before any data, draft or released, could be consulted.
- edge_case: More than one validator rule of validation-runs-at-every-read failing
    at once on the same version.
  why: The wire answers a single CaseVersionNotValidError code regardless of which
    or how many rules failed; the screen's classification does not vary by which rule
    triggered it.
- edge_case: A slug or version parameter containing characters needing URL-encoding.
  why: Pre-existing, unchanged encodeURIComponent handling inside the query's own
    queryFn and the mutation URLs; no criterion or node of this task touches request
    construction.
- edge_case: The manifest holding more than one entry when the version fails validation.
  why: The not-valid phase structurally never renders manifest content regardless
    of how many entries the version's manifest holds; one representative covers it.
untested:
- The implementation record's own inference that the "not-valid" phase offers no Retry
  control, unlike "load-error", is an inference about behavior that no criterion or
  node states one way or the other. Recorded here as unproven rather than pinned by
  a test asserting its absence.
---

## What it is
The proof for the manifest-builder task: version-manifest-screen-not-valid.spec.ts covers the not-valid/load-error distinction and the add-hypothesis offer across readings, including the released-reading withholding; version-manifest-screen-remove-refusal-telling.spec.ts covers the manifest surface's own presentation for each composing refusal it names, as one comprehensive test over the node's whole transition set; use-manifest-builder-unnamed-refusal-disclosure.spec.ts covers the toast-payload half of the unnamed-refusal disclosure, which the DOM-only screen tests cannot observe. A minimal test-support extension (an optional pre-seeded QueryClient parameter on mountManifestScreen) was needed to observe the cached-entry case.

## Notes
Two findings surfaced on the first suite run — the add-hypothesis act not withheld on a released reading, and the ManifestWouldHoldNoHypothesisError refusal carrying no telling at all — were both diagnosed cause: code by a failure-diagnostician and fixed in the implementation; this proof's tests now pass against the corrected code with no outstanding disagreement.

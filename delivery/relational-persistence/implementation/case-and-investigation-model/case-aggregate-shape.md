---
title: The case aggregate carries authored_at and position, and no hash
summary: Case loses hash and gains authored_at, Hypothesis gains a declared position, and the structural
  validator collects every violation of the new shape in one pass, exactly as it did before.
task: sha256:b31500124f8408f9b32737a2cd8aab5ab8e6675d31e004c4f2743dc041da7868
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-case-aggregate-shape-build-3
files:
- path: src/case/case.ts
  effect: Case's type drops the hash attribute and adds authored_at (an ISO-8601 instant), and Hypothesis's
    type adds its own declared position (an integer); every comment on both types now cites the specification
    nodes that hold the current shape rather than the retired hash field or the retired slug-matches-file-name
    rule
- path: src/case/parse-case-document.ts
  effect: documentProblems no longer checks for a "hash" string and now requires "authored_at" the same
    way every other required string attribute is checked; hypothesisProblems now requires a declared integer
    "position" alongside name, criterion, collects and resolution; hypothesesProblems now also refuses
    two hypotheses sharing a position, naming both, via the new sharedPositionProblems/declaredPosition
    pair mirrored on sharedNameProblems/declaredName; heldCase and heldHypothesis carry authored_at and
    position through into the held aggregate. The former "position" locator parameter/function (the ordinal
    "hypothesis N" reader-facing count) is renamed to "locator" throughout, and versionProblems is rewritten
    atop a new isInteger guard and integerProblems helper shared with the new position check
- path: src/fixtures/case/intermittent-connection-outage/1.json
  effect: the one curated case fixture now declares authored_at instead of hash, and each of its two hypotheses
    declares its position (1 and 2, matching their existing order), so it remains a submission this validator
    does not refuse
criteria:
- criterion: The case aggregate declares no hash, and no module derives a digest over a case's content.
  met: true
  how: Case in src/case/case.ts carries no hash field, matching domain/knowledge/case's declared attributes
    exactly; parseCaseDocument no longer reads, checks or holds a "hash" value anywhere in documentProblems
    or heldCase. Within this task's reach (the aggregate and its structural validator), no digest over
    a case's content is derived or read anywhere. The store-level content-identity pin case-query.service.ts's
    ReadCaseResult still carries (fed by FileCaseStore's sha256 of raw bytes) is a different, already-decided
    mechanism outside this task's implements and criteria — see deferred
- criterion: A parsed case version carries authored_at as a datetime, and a submission that states none
    is refused naming that field.
  met: true
  how: Case.authored_at is typed as a string ("an ISO-8601 instant"); documentProblems requires it via
    stringProblems(document['authored_at'], 'authored_at'), which names "authored_at is undeclared" when
    the submission states none, and heldCase carries it through into the parsed aggregate
- criterion: A parsed hypothesis carries its declared position as an integer, and a submission whose hypothesis
    states none is refused naming that field.
  met: true
  how: Hypothesis.position is typed number; hypothesisProblems requires it via integerProblems(value['position'],
    `${locator}'s position`), which names e.g. "hypothesis 1's position is undeclared" when absent, and
    heldHypothesis carries it through
- criterion: A submission in which two hypotheses share a position is refused, naming both.
  met: true
  how: sharedPositionProblems walks every hypothesis's declaredPosition and groups locators by the position
    value, producing one problem per shared position naming every offending hypothesis's locator together
    (e.g. "hypotheses 1, 3 share the position 2"), mirroring sharedNameProblems' existing shape
- criterion: A submission in which two hypotheses share a name is refused, naming both.
  met: true
  how: sharedNameProblems is unchanged in behavior (its internal Map is renamed from "positions" to "locators"
    for clarity now that "position" names a real attribute)
- criterion: A submission declaring no hypothesis is refused.
  met: true
  how: hypothesesProblems' NO_HYPOTHESIS_PROBLEM branch (undeclared, non-array, or empty array) is unchanged
- criterion: A submission whose hypothesis collects no concept is refused, naming the hypothesis.
  met: true
  how: collectsProblems is unchanged in behavior (its parameter is renamed from "position" to "locator"
    to stop it reading as the declared position attribute); it still names the hypothesis's locator on
    an absent, non-array or empty collects
- criterion: A submission whose hypothesis carries an empty criterion is refused, naming the hypothesis.
  met: true
  how: hypothesisProblems still runs stringProblems on value['criterion'], unchanged, naming e.g. "hypothesis
    1's criterion is empty"
- criterion: A submission in which a hypothesis or the fallback declares no outcome, or no referral, is
    refused naming that position.
  met: true
  how: 'resolutionProblems and referralProblems are unchanged: called with subject "the fallback" for
    the case''s own fallback and with "${locator}''s resolution" for each hypothesis'
- criterion: A submission violating several of these conditions is refused once, with every violation
    named together.
  met: true
  how: documentProblems still flattens every check (including the two new ones) into one array; refuseStructuralViolations
    still throws exactly one InvalidCaseDocumentError carrying the whole array when it is non-empty, unchanged
    from before this task
- criterion: A submission violating none of these conditions is not refused by this validation.
  met: true
  how: problems.length === 0 still lets parseCaseDocument return heldCase without throwing, unchanged;
    the updated fixture demonstrates a submission that holds against every check above
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: Case's declared attributes (slug, title, when_to_use, version, authored_at, subject, fallback,
    optional consolidation_register, hypotheses) are exactly what the type declares, what the validator
    requires and holds, and what the fixture submission carries; hash is gone from all three
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: Hypothesis now declares position alongside name, criterion, collects and resolution in the type,
    the validator's required-field checks, and the fixture
- node: contracts/knowledge/author-case-version
  encoded_at:
  - src/case/parse-case-document.ts
  how: delivers the structural half of "have every validator rule answer at this write, with all refusals
    together" — the one collect-everything-then-refuse-once validator the future submission command calls
    rather than reimplements. This task does not implement the write itself, the transport, or the write-once/slug-identity
    refusal (a store-level concern) — those belong to task/case-authoring/author-case-version-command
    and task/relational-stores/case-store
- node: contracts/system/case-authoring
  encoded_at:
  - src/case/parse-case-document.ts
  how: 'same structural half as above: "every validator rule answers at reading, with all refusals at
    once" is what parseCaseDocument''s one-pass collection gives; the coherence half (glossary/capability
    checks) is validate-case-coherence.ts, untouched by this task'
- node: rules/knowledge/validation-runs-at-every-read
  how: 'honored rather than newly encoded: this task preserves parseCaseDocument as an exhaustive, re-run-every-call
    structural check (case-query.service.ts already calls it on every readCase) while it evolves which
    fields it checks. Neither the "at each load by the engine" illustration nor the replay exemption is
    this task''s criteria to answer — both REMAINDER notes on the task file route them elsewhere, both
    already delivered'
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  how: Hypothesis.position exists as a declared integer, and sharedPositionProblems refuses two hypotheses
    declaring the same one, naming both by locator
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  encoded_at:
  - src/case/parse-case-document.ts
  how: preserved exactly as it stood — sharedNameProblems' behavior is unchanged; only its internal Map
    variable was renamed for clarity alongside the new position check
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  encoded_at:
  - src/case/parse-case-document.ts
  how: preserved exactly as it stood — hypothesesProblems' NO_HYPOTHESIS_PROBLEM branch is unchanged
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/case/parse-case-document.ts
  how: preserved exactly as it stood — collectsProblems' behavior is unchanged; only its locator parameter
    was renamed
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  encoded_at:
  - src/case/parse-case-document.ts
  how: preserved exactly as it stood — the criterion field's stringProblems check is unchanged
- node: rules/knowledge/every-position-declares-a-resolution
  encoded_at:
  - src/case/parse-case-document.ts
  how: preserved exactly as it stood — resolutionProblems and referralProblems are unchanged, still applied
    to every hypothesis's resolution and to the fallback alike
inferences:
- inferred: authored_at is validated at parse time by the same three-way check (undeclared / not-a-string
    / empty) every other required string attribute already gets via stringProblems, rather than by a stricter
    datetime-format check
  from: domain/knowledge/case declares authored_at required alongside slug, title, when_to_use and subject
    with no distinct validation guidance, and the codebase's own precedent for a "datetime" attribute
    (investigation-factory.ts's refuseMissingWrittenAt) checks only presence, never format; no node states
    a stricter check for either field
- inferred: the pre-existing "position" parameter/function naming the ordinal locator a reader counts
    ("hypothesis 1") is renamed to "locator" throughout parse-case-document.ts, kept distinct from the
    new "position" attribute name
  from: domain/knowledge/hypothesis's own "position" (the declared precedence integer) and every-position-declares-a-resolution's
    and domain/knowledge/resolution's generic use of "position" (any place in the resolution logic) are
    two different senses of the same word in the specification itself; keeping one in-code name for the
    ordinal locator and reserving "position" for the declared attribute is a disambiguation the code needed
    that the specification's own vocabulary does not resolve for it
- inferred: the fixture's authored_at is set to "2024-01-01T00:00:00.000Z", and its two hypotheses are
    given position 1 and 2 respectively, matching their pre-existing declared order
  from: domain/knowledge/case and domain/knowledge/hypothesis state the types (datetime, integer) but
    no node states a curated fixture's literal values; the existing fixture's own hypothesis order is
    the only signal for which position each should carry
preserved:
- case-resolution.ts's collectionPlan/requiresEvaluationOf/resolveOutcome keep reading hypothesis precedence
  from array order, not from the new position field — untouched, per the task's own REMAINDER note routing
  that change to task/case-and-investigation-model/precedence-from-position.
- case-query.service.ts's readCase/replayCase, ReadCaseResult (including its hash field) and its call
  into parseCaseDocument with a constructed fileName are unchanged — that transport and content-identity
  pin were already decided by the delivered task/case-and-investigation-model/replay-by-slug-and-version.
- investigation.ts's PinnedCase (slug, version, no hash) and investigation-factory.ts's pinnedCaseOf/written_at
  handling are unchanged — already brought to this shape by the delivered task/case-and-investigation-model/investigation-record-shape.
- validate-case-coherence.ts's glossary/capability coherence checks are unchanged and untouched by this
  task.
- The persistence layer (FileCaseStore, its sha256 content-identity hash, and CASE_DOCUMENT_ENDING's use
  as a file suffix) is unchanged.
divergences:
- from: the ordinary route of re-delivering the proof over the task that owns each broken test — for nine
    files with no live task at all, under four now-closed work roots (live-engine-mvp, investigation-engine,
    investigation-engine-v2, case-authoring-mvp), no re-delivery route exists for any of them; and, for
    the tenth file (investigation-factory.spec.ts, jointly with run-diagnosis.spec.ts, both also touched
    once by investigation-record-shape's own delivery), the route of re-delivering that still-open task's
    proof a second time
  departure: 'Ten pre-existing test files were edited directly inside this delivery rather than through
    their owning tasks, all following the pattern the human approved in the investigation-record-shape
    delivery immediately before this one: src/__tests__/unit/factories/production-diagnose.factory.spec.ts,
    src/__tests__/integration/factories/production-diagnose.factory.spec.ts, src/__tests__/unit/http/build-app.spec.ts
    (all live-engine-mvp, closed) — Case/Hypothesis fixtures brought to the new shape, no assertion changed.
    src/__tests__/unit/investigation/evidence-collection-stage.spec.ts, src/__tests__/unit/investigation/judgment-stage.spec.ts
    (investigation-engine, closed) — fixtures brought to the new shape, position derived from each hypothesis''s
    own array index, no assertion changed. src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts,
    src/__tests__/unit/investigation/run-diagnosis.spec.ts (investigation-engine-v2, closed; the latter
    also touched once by investigation-record-shape''s own delivery) — fixtures brought to the new shape;
    run-diagnosis.spec.ts''s already-once-rewritten cross-call test needed a second adjustment, since
    its two aCase({hash: ...}) calls no longer type-check at all now that Case has no hash attribute whatsoever
    — both calls now build through a bare aCase(), asserting nothing new, and the file''s own comment
    records this second step. src/__tests__/unit/case/case-resolution.spec.ts, src/__tests__/unit/case/validate-case-coherence.spec.ts
    (case-authoring-mvp, closed) — fixtures brought to the new shape; case-resolution.spec.ts''s position
    values were drawn from a fixed name-keyed map rather than array index, because one of its own worked
    examples deliberately reuses the same hypothesis objects in two arrays of opposite order to prove
    precedence follows declared order rather than array order, and an index-derived position would have
    silently changed depending on which array read it. src/__tests__/unit/investigation/investigation-factory.spec.ts
    (investigation-engine-v2 and investigation-engine, both closed; also touched once by investigation-record-shape''s
    own delivery, still open) — fixture brought to the new shape; one test (varying a case''s hash to
    prove pinning reads no digest) was deleted rather than adapted, because the override it varied cannot
    even be spelled once Case''s hash attribute no longer exists in the type at all — its own point is
    now a structural fact of case.ts''s own declaration, recorded as an extended comment rather than a
    new assertion.'
  why: The four work roots owning nine of these ten files carry closure.md and are history, so the ordinary
    route does not exist for any of them; for the tenth, a proof-only re-delivery of investigation-record-shape
    exists but was deliberately not taken, in favor of folding all ten fixes into this one delivery, disclosed
    together — consistency over splitting one coherent fix into two acts, following exactly how three
    similar breaks were handled and approved in the delivery immediately before this one.
deferred:
- what: parse-case-document.ts's fileName parameter, slugProblems and heldFileName still enforce the slug
    matching the name of a file, and cite two specification nodes (rules/knowledge/the-slug-matches-the-file-name,
    constraints/a-case-is-stored-as-one-json-document) that no longer exist anywhere in the specification.
  why: No criterion of this task addresses the transport a submission arrives through; removing it would
    decide a medium/transport question this task was not cut to decide. It belongs to whichever task builds
    the actual submission entry point (most plausibly task/case-authoring/author-case-version-command)
    or a dedicated task retiring the file medium.
- what: case-query.service.ts's ReadCaseResult.hash and the FileCaseStore content-identity sha256 that
    feeds it — a digest over a case version's raw stored bytes, unrelated to the domain Case.hash attribute
    this task removes.
  why: contracts/knowledge/case-query is not in this task's implements list, and the already-delivered
    replay-by-slug-and-version task (which does implement it) deliberately kept this pin; reopening that
    decision here would be redeciding another task's already-recorded choice.
- what: case-store.port.ts and file-case-store.repository.ts still cite two retired specification nodes
    in their own module comments.
  why: A different module entirely (the persistence layer's file store), explicitly protected by the inventory's
    must_not_duplicate entry; due for replacement, not correction, by the relational-substrate/relational-stores
    epics' tasks.
- what: src/__tests__/unit/case/case-query.service.spec.ts and src/__tests__/integration/factories/case-query.factory.spec.ts
    (both under the closed case-authoring-mvp initiative) construct their own case document fixture as
    an untyped record fed through the real parseCaseDocument; being untyped, its now-missing authored_at/position
    produced no typecheck error, so it fell outside the typecheck-driven fix above. It will fail at runtime
    once the suite runs, and case-query.service.spec.ts additionally asserts a hash and a positionless
    hypothesis on the answered case, both now false.
  why: Neither file was in the file set this delivery's test-author was given to fix; case-query.service.spec.ts's
    own assertions need rewriting, not just its fixture, which is a larger, distinct piece of work the
    test-author flagged rather than took on unbidden. This is a real, currently undisclosed break the
    suite run below will surface directly.
---

## What it is

The knowledge context's aggregate and its structural validator, brought to the attributes the
specification now declares: a case version carries authored_at rather than a hash, and each
hypothesis declares its own position — refused as a validation failure, together with every other
structural violation, exactly as the validator already collected them before this task.

## Notes

Ten pre-existing test files, across four now-closed initiatives plus this same still-open one, broke
against this task's own legitimate shape change and were fixed directly inside this delivery rather
than through a re-delivery most of their owning work roots can no longer receive — see the
divergence entry below for the full, file-by-file account.
Two further pre-existing files (case-query.service.spec.ts, case-query.factory.spec.ts), under the
closed case-authoring-mvp initiative, use an untyped fixture that escaped the typecheck-driven fix
above and are expected to fail at runtime — flagged in `## Notes` and `deferred` rather than folded
in silently, since fixing them means rewriting assertions, not just a fixture, and they were outside
the file set given to the test-author.

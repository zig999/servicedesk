---
title: Proof for the case aggregate's new declared shape — authored_at, position, no hash
summary: Eleven new or rewritten tests in parse-case-document.spec.ts prove authored_at and per-hypothesis
  position arriving and being required, hash gone from the aggregate, and the two new uniqueness/refusal
  paths this brings; twelve pre-existing test files broken by this same legitimate shape change were brought
  back into agreement with it, with no new behavior invented.
implementation: sha256:1cf03149a8d9bfa04e4cc2bbd446f665a68d269d5d4c40422bd90455dd6c8943
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-case-aggregate-shape-suite-2
tests:
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: drops a hash the document still declares, carrying it into no part of the parsed aggregate
  proves: Criterion 1 — the case aggregate declares no hash.
  fails_when: parseCaseDocument's returned Case carries a hash property when the document declares one
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: carries the document's declared authored_at unchanged, as the case's own datetime
  proves: Criterion 2, positive half — a parsed case version carries authored_at as a datetime.
  fails_when: parsed.authored_at differs from the document's own declared authored_at, or is absent
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a document that leaves authored_at undeclared
  proves: Criterion 2, negative half — a submission that states no authored_at is refused naming that
    field.
  fails_when: a document declaring every attribute except authored_at parses instead of being refused,
    or the refusal does not name authored_at
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: carries each hypothesis's own declared position unchanged, in the document's own order
  proves: Criterion 3, positive half — a parsed hypothesis carries its declared position as an integer.
  fails_when: parsed.hypotheses' own position values differ from the document's own declared positions,
    in either value or order
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a hypothesis that declares no position
  proves: Criterion 3, negative half — a submission whose hypothesis states no position is refused naming
    that field.
  fails_when: a hypothesis lacking position parses instead of being refused, or the refusal does not name
    position
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a hypothesis whose position is not an integer, instead of coercing it
  proves: position is validated as an integer rather than any value that happens to be present — the same
    non-coercion discipline this file already proves for version
  fails_when: a hypothesis whose position is the string "1" parses instead of being refused, or is silently
    coerced to the number 1
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a case whose two hypotheses share a position, naming both
  proves: Criterion 4 — a submission in which two hypotheses share a position is refused, naming both.
  fails_when: two hypotheses declaring the same position, but distinct names, parse instead of being refused,
    or the refusal does not name both hypotheses
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a case whose two hypotheses share a name
  proves: Criterion 5 — a submission in which two hypotheses share a name is refused, naming both. Pre-existing
    assertion, fixture adjusted (the second hypothesis now declares position 2) so this test's single
    expected violation stays isolated from the new position-uniqueness rule rather than also tripping
    it.
  fails_when: two hypotheses declaring the same name, but distinct positions, parse instead of being refused,
    or the refusal does not name both hypotheses
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a case whose hypotheses violate both uniqueness rules at once, naming the shared name
    and the shared position together
  proves: the name-uniqueness and position-uniqueness rules are independent and both collected into one
    refusal rather than one masking the other — an edge case criterion 4 raises once a second uniqueness
    rule exists beside criterion 5's
  fails_when: two hypotheses sharing both their declared name and their declared position produce fewer
    than both violations, or either violation is missing from the one refusal
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a document violating several structural rules once, naming every violation
  proves: Criterion 10 — a submission violating several conditions is refused once, with every violation
    named together. Pre-existing assertion, fixture adjusted (the two departing hypotheses now declare
    distinct positions) so the position-uniqueness rule does not add a seventh, unaccounted-for violation
    to this count.
  fails_when: the refusal's problem count or content changes now that hypotheses also declare position
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: parses a document declaring every attribute into the one case aggregate
  proves: Criterion 11 — a submission violating none of these conditions is not refused. Pre-existing
    assertion, fixture updated to the new required shape (authored_at present, no hash, every hypothesis
    declaring a unique position).
  fails_when: a document declaring authored_at and a unique position per hypothesis, and no hash, is refused,
    or the parsed case departs from what was declared
not_applicable:
- edge_case: authored_at declared as an empty string
  why: criterion 2 only states a refusal for a submission that "states none" (absence); emptiness is handled
    by the same generic stringProblems function every other required string attribute already shares,
    and only slug gets a dedicated empty-string test in this file — title, when_to_use and subject get
    no equivalent dedicated test either, so singling out authored_at would be inconsistent with this file's
    own established pattern
- edge_case: a boundary at each end of a numeric range for position
  why: neither the criteria nor domain/knowledge/hypothesis state a minimum or maximum for position, only
    that it is a declared integer, unique within its case
- edge_case: an empty collection where one comes back
  why: nothing this task adds returns a collection; the one pre-existing empty-collection case (a case
    declaring no hypothesis) is criterion 6, unaffected by this task and already covered
- edge_case: an operation attempted against state that forbids it
  why: parseCaseDocument is a pure function over one given document with no state of its own to forbid
    an operation against
- edge_case: a dependency that fails or answers slowly
  why: this task introduces no new dependency call; parseCaseDocument calls nothing external
- edge_case: two operations against one subject at once
  why: parseCaseDocument holds no shared mutable state and each call is independent; nothing about this
    task's own change is concurrency-relevant
untested:
- Criterion 9's phrase "naming that position" for a hypothesis or fallback missing its outcome or referral
  is not tested against a specific wording. The implementation's own locator ("hypothesis 1", by reading
  order — its doc comment explicitly says never the declared position attribute) is not tested against
  the alternative reading (naming the declared position value itself), because the existing assertions
  here use partial string matches that pass under either reading. Nothing in the specification nodes this
  task implements settles which the criterion's own phrase means, so no test was written to force one
  reading over the other.
divergences:
- from: the ordinary route of re-delivering the proof over the task that owns each broken test — for nine
    files with no live task at all, under four now-closed work roots (live-engine-mvp, investigation-engine,
    investigation-engine-v2, case-authoring-mvp); for a tenth (investigation-factory.spec.ts, jointly
    with run-diagnosis.spec.ts, both also touched once by investigation-record-shape's own delivery) the
    route of re-delivering that still-open task's proof a second time; and, for an eleventh and twelfth
    file found only by running the real suite, the same no-live-task situation as the first nine — both
    owned exclusively by task/case-store/read-case under work/case-authoring-mvp, closed
  departure: 'Twelve pre-existing test files in total were edited directly inside this delivery rather
    than through their owning tasks, all following the pattern the human approved in the investigation-record-shape
    delivery immediately before this one. Ten were caught by typecheck: src/__tests__/unit/factories/production-diagnose.factory.spec.ts,
    src/__tests__/integration/factories/production-diagnose.factory.spec.ts, src/__tests__/unit/http/build-app.spec.ts
    (live-engine-mvp, closed) — Case/Hypothesis fixtures brought to the new shape, no assertion changed.
    src/__tests__/unit/investigation/evidence-collection-stage.spec.ts, src/__tests__/unit/investigation/judgment-stage.spec.ts
    (investigation-engine, closed) — fixtures brought to the new shape, position derived from each hypothesis''s
    own array index, no assertion changed. src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts,
    src/__tests__/unit/investigation/run-diagnosis.spec.ts (investigation-engine-v2, closed; the latter
    also touched once by investigation-record-shape''s own delivery) — fixtures brought to the new shape;
    run-diagnosis.spec.ts''s already-once-rewritten cross-call test needed a second adjustment, since
    its two aCase({hash: ...}) calls no longer type-check at all now that Case has no hash attribute whatsoever
    — both calls now build through a bare aCase(), asserting nothing new. src/__tests__/unit/case/case-resolution.spec.ts,
    src/__tests__/unit/case/validate-case-coherence.spec.ts (case-authoring-mvp, closed) — fixtures brought
    to the new shape; case-resolution.spec.ts''s position values were drawn from a fixed name-keyed map
    rather than array index, because one of its own worked examples deliberately reuses the same hypothesis
    objects in two arrays of opposite order to prove precedence follows declared order rather than array
    order. src/__tests__/unit/investigation/investigation-factory.spec.ts (investigation-engine-v2 and
    investigation-engine, both closed; also touched once by investigation-record-shape''s own delivery)
    — fixture brought to the new shape; one test (varying a case''s hash to prove pinning reads no digest)
    was deleted rather than adapted, because the override it varied cannot even be spelled once Case''s
    hash attribute no longer exists in the type at all — its own point is now a structural fact of case.ts''s
    own declaration, recorded as an extended comment rather than a new assertion. Two more were found
    only once the real suite ran (both escaped typecheck because each builds its own case document as
    an untyped record fed through the real parser, so a now-missing field produced no type error): src/__tests__/unit/case/case-query.service.spec.ts
    and src/__tests__/integration/factories/case-query.factory.spec.ts (case-authoring-mvp, closed) —
    validCaseDocument() dropped hash and gained authored_at, its one hypothesis gained position: 1; two
    of case-query.service.spec.ts''s own full-case toEqual literals were updated the same way (one of
    the two was not among the 19 reported failures — replayCase never validates, so the stale literal
    still matched at the time — but was fixed proactively since it would have mismatched the moment the
    shared fixture changed shape); every other failure in both files, including three whose own point
    is a coherence-layer behavior, resolved from the one fixture fix alone with no assertion touched.'
  why: All four work roots owning these files (live-engine-mvp, investigation-engine, investigation-engine-v2,
    case-authoring-mvp) carry closure.md and are history, so no re-delivery route exists for the eleven
    files owned exclusively by them; for the twelfth (investigation-factory.spec.ts), a proof-only re-delivery
    of investigation-record-shape exists but was deliberately not taken, in favor of folding every fix
    into this one delivery, disclosed together — consistency over splitting one coherent fix into several
    acts, the same reasoning already applied in the delivery immediately before this one.
---

## What it is

Eleven tests proving the case aggregate carries authored_at and no hash, that each hypothesis
carries its own declared position, that two hypotheses may not share a position, and that this
composes correctly with the file's existing name-uniqueness and multi-violation collection.

## Notes

Twelve pre-existing test files, across four now-closed initiatives plus this same still-open one,
broke against this task's own legitimate shape change and were fixed directly inside this delivery
rather than through a re-delivery most of their owning work roots can no longer receive. Two of the
twelve (case-query.service.spec.ts, case-query.factory.spec.ts) were found only once the real suite
ran, because their fixture is an untyped record that escaped typecheck — see the divergence below
for the full, file-by-file account of all twelve.

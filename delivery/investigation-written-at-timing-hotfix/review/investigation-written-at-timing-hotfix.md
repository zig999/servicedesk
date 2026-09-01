---
title: investigation-written-at-timing-hotfix, review
summary: What three passes found over the source and tests stamping written_at from the clock at persistence
  time; the captured suite run passed clean, so no failures pass ran.
reviewed:
- src/investigation/run-diagnosis.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
tasks:
- task/investigation-written-at-timing-hotfix/written-at-records-the-settle-instant
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: written_at on a persisted investigation is read from the clock at the moment the store confirms
    the write settled, never from the request's entry instant.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: reads written_at from the clock at persistence time, distinctly later than the request's own
      entry instant once collection has consumed real wall-clock time
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: reads written_at from the clock immediately before dispatching a write attempt, not from a reading
      taken after the store confirms that attempt has settled
  why: 'The ''never from the request''s entry instant'' half is exercised. The ''read at the moment the
    store confirms the write settled'' half is not: the only test whose store takes measurable time to
    settle (DelayedInvestigationStore(500)) asserts written_at equals the pre-dispatch instant, explicitly
    ''not from a reading taken after the store confirms that attempt has settled'' -- the test''s own
    name and assertion pin the opposite of what this criterion states, and the store settling in the same
    tick it is dispatched everywhere else means the dispatch and settle readings are indistinguishable
    there.'
- criterion: A write whose first attempt fails and is retried once records written_at from whichever attempt
    actually settles, not from the first attempt's own start.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: records written_at from the retry's own fresh clock reading when the retry — not the first attempt
      — is the one that settles, never from the first attempt's own start
  why: Because the retry in this fake store settles in the tick it is dispatched, the test pins which
    attempt written_at was read in and not which moment within that attempt -- the same distinction left
    open under criterion 1.
- criterion: A write that finds the record already present (settles without a new write, per rules/investigation/an-investigation-is-written-once)
    reads written_at from the existing record, never restamping it.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: leaves the already-present record's own written_at untouched, never restamping it, when the
      first write attempt finds the investigation already stored
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: resolves normally, with no retry issued, when the first write attempt finds the investigation
      already stored
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: settles successfully without raising the deadline error when the retry — not the first attempt
      — finds the investigation already stored
  why: 'The ''never restamping it'' half is exercised over the store''s own contents. The ''reads written_at
    from the existing record'' half is unexercised: the planted stub record carries no written_at at all,
    so there is no existing value any read could return, and none of the three tests asserts what written_at
    the run itself came away with on the already-present path.'
findings:
- pass: conformance
  file: src/investigation/run-diagnosis.ts
  where: lines 30-32 and 55-75 (buildInvestigationOptions's written_at), and lines 106 and 113-115 (investigationForRetry's
    written_at), against the dispatch order in lines 86-111
  evidence: 'written_at: new Date(readClockMs()).toISOString(), -- line 72, inside buildInvestigationOptions,
    evaluated before writeWithinDeadline and any store.write call is ever issued. function investigationForRetry(investigation:
    Investigation): Investigation { return { ...investigation, written_at: new Date(readClockMs()).toISOString()
    }; } -- lines 113-115, evaluated synchronously immediately before store.write(investigationForRetry(investigation))
    is dispatched, not after it settles.'
  cost: written_at is stamped once, before the corresponding store.write call is ever issued -- for the
    first attempt at record-assembly time, before the deadline is even computed, and for the retry immediately
    before it is dispatched -- and neither call re-reads the clock once the store confirms the write.
    An audit reading written_at is dating the record by when the call was made rather than by when it
    actually landed; the gap grows with however long the store's own write takes to settle, and is invisible
    from the record itself.
  correction: read the clock only after the corresponding store.write(...) call resolves successfully,
    and stamp written_at from that post-settle reading rather than from the reading taken before the call
    is dispatched -- for both the first attempt and the retry.
- pass: conformance
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 822-834, the test titled 'reads written_at from the clock immediately before dispatching
    a write attempt, not from a reading taken after the store confirms that attempt has settled'
  evidence: const store = new DelayedInvestigationStore(500); ... const resultPromise = runDiagnosis(options);
    await vi.advanceTimersByTimeAsync(500); await resultPromise; const stored = await store.read('investigation-1');
    expect((stored?.document as Investigation).written_at).toBe(new Date(START_INSTANT).toISOString());
  cost: the suite proves, as a passing criterion, that written_at is fixed at the pre-dispatch instant
    rather than at the store's confirmed settle instant the node requires (the store here takes 500ms
    to settle, and the assertion is against the instant before that 500ms elapses). A later correction
    of run-diagnosis.ts to read the clock after the write settles would fail this very test, so the departure
    from the node is locked in as intended behavior rather than left visible as a gap.
  correction: rewrite the test's assertion (and its title) to expect written_at to equal the post-settle
    instant -- here, START_INSTANT + 500 -- once the source reads the clock after store.write resolves.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 439-441, the capability fixture inside twoHypothesisConcurrencyOptions, and lines 1022-1024,
    the identical block inside twoHypothesisTelemetryOptions
  cites: MNT-03
  evidence: 'const capabilities = new FakeCapabilityQuery(); capabilities.hold(aCapability({ concept:
    ''concept-a'' })); capabilities.hold(aCapability({ concept: ''concept-b'' }));'
  cost: The two-hypothesis fixture is assembled twice under two names, so the day a third concept is required,
    or aCapability's shape changes, one builder is updated and the tests routed through the other keep
    running against the old fixture while their names still claim to exercise two judged hypotheses.
  correction: extract the two-hypothesis capability-and-case assembly into one named builder and have
    both twoHypothesisConcurrencyOptions and twoHypothesisTelemetryOptions call it.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 645-651 within the test named 'bounds persistence by the time actually remaining once collection
    has already consumed part of the declared deadline...', where trackSettlement is arranged after the
    act has already run
  cites: TST-01
  evidence: 'const resultPromise = runDiagnosis(options).catch((error: unknown) => error); await vi.advanceTimersByTimeAsync(700);
    const tracker = trackSettlement(resultPromise); await vi.advanceTimersByTimeAsync(299); expect(tracker.settled()).toBe(false);'
  cost: The observer the assertion reads is installed after the call has been made and 700ms of clock
    has already been advanced, so a reader cannot tell whether 'not settled' claims nothing settled at
    all or only that nothing settled after the tracker was attached.
  correction: attach trackSettlement to resultPromise immediately after the call, before the first advanceTimersByTimeAsync.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 966-969, inside the test named 'counts cost.calls as one per hypothesis whose Evaluation
    actually carries usage...'
  cites: MNT-03
  evidence: 'const capabilities = new FakeCapabilityQuery(); capabilities.hold(aCapability({ concept:
    ''concept-a'' })); const observationSource = new FakeObservationSource(); observationSource.seed(''concept-a'',
    A_SUBJECT, { result: ''ok'', observation: ''observed-concept-a'' });'
  cost: This is the fixture block baseOptions already builds by default, copied verbatim and handed straight
    back to baseOptions as overrides that change nothing. A reader has to diff the two blocks to discover
    the override is a no-op, and when the default fixture changes, this test silently keeps the old one.
  correction: drop the capabilities and observationSource overrides and let baseOptions supply them.
- pass: standard
  file: src/investigation/run-diagnosis.ts
  where: line 72 in buildInvestigationOptions, and line 114 in investigationForRetry
  cites: MNT-03
  evidence: 'written_at: new Date(readClockMs()).toISOString(), -- line 72. return { ...investigation,
    written_at: new Date(readClockMs()).toISOString() }; -- line 114, the whole body of investigationForRetry.'
  cost: How the settle instant is stamped now exists in two places in one file, and this task is precisely
    about that decision. A later change to the stamping that touches the first-attempt path leaves the
    retry path stamping the old way; the retry path is reached only when a first write rejects and is
    exercised by one test, so the divergence would ship looking correct.
  correction: give the stamping one named helper in this module and call it from both places, so the retry
    path cannot stamp differently from the first attempt.
---

## What it is

The first review of investigation-written-at-timing-hotfix: coverage over its three criteria,
specification conformance over the four nodes it implements, and standard conformance over the
project's own registry. The captured suite run passed clean, so the failures pass did not run.

## Notes

The specification-conformance pass, the coverage pass and the implementation's own disclosed
divergence all converge on the same fact: written_at is stamped from the clock immediately before
each write attempt is dispatched, never after the store confirms the write settled, which is what
rules/investigation/written-at-records-when-the-write-settled's text requires. One test in
run-diagnosis.spec.ts asserts this pre-dispatch behavior by name and would fail if the source were
corrected to read the clock post-settle -- the departure is locked in as a passing test rather than
left visible as an uncovered gap.

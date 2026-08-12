---
title: Replay resolves a pinned case by slug and version, without validation or a digest
summary: case-query.service.ts's replayCase now answers a bare Case trusted from the exact stored document,
  running neither the structural nor the coherence validation the ordinary read runs and never reading
  the store's content-identity digest, while readCase keeps running both on every call.
task: sha256:bad790e2152808a7a1225171c3074d0401434529b115ece2949f76fb544f9b09
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-replay-by-slug-and-version-build-2
files:
- path: src/case/case-query.service.ts
  effect: 'replayCase now takes (slug, version, caseStore) and answers Promise<Case> instead of Promise<ReadCaseResult>:
    it reads the stored version through the existing heldVersion helper, destructures only its document
    field (never its hash), and hands that document to a new private trustedCase(document) which returns
    it as a Case via a bare type assertion -- no structural parse (parseCaseDocument) and no coherence
    check run on this path anymore. CaseQueryService.readCase, refuseIncoherence, heldVersion and structuralCase
    are otherwise unchanged. The module header comment and replayCase''s own doc comment are rewritten
    to state the exception in full.'
- path: src/case/case-query.port.ts
  effect: ReadCaseResult's doc comment no longer claims replay-case answers this shape; it now states
    the shape is read-case's own, pinned by content identity, with replay-case answering the case alone.
    The type itself, and ICaseQuery, are unchanged.
criteria:
- criterion: The replay read takes a slug and a version and answers with the case version stored under
    them.
  met: true
  how: replayCase(slug, version, caseStore) reads exactly caseStore.readVersion(slug, version) through
    heldVersion and answers trustedCase(document) -- the Case stored under that exact pair; an unstored
    pair raises CaseNotFoundError rather than answering anything.
- criterion: The replay answers a complete case — its root, its hypotheses and their resolutions and
    referrals — or nothing, never a case missing any of them.
  met: true
  how: The store answers one version as one document; replayCase reads that single document in the one
    heldVersion call and either answers it whole, through trustedCase, or throws CaseNotFoundError for
    an unstored version -- there is no code path in replayCase that reads or answers only part of a document.
- criterion: A version stored under a slug before later versions of it were stored is answered when a
    replay names that version.
  met: true
  how: replayCase addresses the store by the exact (slug, version) pair the caller names -- never by 'latest'
    and never through listVersions -- so which versions were stored before or after the named one has
    no bearing on the answer.
- criterion: The replay answers without running the validation the ordinary read runs at its reading.
  met: true
  how: replayCase no longer calls parseCaseDocument or caseCoherenceViolations/refuseIncoherence -- the
    two calls structuralCase() and refuseIncoherence() that readCase runs on every call. It instead reads
    the document and answers it through trustedCase, which runs neither.
- criterion: The ordinary read of a case by slug and version runs that validation at each reading.
  met: true
  how: 'CaseQueryService.readCase is unchanged: every call still runs structuralCase() and this.refuseIncoherence(),
    with no cache and no gate in between, so a case that validated at one reading is checked again, in
    full, at the next one.'
- criterion: The replay resolves its case without reading any digest over the case's content.
  met: true
  how: replayCase destructures only the document field off the StoredCaseVersion heldVersion answers,
    and never references its hash field; replayCase's own answer is a bare Case with no hash field anywhere
    in it.
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/case/case-query.service.ts
  how: 'Governs the shape replay must answer with: trustedCase''s declared return type is exactly Case.
    This task does not touch case.ts itself -- the aggregate''s own declared attributes are task/case-and-investigation-model/case-aggregate-shape''s
    own work.'
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/case-query.service.ts
  how: A replayed case's hypotheses travel through trustedCase exactly as the stored document holds them,
    still typed as Hypothesis[] on the answered Case. This task does not touch hypothesis.ts's own declared
    attributes.
- node: domain/investigation/investigation
  how: This node's pinned-case relationship needs a way to resolve a pin of slug and version back to the
    case it names; replayCase is exactly that resolution, built here ahead of the pin's own shape change.
    This task does not touch investigation.ts or investigation-factory.ts.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/case/case-query.service.ts
  how: 'The contract''s one operation, read-case, is unchanged: CaseQueryService.readCase still answers
    a case validated at that exact reading and read whole, or refuses -- criterion 5 re-affirms this behavior
    as the rule replay is the declared exception to.'
- node: constraints/a-case-is-read-whole
  encoded_at:
  - src/case/case-query.service.ts
  how: 'Honored by construction in both read-case and replay-case: heldVersion reads one stored document
    as one unit through one call to the store, and structuralCase/trustedCase each turn that one document
    into the whole Case in one step.'
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/case/case-query.service.ts
  how: 'The rule''s two halves both live in this file: readCase runs the structural refusal and the coherence
    checks on every call, and replayCase now runs neither -- the declared exception stated in full, correcting
    the file''s previous state where replay already skipped the coherence checks but still ran the structural
    refusal.'
- node: rules/knowledge/every-case-version-remains-readable
  how: 'Governs rather than newly encoded here: the guarantee that every version stays readable is kept
    by the store, a file outside this task''s set. This composition''s own contribution is that it never
    works against that guarantee.'
- node: rules/investigation/replay-is-pinned
  encoded_at:
  - src/case/case-query.service.ts
  how: 'Encodes the case half of this rule''s pin: ''slug and version name one content without a digest
    over it'' is exactly what replayCase now does. The rule''s other three pins (model, prompt_version,
    evidence) are not reached by this task.'
inferences:
- inferred: replayCase answers a bare Case rather than the ReadCaseResult wrapper read-case answers.
  from: Criterion 1's own wording and criterion 6's flat prohibition on reading any digest, read together
    with rules/investigation/replay-is-pinned's 'without a digest over it' and case-query.port.ts's own
    doc comment defining ReadCaseResult's hash field as exactly the content-identity digest criterion
    6 forbids reading.
- inferred: Criterion 4's 'the validation the ordinary read runs' names the ordinary read's structural
    refusal as well as its coherence checks -- both, not the coherence checks alone the file's previous
    comment claimed replay was already exempt from.
  from: This task's own REMAINDER note, which names the seven structural rules as 'exactly the content
    validation criterion 4 says the replay skips and criterion 5 says the ordinary read runs,' together
    with rules/knowledge/validation-runs-at-every-read's own unqualified statement.
- inferred: trustedCase may read the stored document into a Case through a bare type assertion, with no
    narrowing guard.
  from: domain/knowledge/case's own 'each version written once and never altered,' taken with the fact
    that any guard thorough enough to narrow unknown to Case here would have to test the same structural
    facts parseCaseDocument's refusal already tests -- exactly what criterion 4 requires this path to
    skip.
- inferred: ReadCaseResult's doc comment in case-query.port.ts needed correcting to stop describing itself
    as what 'read-case and replay-case both answer.'
  from: The comment's own claim, directly falsified by this task's required change to replayCase's return
    type.
divergences:
- cites: TYP-02
  file: src/case/case-query.service.ts
  departure: trustedCase() asserts document as Case with no narrowing guard alongside it.
  why: A guard thorough enough to narrow unknown to Case here would have to test the same structural facts
    parseCaseDocument's own refusal already tests, exactly what criterion 4 of this task requires replay
    to skip. rules/knowledge/validation-runs-at-every-read states replay reads the pinned version 'without
    revalidation,' and a version is written once and never altered, so trusting the stored shape here
    is what that exception means.
preserved:
- 'CaseQueryService.readCase''s refusal composition: CaseNotFoundError for an unstored version, CaseNotValidError
  joining every structural violation and every coherence violation together, on every single call, with
  no caching between reads.'
- replayCase's and readCase's shared use of CaseNotFoundError for an unstored version.
- CaseQueryService's constructor taking three interfaces (ICaseStore, IGlossaryQuery, ICapabilityQuery),
  never a concrete implementation.
- The four store ports and the file-backed repositories behind them, left untouched.
- rules/knowledge/every-case-version-remains-readable's own guarantee, kept entirely inside FileCaseStore,
  a file this task does not reach.
deferred:
- what: The seven structural content-validation rules that make up "the validation" this task's criteria
    4 and 5 refer to, including position and authored_at arriving on the aggregate and hash leaving it.
  why: This task's own REMAINDER note assigns them to the validation gate itself, which task/case-and-investigation-model/case-aggregate-shape
    implements.
- what: The other three replay pins rules/investigation/replay-is-pinned names -- model, prompt_version
    and evidence -- and the pinned_case's own reduction to slug and version on Investigation and PinnedCase.
  why: This task's own REMAINDER note assigns them to task/case-and-investigation-model/investigation-record-shape.
- what: src/__tests__/unit/case/case-query.service.spec.ts and src/__tests__/integration/factories/case-query.factory.spec.ts
    still assert replayCase's previous ReadCaseResult-with-hash shape and a structural-parse-failure path
    this task deliberately removes from replay.
  why: Writing or editing tests is not this delivery's role; the proof for this task is a separate pass,
    and these two files predate this task, and need updating to the criteria this task states.
---

## What it is

The pinned read: replayCase answers a case named by slug and version, trusted whole from the exact stored document, with no revalidation and no content-identity digest.

## Notes

Two pre-existing tests from the closed case-authoring-mvp initiative (case-query.service.spec.ts, case-query.factory.spec.ts) assert the previous replayCase contract (a hash field, structural-failure-through-replay) that this task's criteria 4 and 6 now forbid; the human explicitly approved this task's proof rewriting exactly those assertions to the new contract, leaving every assertion about readCase (unchanged) untouched.

---
contract_version: siegard-reconcile/1
title: Reconcile wave 3 of backend code drift — diagnosis pipeline, persistence and status map
summary: >-
  These six files are the shipped, committed backend behavior for the shared investigation
  pipeline (collection, judgment, resolution, consolidation), the diagnose entry point and its
  once-only persistence, evidence collection under the deadline budget, the relational
  investigation store, and the shared HTTP status/error-code map used across every domain context.
  The human asserts this behavior is correct as it stands; this reconciliation checks only whether
  the specification still states what these files now do.
target: backend
files:
  - path: src/investigation/investigation-pipeline.ts
    change: >-
      composes the shared four-stage pipeline (collection, judgment, resolution, consolidation)
      that diagnose and simulate-case both call, answering evidence, evaluations, the resolved
      outcome, the assessment, cost and durations
  - path: src/investigation/judgment-stage.ts
    change: >-
      judges every hypothesis the pinned case's manifest requires in parallel under a bounded
      pool, retrying once on a structurally invalid citation set, degrading to no-data,
      deadline-exceeded or judgment-failure
  - path: src/investigation/run-diagnosis.ts
    change: >-
      runs the pipeline, assembles the Investigation and writes it once inside a bounded
      persistence window, then answers its assessment
  - path: src/investigation/evidence-collection-stage.ts
    change: >-
      collects one evidence item per concept in a case's collection plan in parallel, each
      observation raced against a shared collection-stage budget and against its own capability's
      declared timeout
  - path: src/persistence/relational-investigation-store.repository.ts
    change: >-
      writes a whole Investigation (root row plus evidence, evaluations, citations and subject
      attribute values) inside one transaction and reads it back
  - path: src/errors/status-map.ts
    change: >-
      maps every domain error class raised across contexts to the HTTP status the route layer
      answers with, with a header comment describing which pairings a specification node fixes and
      which are this project's own engineering choice
nodes:
  - node: domain/investigation/cost
    conforms: true
    how: >-
      investigation-pipeline.ts's `costOf` sums judgment usages plus the one consolidation usage
      into `calls`, `input_tokens`, `output_tokens`; run-diagnosis.ts and the repository both carry
      the value through untouched, matching "N hypotheses cost N judgment calls plus one writing
      call, linear in hypotheses."
    encoded_at:
      - src/investigation/investigation-pipeline.ts
      - src/investigation/run-diagnosis.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/knowledge/resolution
    conforms: true
    how: >-
      `resolveAndNarrow`'s own `ResolvedOutcome` is passed through verbatim, never recomputed or
      decomposed, matching "Pair one outcome with one referral so no position can declare one
      without the other."
    encoded_at:
      - src/investigation/investigation-pipeline.ts
  - node: rules/investigation/a-subject-carries-at-least-one-attribute
    conforms: true
    how: >-
      the invariant is enforced once, by the reused `buildSubject`, rather than restated in the
      pipeline.
    encoded_at:
      - src/investigation/investigation-pipeline.ts
  - node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
    conforms: true
    how: >-
      run-diagnosis.ts states nothing of its own about the fan-out (delegated to the pipeline);
      judgment-stage.ts bounds concurrency with `new CallPool(poolSize)`, the bound arriving as
      configuration with no default written in either file.
    encoded_at:
      - src/investigation/judgment-stage.ts
      - src/investigation/run-diagnosis.ts
  - node: constraints/judgment-runs-behind-a-port
    conforms: true
    how: >-
      the file's only judgment dependency is the `IHypothesisEvaluator` port type; it imports no
      provider client.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: constraints/the-judgment-prompt-is-closed
    conforms: true
    how: >-
      exactly criterion, evidence items and `{ title, whenToUse }` reach `evaluator.evaluate(...)`,
      matching "only one hypothesis's criterion, its own evidence ... and the pinned case's title
      and when_to_use."
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: contracts/integration/capability-registry
    conforms: true
    how: >-
      none of the contract's operations is called from this file — abstention is what
      judgment-reads-the-evidence-snapshot asks of it, and the file honors that.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: domain/investigation/evaluation-reason
    conforms: true
    how: >-
      the three values `no-data`, `judgment-failure`, `deadline-exceeded` are each written at
      exactly the path the specification assigns them, never enumerated as a list of the file's own.
    encoded_at:
      - src/investigation/judgment-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/hypothesis-evaluator
    conforms: true
    how: >-
      the call site passes exactly the criterion/evidence/case-context triple the node's
      Responsibility names, on the first call and the retry alike.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: domain/investigation/verdict
    conforms: true
    how: >-
      the file branches on the three members of the union the port answers with and writes each
      literal only where it constructs that member; the repository imports the same three values
      rather than re-listing them and raises on anything else.
    encoded_at:
      - src/investigation/judgment-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/knowledge/case-version
    conforms: true
    how: >-
      `title` and `when_to_use` are read from the pinned case once per call, matching the node's
      declared attributes.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
    conforms: true
    how: >-
      the check is built from this hypothesis's own `collects` and delegated to
      citation-validation.ts, restating no vocabulary here.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: rules/investigation/a-decided-evaluation-cites-evidence
    conforms: true
    how: >-
      an uncited decided answer fails the structural check and never becomes an Evaluation
      (`if (citations.length === 0) return false`).
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
    conforms: true
    how: >-
      each of the three inconclusive builders states a reason, and only no-data carries citations,
      drawn from the non-ok items.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: rules/investigation/judgment-reads-the-evidence-snapshot
    conforms: true
    how: >-
      both the prompt input and the citation context are built from the same already-collected
      items; no glossary or registry read happens between them.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: rules/investigation/one-evaluation-per-required-hypothesis
    conforms: true
    how: >-
      the result is one entry per name `requiresEvaluationOf` returns, and every code path returns
      an Evaluation rather than silence.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
    conforms: true
    how: >-
      judgment-stage.ts degrades a hypothesis with any non-ok evidence to no-data before the pool;
      evidence-collection-stage.ts's race resolves a timeout to an ordinary resolved Evidence
      rather than throwing, so sibling concepts' collection still settles.
    encoded_at:
      - src/investigation/judgment-stage.ts
      - src/investigation/evidence-collection-stage.ts
  - node: scenarios/investigation/a-foreign-citation-is-refused
    conforms: true
    how: >-
      exactly one retry runs, gated on the remaining deadline, falling to judgment-failure on a
      second structurally-invalid citation set.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
    conforms: true
    how: >-
      a hypothesis with all-ok evidence that never acquires a pool slot before the deadline takes
      the `deadline-exceeded` branch, after the no-data check has already passed.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
    conforms: true
    how: >-
      one evidence snapshot feeds both the prompt input and the citation context; no registry read
      happens between them.
    encoded_at:
      - src/investigation/judgment-stage.ts
  - node: constraints/diagnosis-answers-synchronously
    conforms: true
    how: >-
      `runDiagnosis` is one awaited chain from pipeline to write to answer, with no enqueue, handle
      or poll anywhere in the file.
    encoded_at:
      - src/investigation/run-diagnosis.ts
  - node: contracts/investigation/case-source
    conforms: true
    how: >-
      the case arrives as a given (`case: options.case`) and is passed through untouched, with no
      read-case call or re-resolution.
    encoded_at:
      - src/investigation/run-diagnosis.ts
  - node: contracts/investigation/diagnosis
    conforms: true
    how: >-
      run-diagnosis.ts's `RunDiagnosisOptions` carries case, subject fields, narrative, requester
      and an optional ticket_ref, answering an Assessment, with every call running the pipeline
      fresh. status-map.ts states nothing of the contract's operation itself — it carries only the
      HTTP status two of its refusals resolve to (`CaseVersionNotReleasedError` 409,
      `SubjectDoesNotCoverCaseInputsError` 422), which is not a restatement of the contract.
    encoded_at:
      - src/investigation/run-diagnosis.ts
      - src/errors/status-map.ts
  - node: domain/investigation/durations
    conforms: false
    how: >-
      run-diagnosis.ts carries the value through to the factory and states none of its four fields.
      investigation-pipeline.ts's judge found `total` computed as `collection + judgment +
      writingElapsedMs` with no node stating that derivation, excluding every millisecond spent
      outside a stage. relational-investigation-store.repository.ts's judge found the
      `durations_writing` column typed as a bare `number`, read back unconditionally — unlike the
      conditional shape the node's own decided presence rule requires ("writing is present exactly
      when a consolidation call happened ... absent for a run that never reaches consolidation"),
      inventing a duration for a stage that may not have run.
    observed_at:
      - src/investigation/investigation-pipeline.ts
      - src/investigation/run-diagnosis.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: rules/investigation/an-answer-arrives-within-the-declared-deadline
    conforms: true
    how: >-
      `PERSISTENCE_STAGE_BUDGET_MS = 2_000` encodes exactly the persistence slice of the node's
      "twenty seconds — two of overhead and margin, seven of collection, five of judgment, four of
      writing and two of persistence" split; the total itself is not restated here.
    encoded_at:
      - src/investigation/run-diagnosis.ts
  - node: rules/investigation/an-investigation-is-written-once
    conforms: true
    how: >-
      exactly one `store.write` call, made after the whole record is assembled, with no mutation
      after; the repository's own transaction holds one INSERT per table and no UPDATE anywhere.
    encoded_at:
      - src/investigation/run-diagnosis.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: rules/investigation/replay-is-pinned
    conforms: true
    how: >-
      the case's slug and version, the model, the prompt version and the pipeline's own answered
      evidence all reach the factory from this composition, never re-collected.
    encoded_at:
      - src/investigation/run-diagnosis.ts
  - node: rules/investigation/the-response-follows-the-record
    conforms: true
    how: >-
      the write is awaited before anything is returned, and the returned value is the written
      record's own assessment.
    encoded_at:
      - src/investigation/run-diagnosis.ts
  - node: scenarios/investigation/no-response-without-a-record
    conforms: true
    how: >-
      the timeout branch throws before the return statement is reachable, so no path answers an
      assessment when the write did not settle.
    encoded_at:
      - src/investigation/run-diagnosis.ts
  - node: contracts/investigation/observation-source
    conforms: true
    how: >-
      one `observe-concept` call per concept in the plan, in parallel, over `Promise.all`.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
  - node: domain/investigation/evidence-result
    conforms: true
    how: >-
      `settledEvidence` produces only the node's four values, imported rather than re-listed, and
      only `ok` supplies a usable observation; the repository imports the same vocabulary and
      raises on an unrecognized stored value.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/field-semantics
    conforms: true
    how: >-
      the structural read is delegated to `fieldSemanticsOf`, with the honest-empty case (no
      capability resolved) an empty array; the repository carries the snapshotted array whole,
      never re-deriving name/type/description.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: rules/integration/an-unresolvable-observation-ends-unavailable
    conforms: true
    how: >-
      an unheld capability resolution ends `unavailable`, with the result detail read from
      `CapabilityNotResolvedForObservationError`'s own name.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
  - node: rules/investigation/collection-has-its-own-budget-within-the-total
    conforms: true
    how: >-
      `COLLECTION_STAGE_BUDGET_MS = 7_000` is the node's own seven-second budget, and a
      capability's declared timeout is bounded by `Math.min(capability.timeout, stageCeilingMs)`.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
  - node: rules/investigation/collection-runs-in-the-requester-scope
    conforms: true
    how: >-
      the requester travels into every `observe-concept` call unchanged; the file holds no service
      identity to substitute.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
  - node: rules/investigation/one-evidence-per-collected-concept
    conforms: true
    how: >-
      one `collectOneEvidence` per element of `collectionPlan`, nothing added or dropped, each
      identified by concept with no id.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
  - node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
    conforms: true
    how: >-
      a capability's own declared timeout never extends the wait past the seven-second stage
      budget, per the same `Math.min` bound.
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
  - node: constraints/the-stored-schema-mirrors-the-declared-model
    conforms: true
    how: >-
      every column the insert names pairs with a declared attribute or a stated cardinality-1
      relationship; the opposite direction (a required attribute no column holds) is where the
      findings below sit.
    encoded_at:
      - src/persistence/relational-investigation-store.repository.ts
  - node: constraints/the-system-persists-to-one-relational-database
    conforms: true
    how: >-
      one injected connection answers write and read, and no file is opened anywhere in the
      module.
    encoded_at:
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/citation
    conforms: true
    how: >-
      one concept and one field per row, exactly the node's two attributes.
    encoded_at:
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/subject
    conforms: true
    how: >-
      the whole assembled attribute set is handed through unfiltered in all three files — the
      pipeline hands it whole to collection, collection hands it whole to `observe-concept`, and
      the repository stores every attribute-value row.
    encoded_at:
      - src/investigation/investigation-pipeline.ts
      - src/investigation/evidence-collection-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/subject-attribute-value
    conforms: true
    how: >-
      one row per attribute/value pair, written and read back without transformation.
    encoded_at:
      - src/persistence/relational-investigation-store.repository.ts
  - node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
    conforms: true
    how: >-
      `CapabilityIdentityNotFoundError` maps to 404, cited to this node in the header comment.
    encoded_at:
      - src/errors/status-map.ts
  - node: contracts/integration/connector-configuration-registry
    conforms: true
    how: >-
      the file carries only the status four of this contract's refusals resolve to, restating none
      of its operations.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/glossary/a-concept-declares-its-description
    conforms: true
    how: >-
      `ConceptDescriptionRequiredError` maps to 422, cited and quoted correctly against this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
    conforms: true
    how: >-
      `MalformedCapabilityInputSchemaError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-connector-configuration-holds-a-well-formed-object
    conforms: true
    how: >-
      `ConnectorConfigurationNotWellFormedError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-connector-configuration-names-its-connector
    conforms: true
    how: >-
      `IncompleteConnectorConfigurationError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
    conforms: true
    how: >-
      `ConnectorConfigurationNotFoundError` maps to 404, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
    conforms: true
    how: >-
      `ConnectorPlaceholderOutsideInputSchemaError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
    conforms: true
    how: >-
      `SubjectDoesNotCoverCaseInputsError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
    conforms: true
    how: >-
      `HypothesisNotInManifestError` maps to 404, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-concept-accepts-the-declared-subject-type
    conforms: true
    how: >-
      `ConceptRefusesSubjectTypeError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
    conforms: true
    how: >-
      `HypothesisRevisionCollectsNoConceptError` maps to 422, cited to this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
    conforms: true
    how: >-
      `CaseHoldsNoDraftError` maps to 409, and the comment already marks this status as the node's
      own rather than the project's — the one 409-group entry that already cites correctly.
    encoded_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    conforms: true
    how: >-
      `ConceptNotInGlossaryError` maps to 404, cited and quoted correctly against this node.
    encoded_at:
      - src/errors/status-map.ts
  - node: scenarios/glossary/a-concept-with-no-description-is-refused
    conforms: true
    how: >-
      the file states only the 422 its subject rule fixes; the scenario's own facts (which
      concepts stay held, what the operator is told) are stated nowhere here and contradicted
      nowhere either.
    encoded_at:
      - src/errors/status-map.ts
  - node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
    conforms: true
    how: >-
      the file states only the 422 its subject rule fixes; the scenario's own facts are stated
      nowhere here and contradicted nowhere either.
    encoded_at:
      - src/errors/status-map.ts
  - node: domain/investigation/assessment
    conforms: false
    how: >-
      investigation-pipeline.ts's judge found the answered Assessment carries only outcome,
      referral, determining_hypothesis and text — the writing prompt is diverted into a
      pipeline-only `InvestigationPipelinePrompts.writing` field the code's own comment says has
      "nowhere else to live", and the consolidation call's register, usage and elapsed_ms are
      consumed into `cost`/`durations` and dropped rather than carried onto the assessment.
      relational-investigation-store.repository.ts's judge found the same absence at the storage
      boundary: the row holds outcome, the referral's two fields, determining_hypothesis and text
      only, with no column for register, usage, elapsed_ms or prompt.
    observed_at:
      - src/investigation/investigation-pipeline.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/evaluation
    conforms: false
    how: >-
      investigation-pipeline.ts's judge read optionality correctly (an evaluation without usage
      contributes no call to cost). judgment-stage.ts's judge found the discarded second-attempt
      outcome on the judgment-failure and deadline-exceeded fallbacks carries none of usage,
      elapsed_ms or prompt even where a call did happen — a third case the node's stated
      "present exactly when a call happened, absent when reason no-data" does not cover.
      relational-investigation-store.repository.ts's judge found the store itself has no column
      for usage, elapsed_ms or prompt on an evaluation row at all.
    observed_at:
      - src/investigation/investigation-pipeline.ts
      - src/investigation/judgment-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/evidence
    conforms: false
    how: >-
      investigation-pipeline.ts's and the repository's judges cleared the node's attribute set as
      assembled and stored. evidence-collection-stage.ts's judge found three departures at the
      source: `observed_at` is stamped at the collection stage's start for every concept rather
      than when each observation actually settled; an unavailable item's `origin` and capability
      reference are written as empty strings rather than a stated sentinel, though the node
      declares a required cardinality-1 reference; and a timed-out item's `result_detail` is a
      string composed in this file (`no observation within ${effectiveBoundMs}ms`) rather than a
      named cause the way every other result_detail is a named error class.
    observed_at:
      - src/investigation/investigation-pipeline.ts
      - src/investigation/evidence-collection-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: domain/investigation/investigation
    conforms: false
    how: >-
      run-diagnosis.ts's judge found `written_at` stamped from the request's entry instant
      (`options.now`) rather than the instant the write concluded, so a run using most of its
      budget records a written_at up to twenty seconds earlier than the actual write.
      relational-investigation-store.repository.ts's judge found `ticket_ref` coerced to the empty
      string on read (`row.ticket_ref ?? ''`) though the node declares it not required — an absent
      ticket becomes indistinguishable from an empty one.
    observed_at:
      - src/investigation/run-diagnosis.ts
      - src/persistence/relational-investigation-store.repository.ts
  - node: constraints/the-deadline-is-an-absolute-propagated-instant
    conforms: false
    how: >-
      judgment-stage.ts and evidence-collection-stage.ts both derive their ceiling correctly from
      the propagated (now, deadline) pair. run-diagnosis.ts's judge found persistence's own bound
      computed as `Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now))` where `now`
      is the call's entry instant and never advances — so `deadline - now` is the whole declared
      total rather than what remains when persistence actually begins, and the last stage never
      pays for what earlier stages spent, against the node's own "a late one takes from those that
      follow, and the last to run pays."
    observed_at:
      - src/investigation/judgment-stage.ts
      - src/investigation/run-diagnosis.ts
      - src/investigation/evidence-collection-stage.ts
  - node: rules/investigation/no-stage-aborts-on-its-deadline
    conforms: false
    how: >-
      judgment-stage.ts and evidence-collection-stage.ts both honor the rule for their own
      deadline windows. run-diagnosis.ts's judge found persistence's own exemption only half
      implemented: the node's Description states persistence "holds its own budget and retries
      within what remains", but exactly one `store.write` is attempted and its first overrun
      becomes `InvestigationWriteDeadlineExceededError` directly, with nothing retried.
    observed_at:
      - src/investigation/judgment-stage.ts
      - src/investigation/run-diagnosis.ts
      - src/investigation/evidence-collection-stage.ts
  - node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
    conforms: false
    how: >-
      the decided-answer path holds every citation to the same snapshot the node states. The
      no-data citation's `field` is hard-coded to the empty string, a value this node's own
      unqualified "every field a citation names exists among the field names its own cited evidence
      item snapshotted" cannot admit, and the file's own comment states this is a source-level
      convention shared with evidence-collection-stage.ts rather than something the node decides.
    observed_at:
      - src/investigation/judgment-stage.ts
  - node: rules/integration/an-http-connector-configuration-declares-its-call
    conforms: false
    how: >-
      opened as a candidate: the node's stated ending for a malformed or incomplete configuration
      reaches this file's record only as a pass-through of the port's own `result_detail`. The
      premise that pass-through rests on — the file's own comment that "observe-concept never
      throws" for the four endings — is exactly what decision-log.md records as left unsettled for
      this same rule ("the source code's own call chain ... does not visibly catch what it throws
      before evidence-collection-stage.ts's own comment states observe-concept 'never throws'"); a
      rejection here propagates through the whole `Promise.all` rather than degrading one concept.
    observed_at:
      - src/investigation/evidence-collection-stage.ts
  - node: rules/knowledge/a-collected-concept-declares-a-ttl
    conforms: false
    how: >-
      opened as a candidate: every evidence item is stamped with the fixed
      `DEFAULT_EVIDENCE_TTL_SECONDS`, while the stage already holds the glossary's own concept
      resolution in hand (it reads `readConcept(concept)` for the description) and drops the
      concept's own declared ttl rather than reading it — against the node's "a registration that
      states none takes the default", which assigns the default only where the glossary itself
      holds none.
    observed_at:
      - src/investigation/evidence-collection-stage.ts
  - node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
    conforms: false
    how: >-
      opened as a candidate: `CaseNotFoundError` maps to 404, matching this node's own "refused
      with an HTTP 404 response reporting a CaseNotFoundError" — but the header comment lists
      CaseNotFoundError among the entries whose "status stays this project's own engineering
      decision, not a fact the specification holds", denying the node it matches.
    observed_at:
      - src/errors/status-map.ts
  - node: constraints/the-concept-read-refuses-an-unanswered-concept
    conforms: false
    how: >-
      opened as a candidate: `ConceptNotAnsweredError` maps to 404, matching this node's fitness —
      but the same "engineering decision" clause claims it for the file rather than the node.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
    conforms: false
    how: >-
      opened as a candidate: `ConceptNotHeldError` and `VocabularyTermNotHeldError` both map to
      404, and this node states both in one sentence — but both are listed under the file's
      "engineering decision" clause, and neither is bound to this file in the trace, so a later
      reconciliation is never handed this node to hold the two lines against.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    conforms: false
    how: >-
      opened as a candidate: `CapabilityNotRegisteredForTestError` (404) and
      `CapabilityConnectorMismatchError` (409) are both this node's own two refusals, but the file
      cites a closed plan's task criterion for each instead of the node.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-case-has-at-most-one-draft
    conforms: false
    how: >-
      opened as a candidate: `CaseAlreadyHasDraftError` maps to 409 exactly as this node states,
      and decision-log.md records that this very file was the material the decision was read from
      — but the comment still calls the status this project's own choice.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
    conforms: false
    how: >-
      opened as a candidate: `ManifestPositionOccupiedError` maps to 409 exactly as this node
      states, under the same "engineering decision" clause.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    conforms: false
    how: >-
      opened as a candidate: this node states two distinct refusals —
      `CaseVersionNotDraftError` and `CaseVersionNotDraftAtReleaseError`, both 409 — which the
      comment collapses into one descriptive phrase under the "engineering decision" clause,
      losing the node's own reason the two classes exist separately.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/integration/one-capability-answers-one-concept
    conforms: false
    how: >-
      opened as a candidate: the file cites this node for `ConceptAlreadyAnsweredError` (409) and
      then states in the same breath that the status is "not something any specification node
      fixes" — the opposite of what the citation says. The node's other half,
      `DuplicateConceptAnswerError` at HTTP 500, is absent from the file entirely.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/investigation/only-a-released-case-version-is-diagnosed
    conforms: false
    how: >-
      opened as a candidate: `CaseVersionNotReleasedError` maps to 409 here, but neither that
      status nor that error identity appears anywhere under the specification root — this node
      states only that a draft version "may be read but never diagnosed against", not what a
      caller is told. Unlike every sibling refusal in this table, this one was never swept into a
      node by a decision-log entry.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
    conforms: false
    how: >-
      opened as a candidate: `CaseVersionNotReleasableError` maps to 422 exactly as this node
      states, under the "engineering decision" clause.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/knowledge/a-case-has-at-least-one-hypothesis
    conforms: false
    how: >-
      opened as a candidate: `ManifestWouldHoldNoHypothesisError` maps to 422 exactly as this node
      states, and decision-log.md cites this pairing as a precedent other refusals were decided
      from — yet the comment still calls it undecided.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-capability-declares-its-contract
    conforms: false
    how: >-
      opened as a candidate: `IncompleteCapabilityContractError` maps to 422 exactly as this node
      states; the file names the class with no citation at all, unlike its neighbours in the same
      group.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-capability-is-read-only
    conforms: false
    how: >-
      opened as a candidate: `CapabilityNotReadOnlyError` maps to 422 exactly as this node states
      — the refusal the specification itself calls load-bearing for the system's posture ("The
      system diagnoses and refers, never acts") — yet the file records its status as a free
      engineering choice.
    observed_at:
      - src/errors/status-map.ts
  - node: rules/integration/a-capability-declares-well-formed-schemas
    conforms: false
    how: >-
      opened as a candidate: `CapabilitySchemaNotWellFormedError` maps to 422 exactly as this node
      states; its sibling `MalformedCapabilityInputSchemaError` two lines later is cited correctly,
      but this entry carries no citation at all.
    observed_at:
      - src/errors/status-map.ts
notes: >-
  Judgment ran as six delegations, one per file, spawned together. status-map.ts's judge found
  every one of the file's own seventeen originally-bound nodes conforming — the departures are
  entirely in the header comment's blanket claim that "every other entry's status stays this
  project's own engineering decision, not a fact the specification holds", which fourteen
  candidate nodes it opened contradict, each already deciding the exact pairing the comment denies
  it. None of those fourteen was bound to this file before, so nothing here closes an existing
  binding for them; the record keeps them as findings rather than guessing a bind. One of them,
  rules/glossary/a-glossary-read-by-an-unheld-name-is-refused, is also a finding in wave 1's record
  over a different file (read-concept.controller.ts) — the two are independent surfacings of the
  same specification gap and both stand. Every finding on this record's own delegations carried an
  explicit node field, so no fallback attribution was needed here, unlike waves 1 and 2. Four
  findings converge on one underlying gap already surfaced in wave 2 — domain/investigation/
  assessment and domain/investigation/evaluation both drop register/usage/elapsed_ms/prompt at
  every layer this wave touches (the pipeline, the judgment retry path and the relational store) —
  confirming it is a specification-wide gap rather than one file's omission. A second cluster —
  constraints/the-deadline-is-an-absolute-propagated-instant and
  rules/investigation/no-stage-aborts-on-its-deadline both failing only at run-diagnosis.ts's own
  persistence stage — is a behavioral bug distinct from a citation gap: the persistence deadline
  window is computed against the request's entry instant rather than the remaining time, and its
  overrun is never retried.
---

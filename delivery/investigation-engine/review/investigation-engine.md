---
title: investigation-engine, first review
summary: What four passes found over the ten tasks this initiative delivered — coverage, specification conformance, standard conformance, and a failures pass that had nothing to diagnose since the captured run was fully green.
reviewed:
- src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/investigation/idempotency-key.spec.ts
- src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
- src/__tests__/unit/investigation/idempotency-resolution.spec.ts
- src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/observation-source-modules.spec.ts
- src/__tests__/unit/investigation/observation-source.port.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/errors/investigation-already-stored.error.ts
- src/errors/investigation-not-buildable.error.ts
- src/errors/investigation-store.error.ts
- src/investigation/assessment.ts
- src/investigation/citation-validation.ts
- src/investigation/citation.ts
- src/investigation/cost.ts
- src/investigation/draft-assessment-text.ts
- src/investigation/durations.ts
- src/investigation/evaluation-reason.ts
- src/investigation/evaluation.ts
- src/investigation/evidence-collection-stage.ts
- src/investigation/evidence-result.ts
- src/investigation/evidence.ts
- src/investigation/fake-hypothesis-evaluator.adapter.ts
- src/investigation/fake-observation-source.adapter.ts
- src/investigation/hypothesis-evaluator.port.ts
- src/investigation/idempotency-key.ts
- src/investigation/idempotency-lease-store.ts
- src/investigation/idempotency-resolution.ts
- src/investigation/investigation-factory.ts
- src/investigation/investigation-store.port.ts
- src/investigation/investigation.ts
- src/investigation/judgment-stage.ts
- src/investigation/observation-source.port.ts
- src/investigation/resolve-and-narrow-input.ts
- src/investigation/subject.ts
- src/investigation/verdict.ts
- src/persistence/file-investigation-store.repository.ts
tasks:
- task/evidence-collection/observation-source-port
- task/hypothesis-judgment/hypothesis-evaluator-port
- task/investigation-lifecycle/idempotency-window
- task/evidence-collection/evidence-collection-stage
- task/hypothesis-judgment/citation-validation
- task/hypothesis-judgment/judgment-stage
- task/assessment-drafting/resolve-and-narrow-input
- task/assessment-drafting/draft-assessment-text
- task/investigation-lifecycle/investigation-factory
- task/investigation-lifecycle/investigation-store
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/review-investigation-engine) passed cleanly across install, typecheck, lint, secret-scan and test — there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
coverage:
- criterion: The port's operation accepts a concept, a subject and the requester's own scope, and answers a result exactly as evidence-result enumerates it (ok, unavailable, denied or timeout), never throwing for a non-ok ending.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the ok ending carrying the actual observation seeded for the pair, not the bare tag alone
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the unavailable ending as data, without throwing
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the denied ending as data, without throwing
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the timeout ending as data, without throwing
- criterion: The fake adapter is the only concrete implementation this task ships, driven entirely by test-supplied fixtures, importing no network client and no framework.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
    name: the observation-source modules import no framework, no driver and no provider client
  - file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
    name: the observation-source modules import nothing from the standard library, so infrastructure cannot be reached from them directly
  - file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
    name: ships exactly one concrete class implementing IObservationSource
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: throws naming the concept rather than answering a default for a concept-and-subject pair nothing seeded
- criterion: A unit test drives the fake adapter through each of the four evidence-result endings and asserts the port answers each as data.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the ok ending carrying the actual observation seeded for the pair, not the bare tag alone
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the unavailable ending as data, without throwing
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the denied ending as data, without throwing
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the timeout ending as data, without throwing
- criterion: The port's evaluate operation takes exactly one hypothesis's criterion and its own evidence, and answers an Evaluation carrying a verdict, citations when decided and a reason when inconclusive.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the confirmed verdict with exactly the citations seeded for it
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the refuted verdict with exactly the citations seeded for it
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying no citations
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers by criterion alone, ignoring the evidence a call carries, even when the evidence array is empty
- criterion: The fake adapter is driven by test-supplied fixtures and returns confirmed, refuted and inconclusive evaluations on demand, importing no LLM or provider client.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
    name: the hypothesis-evaluator modules import no LLM or provider client, and no framework or driver beside them
  - file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
    name: the hypothesis-evaluator modules import nothing from the standard library, so infrastructure cannot be reached from them directly
  - file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
    name: ships exactly one concrete class implementing IHypothesisEvaluator
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: throws naming the criterion rather than answering a default for a criterion nothing seeded
- criterion: A unit test exercises the fake adapter for each of the three verdicts and asserts the shape of the Evaluation it answers.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the confirmed verdict with exactly the citations seeded for it
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the refuted verdict with exactly the citations seeded for it
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying no citations
- criterion: A repeated request whose key matches a completed investigation within the window answers that investigation, never starting a second one.
  state: unauditable
  tests:
  - file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    name: answers the completed investigation and claims no lease when the key already matches one
  - file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    name: answers completed no matter how far `now` sits from when the match might have been reached, since it never itself re-derives "within the window" from the completed match
  why: the task's own Notes flag this exact clause as UNDERDETERMINED — the rule bounds both branches by 'within the configured window' but the criterion's own text attaches window expiry only to the lease branch, and the task records that an implementation whose completed-match never expires still satisfies every stated criterion. The delivered module and its tests deliberately embody that one reading; a reader cannot tell from the criterion's own wording whether that is the reading intended or merely the one this delivery chose.
- criterion: A repeated request whose key matches a currently held lease joins it rather than starting a second investigation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    name: answers in-progress joining the exact lease already held for the key, rather than claiming a second one
  - file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    name: claims the lease itself on the free branch, so a second concurrent call for the same key joins it as in-progress rather than also answering free
- criterion: The in-progress marker holds only a key and an instant, never a domain state of the investigation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
    name: holds a lease carrying exactly the key and the acquiring instant, both on acquire and on a later read
  - file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
    name: exports nothing beyond the lease store itself — no stub investigation type or write path is exported from the module backing the in-progress branch
  - file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    name: exports nothing beyond the resolution composition itself — no stub investigation write path is exported alongside it
- criterion: A lease outside the configured window no longer blocks a fresh request.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
    name: 'answers acquired: true with a fresh lease once the previously held one has fallen outside the configured window'
  - file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
    name: answers the lease as absent exactly at the window's own boundary instant
  - file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    name: answers free with a freshly claimed lease once the previously held lease for the key has fallen outside the window
- criterion: Every concept in the case's collection plan produces exactly one Evidence, and no concept produces more than one.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: produces exactly one evidence per concept in the collection plan, deduplicating a concept two hypotheses both collect, each carrying its resolved capability and the stage own now as observed_at
- criterion: Collection calls observe-concept once per concept, in parallel, never serially.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: calls observe-concept exactly once for each concept in the plan, never more
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: 'runs every concept in parallel: a slow capability that has to time out never adds its own bound to a fast sibling''s completion time, and both still complete correctly'
- criterion: A capability whose observation has not returned by the collection stage's own budget (or whatever remains of the propagated deadline, whichever is smaller) is recorded as evidence with result timeout at that mark, never waiting for the capability's own longer declared timeout.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a timeout at the stage's own seven-second ceiling for a capability declaring ten seconds, unaffected by the three seconds its own declared timeout still had left (scenarios/investigation/a-slow-capability-yields-to-the-collection-budget)
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a timeout at a ceiling smaller than the nominal seven seconds when the propagated deadline is nearer
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: clamps the effective bound to zero, timing out immediately, once the propagated deadline has already elapsed by the time the stage starts
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: keeps the effective observation bound at the stage's own fixed seven-second ceiling, unaffected by how long the capability-registry read itself took
- criterion: Every observation call carries the requester's own scope, never the service's.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: carries the requester unmodified into every observe-concept call, never a substituted or defaulted value
- criterion: A non-ok ending (unavailable, denied or timeout) is recorded as the evidence's result and never raised as a thrown failure that aborts the stage.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a denied ending as the evidence result with an empty observation, rather than throwing and aborting the stage
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a timeout at the stage's own seven-second ceiling for a capability declaring ten seconds, unaffected by the three seconds its own declared timeout still had left (scenarios/investigation/a-slow-capability-yields-to-the-collection-budget)
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a concept nothing currently answers as unavailable, naming the concept, and never attempts to call observe-concept for it
- criterion: A citation naming a concept outside the judged hypothesis's collects is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a concept outside the judged hypothesis's collects, even though its field matches that concept's own capability schema
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: filters a proposed set of citations to only those accepted, keeping the accepted ones in the order they were proposed
- criterion: A citation naming a field absent from the output schema of the capability that produced the cited evidence is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a field absent from the output schema of the capability that produced the cited evidence, even though its concept is collected
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation against an output_schema that is not valid JSON, answering false rather than throwing
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation against an output_schema that parses as JSON but declares no top-level properties object
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation whose concept has no matching entry in the supplied evidence at all, answering false rather than throwing
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation whose field is declared only under a different capability_name/capability_version than the cited evidence's own
- criterion: A citation naming a concept in the hypothesis's collects and a field present in that capability's output schema is accepted.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: accepts a citation naming a concept in the hypothesis's collects and a field present in that capability's own output schema
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: filters a proposed set of citations to only those accepted, keeping the accepted ones in the order they were proposed
- criterion: Every hypothesis the pinned case requires receives exactly one evaluation, and no hypothesis is silently omitted.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted or duplicated
- criterion: Each hypothesis is judged in its own call, isolated from every other hypothesis's prompt, under a configured pool bound.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: calls evaluate() with only the judged hypothesis's own criterion and its own matched evidence, never another hypothesis's
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: never starts more evaluate() calls at once than the configured pool size, granting a queued hypothesis its call only once an earlier one frees a slot
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: keeps a hypothesis's retry under the same pool slot it already holds, never granting a queued sibling a slot while the retry is in flight
- criterion: A response whose citations fail structural validation triggers one retry when the remaining deadline admits it, and otherwise the evaluation falls back to inconclusive with reason judgment-failure.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: retries once on a decided answer whose citations fail structural validation, and returns the retry's valid decided answer
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: falls back to inconclusive judgment-failure when the retry's citations are also structurally invalid
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: refuses a citation whose field is declared only under a capability output-schema key that does not match the cited evidence's own capability_name/capability_version
  why: the 'when the remaining deadline admits it' clause has its true half proved (a retry is attempted and, if it fails again, falls to judgment-failure), but no test forces the deadline to have already elapsed at the moment the first answer's citations are found structurally invalid — the 'otherwise' branch, where retryOrFail's own deadlineGuard.elapsed() check must skip the second call entirely, is never exercised.
- criterion: A hypothesis that never receives a call slot before the stage's deadline, or whose call has not returned by then, is recorded inconclusive with reason deadline-exceeded, never no-data or judgment-failure.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records deadline-exceeded, never judgment-failure, for a call that has not returned by the stage's deadline
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records deadline-exceeded for a hypothesis denied a pool slot before the deadline, and never calls evaluate() for it at all
- criterion: A hypothesis whose evidence result is not ok is recorded inconclusive with reason no-data, citing that evidence.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for that hypothesis
- criterion: A confirmed or refuted evaluation carries at least one citation; an evaluation with none is never confirmed or refuted.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: passes through a confirmed answer with at least one citation unchanged
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: never returns confirmed or refuted for a decided answer carrying zero citations, even across a retry that also carries none
- criterion: The resolved outcome, referral and determining hypothesis equal exactly what the case's own resolve-outcome answers for the given evaluations, computed nowhere else.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: resolves the outcome, referral and determining hypothesis exactly as the case's own resolve-outcome answers, following the case's declared precedence rather than the evaluations' own order
- criterion: When a hypothesis confirmed, the narrowed input carries that hypothesis's own evidence and no other hypothesis's evidence.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: carries only the determining hypothesis's own evidence when one is confirmed, never a second confirmed hypothesis's evidence (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome)
- criterion: When no hypothesis confirmed, the narrowed input carries every evaluation's verdict and reason, and no case body.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: carries every evaluation's own verdict and reason, and no case body, when no hypothesis confirmed
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: omits the reason field from a fallback evaluation whose own verdict is confirmed or refuted, never just from an inconclusive one
- criterion: The narrowed input never contains the case's hypotheses' criteria or its when_to_use text.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: never carries a hypothesis's own criterion or the case's when_to_use text in the confirmed narrowed input
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: never surfaces a hypothesis's own criterion or the case's when_to_use in the fallback narrowed input, which never reads theCase itself
- criterion: The assessment's outcome, referral and determining hypothesis equal exactly the resolved values it was given, unchanged by drafting.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: copies outcome, referral and determining hypothesis from the resolved outcome, unchanged
- criterion: The assessment's determining hypothesis is present exactly when a hypothesis confirmed, and absent exactly when the fallback answered.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: carries the determining hypothesis exactly as resolved named it, when one confirmed
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: carries no determining_hypothesis field at all — not even present with an undefined value — when the fallback answered
- criterion: Drafting receives only the narrowed input a prior step assembled, never the case's own hypotheses or criteria.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
    name: draft-assessment-text.ts imports nothing at all from the case document module, so no field there could carry a hypothesis's own criterion or the case's when_to_use into drafting
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: drafts different text for two calls sharing the very same narrowed input but different resolved outcomes, reflecting resolved's own outcome and referral rather than answering with a text fixed in advance
- criterion: Drafting imports no framework, driver or provider client, remaining a pure function of its narrowed input.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
    name: assessment.ts and draft-assessment-text.ts import no framework, driver or provider client
  - file: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
    name: assessment.ts and draft-assessment-text.ts import nothing from the standard library, so infrastructure cannot be reached from them directly
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: answers synchronously with the result itself, never a Promise, so nothing here could be awaiting a database driver or a provider client
- criterion: The factory refuses to build an investigation whose evidence does not cover the case's collection plan exactly once per concept.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a collection-plan concept has no matching evidence
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when an evidence entry names a concept the collection plan does not hold
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a collection-plan concept has more than one matching evidence entry
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses once, naming every violation from both the evidence and the evaluation totality checks together
- criterion: The factory refuses to build an investigation whose evaluations do not cover the case's required hypotheses exactly once each.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a required hypothesis has no matching evaluation
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when an evaluation names a hypothesis the case does not require
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a required hypothesis has more than one matching evaluation
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses once, naming every violation from both the evidence and the evaluation totality checks together
- criterion: The built investigation pins the case by slug, version and hash, the model, the prompt version and the evidence.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: pins the case by exactly slug, version and hash, never the whole case
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: copies model, prompt_version and evidence straight from the given options, unchanged
- criterion: The built investigation is a plain immutable value with no method that mutates it after construction.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: answers a plain data object carrying no method, so nothing on the value itself could mutate it after construction
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: copies the given evidence array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: copies the given evaluations array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged
- criterion: The factory module imports no framework, driver or provider client.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
    name: subject.ts, cost.ts, durations.ts, investigation.ts, investigation-factory.ts and investigation-not-buildable.error.ts import no framework, driver or provider client
  - file: src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
    name: subject.ts, cost.ts, durations.ts, investigation.ts, investigation-factory.ts and investigation-not-buildable.error.ts import nothing from the standard library, so infrastructure cannot be reached from any of them directly
- criterion: Writing an investigation whose identity is already stored is refused rather than overwriting the earlier file.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    name: refuses to write an investigation whose id is already stored, rather than overwriting the earlier file
  - file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    name: leaves the first write's file exactly as it was after a refused second write to the same id
- criterion: A written investigation is retrievable afterwards by its identity, whole and unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    name: answers the written investigation by its id, whole and unchanged
  - file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    name: writes two different investigation ids independently, with neither affecting the other
- criterion: The store's write reuses the shared JSON-file writer rather than a second file-writing routine.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    name: creates the data directory when it does not yet exist, the way the shared JSON-file writer does for every other file store
  why: the only test bearing on this criterion checks recursive directory creation, a behavior a second, independently-written file-writing routine could just as easily reproduce; nothing checks a signature specific to the shared writer (its exact serialization, or a static-import check naming writeJsonFile), so the test would not fail if write() called an equivalent but separate routine instead.
findings:
- pass: conformance
  file: src/investigation/evidence.ts
  where: lines 12-21, the DEFAULT_EVIDENCE_TTL_SECONDS declaration
  evidence: "This stage has no reachable path to the concept's actual registered value (see this module's own inference on why, recorded in the implementation record rather than here), so every evidence this stage produces carries this default uniformly, regardless of its result.\n */\nexport const DEFAULT_EVIDENCE_TTL_SECONDS = 60;"
  cost: domain/investigation/evidence declares ttl as a required attribute but states no value for it; a reader who wants to know how fresh a piece of evidence must be before it is unusable will find that number decided only in this constant, and if a concept's own glossary-declared freshness tolerance is ever meant to differ from 60 seconds, every evidence record this module produces already carries a figure the specification never stated.
  correction: either the node that should hold the freshness figure states it and this module reads a concept's own declared ttl, or, if 60 seconds uniformly is itself the decided business rule, a specification node states that rather than leaving it to this constant alone.
- pass: conformance
  file: src/investigation/evidence.ts
  where: lines 23-32, the Evidence type's own doc comment on capability_name/capability_version
  evidence: '`capability_name`/`capability_version` carry that reference; both are the empty string where no capability currently answers the concept, since the relationship''s declared cardinality of exactly one cannot be honored where nothing was ever resolved to reference.'
  cost: domain/investigation/evidence declares the capability relationship with cardinality "1" — one reference, not zero-or-one — but this module's own comment admits it produces evidence whose capability reference is two empty strings rather than an actual pin. A reader of the node has no way to learn that this case (no capability currently registered) exists at all or that it is represented by an empty-string placeholder rather than an absent field.
  correction: the node states the cardinality this relationship actually has when no capability answers the concept (0..1, or an explicit carve-out), or the type makes capability_name/capability_version optional/absent rather than populating them with an empty-string placeholder that satisfies the type but not the stated cardinality.
- pass: conformance
  file: src/investigation/judgment-stage.ts
  where: lines 94-100, judgeOneHypothesis's own doc comment
  evidence: (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "a hypothesis denied a slot makes no call, so it costs nothing").
  cost: The comment attributes this sentence to the constraint node as if quoting it, but the node's actual fitness clause reads "One provider call per hypothesis appears in the recorded cost, and the pool bound is configuration" — the opposite expectation. A reader who follows this citation to check the rationale will not find the quoted sentence there, and will instead find the node requiring exactly the case (one call per hypothesis, always present in the recorded cost) that this code's own deadline-exceeded-before-slot path skips.
  correction: state the design choice as this module's own rationale rather than as the constraint's own words, and reconcile it with the fitness clause's stated expectation that every hypothesis's provider call appears in the recorded cost.
- pass: conformance
  file: src/investigation/judgment-stage.ts
  where: lines 346-353, noDataEvaluation
  evidence: 'citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept, field: '''' })),'
  cost: rules/investigation/a-cited-field-exists-in-the-capability-output-schema states without qualification that every field a citation names exists in the output schema of the capability that produced that evidence. Every no-data citation this function builds names the field '' — a value no capability's output schema declares as one of its own properties — and this path never runs through citation-validation's own check, so the rule's own machine-checkable guarantee is never true for it and never tested.
  correction: either the rule states the exception a no-data citation is meant to have, or a no-data citation names a field the cited capability's own output schema actually declares.
- pass: standard
  file: src/errors/investigation-already-stored.error.ts
  where: lines 10-19, the whole class body
  cites: COR-04
  evidence: "export class InvestigationAlreadyStoredError extends Error {\n  public readonly context: Readonly<{ id: string }>;\n  public constructor(id: string) {\n    super(...);\n    this.name = 'InvestigationAlreadyStoredError';\n    this.context = { id };\n  }\n}"
  cost: The class carries name, message and context but nothing naming a transport status, and no status-mapping module exists anywhere under src for a caller to look one up in instead. A caller that needs to answer an already-stored investigation with a transport status has nowhere in the codebase to read one from, so whichever handler is written next will choose the status inline the day one is needed, in exactly the scattered way this rule exists to prevent.
  correction: Add the one place COR-04 requires — a status-mapping module keyed by error, or a status this class itself carries — so this error already has an answer to give a caller rather than leaving it to whatever is written next.
- pass: standard
  file: src/persistence/file-investigation-store.repository.ts
  where: lines 37-47, the class and its write() method
  cites: STK-12
  evidence: "export class FileInvestigationStore implements IInvestigationStore {\n  public constructor(private readonly directory: string) {}\n  public async write(investigation: Investigation): Promise<void> {\n    const file = this.investigationFile(investigation.id);\n    const existing = await readJsonFileOrAbsent(file, raiseReadFailure(file));\n    if (existing !== undefined) {\n      throw new InvestigationAlreadyStoredError(investigation.id);\n    }\n    await writeJsonFile(file, investigation);\n  }\n}"
  cost: This is the store an investigation's whole persistence goes through, and it never talks to PostgreSQL — it reads and writes plain JSON files on the local filesystem instead. A reader checking the registry for what this service persists to will not find the filesystem named there, and the same disagreement between the registry and the code recurs at every other file-backed store in this tree.
  correction: Either route this store's persistence through the pg driver the registry names, or have the registry's own scope carve out the file-backed stores the specification's no-database constraint already puts outside a relational database.
- pass: standard
  file: src/persistence/file-investigation-store.repository.ts
  where: line 44 and line 62, the two raise sites
  cites: COR-02
  evidence: "throw new InvestigationAlreadyStoredError(investigation.id);\n...\nfunction raiseReadFailure(file: string): (failure: JsonFileFailure, cause: unknown) => Error {\n  return (failure, cause) => new InvestigationStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause });\n}"
  cost: Both InvestigationAlreadyStoredError and InvestigationStoreError, as raised here, carry a name, a message and a context — never a status. A caller of write() or read() that needs to answer with a transport-appropriate outcome has nothing on the error itself to branch on, and has to maintain a second, undocumented mapping by class name instead.
  correction: Give InvestigationAlreadyStoredError and InvestigationStoreError the status field COR-02 requires, or the one place COR-04 asks the mapping to live in, so a caller reading the error alone learns what to answer with.
---

## What it is

Four passes over the ten tasks this initiative delivered so far. `task/investigation-lifecycle/diagnose-entry-point` was never implemented and carries no record — it is not reviewed here, and its own standing BLOCKING note (no specification node states where a diagnose call's requester identity or ticket reference originates) is why: `/implement-task` stopped on it before writing anything, per the human's own instruction, and this review's absence of any finding, coverage entry or file touching it is that stop, not an oversight.

## Notes

The standard pass's STK-12 finding against the investigation store sits in tension with the specification's own constraints/the-mvp-persists-to-no-database, which the specification-conformance pass does not contest: the same file-backed pattern already exists for the case, glossary and capability stores delivered by the prior initiative, and none of them was flagged for it in that initiative's own review. Whether STK-12's own scope should carve out file-backed stores, or whether the registry's PostgreSQL-only statement is what the project actually wants enforced against every persistence path including the ones the specification itself keeps off a database, is a question over the registry, not over this code, and it is not this review's to settle.

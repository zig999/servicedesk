---
title: The evidence-collection stage — parallel, budgeted, scoped observation over a case's plan
summary: Adds Evidence and collectEvidence, the orchestration that turns a pinned case's collection plan into exactly one Evidence per concept, calling observe-concept in parallel in the requester's own scope, each call bounded by the smaller of the capability's own timeout and the collection stage's seven-second ceiling within the propagated deadline.
task: sha256:1e1b0b90820c545dbd499338c2c3f440e5bde64d62ebd646a8d2a489e9ba8f03
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/evidence-collection-evidence-collection-stage-build
files:
- path: src/investigation/evidence.ts
  effect: Declares the Evidence type (domain/investigation/evidence), concept, inputs, observation, observed_at, ttl, origin, result, result_detail, plus capability_name/capability_version materializing the node's relationship to domain/integration/capability, and DEFAULT_EVIDENCE_TTL_SECONDS (60), the ttl every evidence this stage produces carries uniformly.
- path: src/investigation/evidence-collection-stage.ts
  effect: Declares COLLECTION_STAGE_BUDGET_MS (7000), CollectEvidenceOptions and collectEvidence(options), the exported orchestration, plus its private helpers (collectOneEvidence, serializeInputs, effectiveBoundMsFor, raceObservation, evidenceOf, unavailableEvidence, settledEvidence) that resolve each concept's capability, race observe-concept against the smaller of the capability's timeout and the stage's own remaining ceiling, and turn every one of the four evidence-result endings, plus the stage's own timeout mark and the no-capability-held case, into one Evidence, never throwing for any of them.
criteria:
- criterion: Every concept in the case's collection plan produces exactly one Evidence, and no concept produces more than one.
  met: true
  how: collectEvidence calls collectionPlan(theCase) (already deduplicated and ordered by case-resolution.ts) and maps it through Promise.all into exactly one collectOneEvidence result per concept, with no branch that skips a concept or produces a second Evidence for one already handled.
- criterion: Collection calls observe-concept once per concept, in parallel, never serially.
  met: true
  how: concepts.map(...) starts every concept's own collectOneEvidence call in the same tick, before any of them is awaited; Promise.all awaits them together. Within one concept's own pipeline, observeConcept is called at most once (skipped entirely when no capability is held), and no concept's pipeline awaits another's before starting.
- criterion: A capability whose observation has not returned by the collection stage's own budget (or whatever remains of the propagated deadline, whichever is smaller) is recorded as evidence with result timeout at that mark, never waiting for the capability's own longer declared timeout.
  met: true
  how: stageCeilingMs = max(0, min(COLLECTION_STAGE_BUDGET_MS, deadline - now)), computed once at stage start exactly as the rule states for the whole stage. effectiveBoundMsFor(capability, stageCeilingMs) = max(0, min(capability.timeout, stageCeilingMs)), the same clamp scenarios/investigation/a-slow-capability-yields-to-the-collection-budget's own numbers exercise (10s capability, 7s ceiling gives a 7s bound). raceObservation races observeConcept's promise against a setTimeout(boundMs) and resolves TIMED_OUT the moment the timer fires, without waiting on the original promise any further; settledEvidence turns that into result 'timeout' with a result_detail naming the exact bound reached.
- criterion: Every observation call carries the requester's own scope, never the service's.
  met: true
  how: requester flows unmodified from CollectEvidenceOptions through collectOneEvidence's own options into observationSource.observeConcept(concept, subject, requester), the same value on every call, with no branch that substitutes, defaults or omits it.
- criterion: A non-ok ending (unavailable, denied or timeout) is recorded as the evidence's result and never raised as a thrown failure that aborts the stage.
  met: true
  how: settledEvidence maps the timeout mark and every one of observe-concept's own four ObservationOutcome results into a plain Evidence through evidenceOf, and unavailableEvidence does the same for a concept nothing currently answers, none of these paths throws. Only a genuine promise rejection (not one of the four endings, which the port's own contract says observeConcept never throws for) propagates as a thrown error out of raceObservation, since that is a fault this stage has no evidence-result ending to represent, not a domain outcome to swallow.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/evidence.ts
  - src/investigation/evidence-collection-stage.ts
  how: evidence.ts declares every attribute the node lists (concept, inputs, observation, observed_at, ttl, origin, result, result_detail) plus capability_name/capability_version materializing the node's own relationship to domain/integration/capability (which registered capability, at which version, produced this observation). evidence-collection-stage.ts is where the whole record is assembled per concept from the case's plan, the capability read and the observation-source answer, the assembly task/evidence-collection/observation-source-port's own record explicitly deferred here.
- node: domain/investigation/evidence-result
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: settledEvidence and unavailableEvidence are the one place in this task where each of the four evidence-result values gets assigned to a concept's Evidence, 'ok' and 'observation' only together, 'unavailable'/'denied'/'timeout' with observation as the empty string, reusing the EvidenceResult type verbatim rather than redeclaring it.
- node: rules/investigation/collection-runs-in-the-requester-scope
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: requester is threaded through CollectEvidenceOptions to CollectOneEvidenceOptions to observationSource.observeConcept unmodified; nothing in the module reads or constructs a service-wide identity.
- node: rules/investigation/one-evidence-per-collected-concept
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: the Promise.all(concepts.map(...)) shape guarantees exactly one Evidence answered per entry of collectionPlan(theCase), which is itself already the deduplicated set, no separate id is invented, the concept is the identity, matching the node's own description.
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: COLLECTION_STAGE_BUDGET_MS = 7000 is the stage's own nominal budget; stageCeilingMs and effectiveBoundMsFor together implement 'a capability's own declared timeout governs a single call, but never past whatever of that seven-second budget the propagated remaining time still allows' exactly as the rule states it.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: this task answers only the clause the task's own ADVISORY/REMAINDER notes assign it, 'collection records a timeout result', via settledEvidence's timeout branch, never a thrown failure. The judgment and persistence clauses are, per the task's own Notes, task/hypothesis-judgment/judgment-stage's and the persistence tasks' to answer, not built here.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: this task demonstrates only its own slice of the given/when/then, 'the evidence for equipment-state records result timeout' when the capability exceeds its own bound at collection close. The evaluation-is-inconclusive-with-reason-no-data clause and the investigation-proceeds-within-deadline clause belong to later stages (judgment, the entry point) this task's objective never reaches.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: effectiveBoundMsFor and raceObservation together reproduce the scenario's own numbers exactly, a capability declaring 10s, a 7s stage ceiling with the full 7s still remaining at collection start, yields an effective bound of 7s and a timeout evidence at that mark, unaffected by the three seconds the capability's own declared timeout still had left.
- node: contracts/investigation/observation-source
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: this module is the contract's declared consumer, the collection stage calling observe-concept once per concept in the plan, in parallel, through IObservationSource alone, never a connector.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: deadline and now both arrive as CollectEvidenceOptions fields, never read from the system clock or derived internally; stageCeilingMs = min(nominal, deadline - now) is exactly 'every stage receives the minimum of its nominal budget and the remaining time', the one clause the task's own ADVISORY note says this stage can demonstrate alone. Recording the deadline at request entry and keeping the internal total below the caller's timeout are whole-request properties this task does not attempt.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/evidence.ts
  - src/investigation/evidence-collection-stage.ts
  how: both files import only local relative modules (case, case-resolution, capability-query.port, capability, evidence-result, observation-source.port) and no package or node builtin, the timer, JSON and Date operations used are all global runtime primitives, not imports.
inferences:
- inferred: for a non-ok result, evidence.observation is recorded as the empty string, never a fabricated value.
  from: the task's own flagged tension between evidence.observation's unconditional required:true and evidence-result's 'only ok carries a usable observation; the other three are facts about the attempt', treated as a representation choice rather than a domain fact in dispute. The empty string keeps the field's declared type total without inventing content that would read as real data, and result_detail (already optional and unused by the port for these endings) is where this stage puts whatever descriptive fact it does have.
- inferred: evidence.inputs is JSON.stringify({ concept, subject, requester }), a serialization of the exact three arguments this stage actually passed to observeConcept.
  from: the task's own flagged tension between decision-log's 'a serialized form... pinned for replay as recorded bytes' and observeConcept taking no separate inputs argument of its own. Since observe-concept's whole call surface is concept, subject and requester, serializing exactly those three is the literal recorded bytes of the one call this stage made, sufficient to replay it.
- inferred: a concept whose capability is not currently held (CapabilityResolution.held === false) is recorded as evidence-result 'unavailable', with result_detail naming the concept.
  from: none of evidence-result's four endings names 'not registered' directly; 'unavailable' is the only one of the four that does not presuppose a capability existing to time out, be denied by, or answer ok, 'denied' implies an authorization refusal that never occurs (no call is even attempted), and 'timeout'/'ok' both presuppose an attempted call.
- inferred: every Evidence this stage produces carries ttl = DEFAULT_EVIDENCE_TTL_SECONDS (60), uniformly, regardless of which of the four results it carries or whether a capability was held.
  from: rules/knowledge/a-collected-concept-declares-a-ttl and constraints/the-evidence-cache-admits-only-ok-results both state evidence's ttl is the collected concept's own declared ttl, sourced from the glossary, but epic/evidence-collection.md's own uncovered list states plainly that no task in this epic calls the glossary directly and separately excludes the cache constraint as a day-two, not-MVP concern. With the true per-concept value structurally unreachable from this task's own composed inputs, and no consumer of evidence.ttl existing anywhere in this plan, this reuses the one concrete number the specification itself already commits to for this exact field elsewhere, the concept-ttl rule's own stated default of sixty seconds, as a uniform placeholder, rather than inventing an unrelated number or leaving the required field without a defensible source.
- inferred: the node's relationship to domain/integration/capability is materialized as two required string fields, capability_name and capability_version, both the empty string where no capability was ever resolved to reference.
  from: evidence.md's attributes list does not itself name this reference (it is declared only in the separate relationships section, cardinality 1), and no other node states a field name for it; two flat scalar fields mirror the codebase's existing flat style and the node's own wording ('which registered capability, at which version'), kept required rather than optional, with the empty string standing for 'no capability held', for the same reason and by the same convention as the observation/origin fields.
- inferred: origin is the resolved capability's own connector name whenever a capability is held (regardless of which of the four results follows), and the empty string only where no capability is held at all.
  from: evidence.md's description says origin 'names where the observation came from, for audit', and the connector is literally what/where an attempted observation comes from per capability.ts's own description ('its connector names the adapter that executes it'), this stays meaningful even for a denied or timed-out attempt (the connector was still the one addressed), and only genuinely has nothing to name when no capability was ever resolved.
- inferred: observed_at is the ISO-8601 form of the stage's own now parameter (its start instant), recorded identically on every Evidence this call produces, rather than a separately sampled settle time per concept.
  from: the task's own instruction to take now as an explicit parameter and never read the system clock internally, the same discipline idempotency-lease-store.ts/idempotency-resolution.ts already established; no port or upstream data supplies a finer-grained per-call instant, and sampling one via a live clock read inside this stage would break that discipline and the deterministic-fixture testing it exists for.
- inferred: a genuine rejection from observeConcept (as opposed to the stage's own deadline-derived timeout) is left to propagate as a thrown error out of collectEvidence, never caught and turned into a non-ok Evidence.
  from: the observation-source-port task's own record calls the fake's one throw path 'a test setup fault, not one of the four evidence-result endings', and the port's contract states observe-concept never throws for a legitimate ending, so a rejection reaching this stage is, by that same reasoning, a fault outside the four endings this stage has a representation for, not a domain outcome to render as data.
- inferred: the per-concept effective bound is computed from one single stageCeilingMs value, calculated once at the top of collectEvidence from the given now and deadline, and used unchanged for every concept in that call, never re-derived per concept from a fresh clock read as each one's own readCapability or race settles.
  from: the rule's own wording names the effective ceiling for the whole stage (all concepts in parallel) as one min(7000, deadline-now) computation, with each call's own bound only further clamped by its own capability.timeout against that one shared figure, not a moving target recomputed per concept, which this module has no clock to recompute from in any case.
- inferred: the capability-registry's own readCapability call is not itself raced against a timer or charged against the stage's ceiling, only the observe-concept call is.
  from: the rule's statement scopes the timeout regime to 'a single call' and both the contract and the epic's own uncovered list scope this task's timing concern to observe-concept alone, with capability resolution named explicitly as 'the capability-registry's own already-delivered read', outside what this epic's tasks bound by a race.
deferred:
- what: sourcing evidence.ttl from the concept's actual glossary-registered value instead of the uniform sixty-second default.
  why: doing so needs a dependency on the glossary this epic's own uncovered decision (epic/evidence-collection.md) explicitly withholds from every task in it; revisiting this is contingent on that epic-level decision changing or on the (not-yet-built, explicitly day-two) evidence cache task that would first give the value a consumer.
- what: an automated import-purity/module-composition sweep scoped explicitly to this task's own two files, mirroring hypothesis-evaluator-modules.spec.ts's own task-scoped pattern.
  why: authoring that test is proof's task, not this implementation's; the existing observation-source-modules.spec.ts already sweeps this directory dynamically and will pick these files up unmodified, but asserting that as this task's own proof is not mine to do.
- what: wiring collectEvidence into any factory under src/factories/ or into a production entry point.
  why: no consumer exists yet, task/investigation-lifecycle/investigation-factory and task/investigation-lifecycle/diagnose-entry-point are what compose this stage's output with judgment, drafting and persistence; a wiring point built here would be a wiring point for nobody yet.
- what: the real IObservationSource connector actually reaching a corporate system and enforcing the requester's scope behaviorally.
  why: already this epic's own declared remainder, per task/evidence-collection/observation-source-port's own record; this task calls the port and its fake exactly as delivered, and builds no second implementation of it.
---

## What it is

The orchestration that turns a case's collection plan into one evidence record per concept. It resolves each concept's capability through the existing capability-registry read, then calls the observation-source port in parallel under the collection budget.

## Notes

Two genuinely unstated shapes were decided here as ordinary inferences, not left open: evidence.observation is the empty string for a non-ok result, and evidence.inputs is a serialization of exactly the concept/subject/requester triple this stage passed to observe-concept. A third — evidence.ttl — reuses the concept-ttl rule's own sixty-second default as a uniform placeholder, since the true per-concept value is structurally unreachable without a glossary dependency this epic's own scope withholds; deferred, not decided as a domain fact.

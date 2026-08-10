---
title: Observation-source port and its fake adapter
summary: IObservationSource, the port the collection stage will call to observe one concept for one subject, and FakeObservationSource, the only concrete implementation this task ships — a fixture-driven double answering all four evidence-result endings with no real connector.
task: sha256:494485e0e0bb6b2807656db1cb14a834eb11fa4dded5e5f82782f4f36b68fac2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/evidence-collection-observation-source-port-build
files:
  - path: src/investigation/evidence-result.ts
    effect: declares the closed four-value evidence-result vocabulary — EVIDENCE_RESULTS and the EvidenceResult type ('ok' | 'unavailable' | 'denied' | 'timeout') — as its own module, the way capability.ts already declares CAPABILITY_NATURES beside the capability it belongs to.
  - path: src/investigation/observation-source.port.ts
    effect: declares the Subject shape (type, id) the port's second parameter needs, the ObservationOutcome answer type (the ok branch carries an observation string, the other three carry only their ending, tied to EvidenceResult by Exclude so a fifth ending added there is a fifth ending here automatically), and the IObservationSource interface with its one operation, observeConcept(concept, subject, requester), returning Promise<ObservationOutcome>.
  - path: src/investigation/fake-observation-source.adapter.ts
    effect: declares FakeObservationSource, the only concrete IObservationSource this task ships — a Map-backed double whose seed(concept, subject, outcome) is the only way an answer ever enters it, and whose observeConcept resolves to exactly the seeded ObservationOutcome for that concept-subject pair, or throws a plain Error naming what was never seeded. No network client, no framework, nothing imported beyond the port's own local types.
criteria:
  - criterion: The port's operation accepts a concept, a subject and the requester's own scope, and answers a result exactly as evidence-result enumerates it (ok, unavailable, denied or timeout), never throwing for a non-ok ending.
    met: true
    how: IObservationSource.observeConcept(concept, subject, requester) takes exactly those three positionally and answers Promise<ObservationOutcome>, whose result field is always one of the four evidence-result values. FakeObservationSource resolves the promise with the seeded outcome for every one of the four endings, never rejecting for any of them; its one throw path is a distinct test-setup fault (nothing seeded for the pair asked about), not a representation of unavailable, denied or timeout as an exception.
  - criterion: The fake adapter is the only concrete implementation this task ships, driven entirely by test-supplied fixtures, importing no network client and no framework.
    met: true
    how: FakeObservationSource is the only class this task adds. It carries no built-in outcome logic — seed() is the sole way its internal map gains an entry, and observeConcept only ever answers what was put there or throws that nothing was. Its only import is the port's own local module; no package, network client or framework appears anywhere in the file.
  - criterion: A unit test drives the fake adapter through each of the four evidence-result endings and asserts the port answers each as data.
    met: true
    how: This record writes source only — the test itself is the proof record's, written in its own context by this framework's split between implementer and test-author. What the source provides is exactly what that test needs — seed(concept, subject, {result, observation?}) for each of the four shapes — with observeConcept resolving to precisely the seeded value every time, so a test driving the fake through all four and asserting the port answers each as plain data has everything it needs.
nodes:
  - node: domain/investigation/evidence
    encoded_at:
      - src/investigation/observation-source.port.ts
    how: ObservationOutcome's ok branch carries observation as a string, exactly evidence.observation's declared shape, and result is one of evidence.result's four evidence-result values. The rest of evidence's attributes — concept, inputs, observed_at, ttl, origin, result_detail and the pinned relationship to domain/integration/capability — are not built here, since this task ships the boundary a caller reaches to obtain one ending and one observation, not the whole persisted Evidence record, which the collection stage that calls this port will assemble from this answer plus the concept, timing and capability it already holds.
  - node: domain/investigation/evidence-result
    encoded_at:
      - src/investigation/evidence-result.ts
      - src/investigation/observation-source.port.ts
    how: EVIDENCE_RESULTS/EvidenceResult in evidence-result.ts is the node's four values verbatim, in the node's own order. ObservationOutcome's two-armed union — the ok branch against Exclude<EvidenceResult, 'ok'> for the rest — is exactly the node's own split, where only ok carries a usable observation, and the other three carry nothing but their ending.
  - node: rules/investigation/collection-runs-in-the-requester-scope
    encoded_at:
      - src/investigation/observation-source.port.ts
    how: observeConcept's third parameter, requester, is required on every call; nothing in the signature lets a caller omit it or substitute a service-wide identity of its own, so the port's shape makes the invariant impossible to route around from the collection side. FakeObservationSource accepts and threads the argument through unused, because actually scoping a call to that identity is the real connector's concern, left to this epic's declared remainder — this task honors the rule structurally, in the contract every future implementation must satisfy, without yet enforcing it behaviorally since no real connector exists to enforce it against.
  - node: contracts/investigation/observation-source
    encoded_at:
      - src/investigation/observation-source.port.ts
    how: IObservationSource, with its one operation observeConcept, is this consumed contract — the collection stage depends on this interface alone, never on a connector, and its declared upstream is contracts/integration/concept-observation, matched one operation to one operation.
  - node: contracts/integration/concept-observation
    encoded_at:
      - src/investigation/observation-source.port.ts
      - src/investigation/fake-observation-source.adapter.ts
    how: This published contract's one operation, observe-concept, is what observeConcept stands for from the consuming side, and FakeObservationSource is this task's whole answer to what a real implementation of it would eventually be — it observes one concept for one subject within a requester scope required on every call, and answers in the glossary's vocabulary as a plain observation string on ok. What it does not do — actually reaching a corporate system, and bounding the call by the capability's own timeout — is exactly what the real connector, this epic's declared remainder, adds behind the same interface without changing any caller.
  - node: constraints/the-domain-depends-on-no-infrastructure
    encoded_at:
      - src/investigation/evidence-result.ts
      - src/investigation/observation-source.port.ts
      - src/investigation/fake-observation-source.adapter.ts
    how: All three files import only each other's local types through relative .js specifiers — no framework, driver or provider client appears in any of them. No automated repository-wide sweep of src/investigation exists yet the way case-document-modules.spec.ts sweeps src/case; this fitness is satisfied by inspection here, and closing that gap with an automated sweep is deferred, so it is not silently assumed already covered.
inferences:
  - inferred: the port's third parameter, requester, is a plain string — the same opaque identity domain/investigation/investigation.requester already declares — never a modeled "scope" value of its own.
    from: decision-log.md's entry on investigation.requester.type ("the requester is an identity carried to the connectors for scoping ... the scope itself lives with authorization, not the domain"), together with the rule's and the contract's own wording — "the requester's own scope" / "within the requester's scope" — both describing the call as happening within that identity's scope, not naming a second, separate scope value.
  - inferred: "subject is modeled as { type: string; id: string }, exactly the shape domain/investigation/subject already declares, reused here even though that node is not itself among this task's implements."
    from: the task's own criterion 1 names "a subject" as a parameter with no shape stated in this task's own implements list, and domain/investigation/subject is the only node in the specification that already gives that word a shape — reusing an already-decided shape rather than inventing a second one for the same word.
  - inferred: concept is a plain string — the glossary name a concept is published under — never the full domain/glossary/concept value object.
    from: "the existing capability-query.port.ts already resolves a concept by exactly this shape (readCapability(concept: string)), and the inventory's own module boundary forbids reaching into glossary/, so the full Concept object was never reachable from here regardless."
  - inferred: the ok ending carries an actual observation string, rather than only the bare result tag the task's own Notes flag as a literal-minimum reading that would still pass criteria 1-3.
    from: the task's ## Notes name the tension directly — contracts/integration/concept-observation's "answering in the glossary's vocabulary" and evidence-result's "only ok carries a usable observation" both presuppose a real observed value on ok, so this went with the reading consistent with those two rather than the bare-minimum one the same Notes say would also satisfy the criteria as written.
  - inferred: a concept-subject pair nothing seeded throws a plain Error — not one of the four evidence-result endings, and not a typed error class under src/errors.
    from: criterion 2's "driven entirely by test-supplied fixtures" rules out any built-in default answer, and no specification node describes what an untested double should answer for a pair nobody set up — a test-harness fault rather than a domain fact, so it stays a plain, local error rather than a new named error type nothing in the specification calls for.
  - inferred: the fake ships as its own file under src/investigation, suffixed .adapter.ts, rather than as a private class declared inside a spec file.
    from: criterion 2's "the fake adapter is the only concrete implementation this task ships" reads as a deliverable of the source tree itself, not a test-file detail, and the codebase's existing suffix convention — .port.ts, .service.ts, .repository.ts each naming a file's architectural role — extends naturally to one more role (an adapter behind a port) the codebase has not needed a name for until now.
deferred:
  - what: the real connector behind IObservationSource — actually invoking a registered capability over the network, within the requester's authorization scope, and bounding the call by the capability's own declared timeout.
    why: the task's own rationale reserves this for the epic's declared remainder; building it here would add the exact real infrastructure dependency criterion 2 forbids this task from shipping.
  - what: wiring any IObservationSource implementation into a factory under src/factories/, or into a production consumer.
    why: no consumer exists anywhere in this tree yet — the collection stage that will call observeConcept is a later task's to build, and a factory with nothing to wire would be a wiring point for nobody.
  - what: assembling the full domain/investigation/evidence record — concept, inputs, observed_at, ttl, origin, result_detail and the pinned capability reference — from an ObservationOutcome.
    why: that assembly belongs to the collection stage that calls this port and already holds the concept, the resolved capability and the timing this task's objective never reaches.
  - what: an automated import-purity audit over src/investigation, mirroring how case-document-modules.spec.ts sweeps src/case, proving constraints/the-domain-depends-on-no-infrastructure mechanically for this new module.
    why: writing that test is proof's task, not this implementation's; named here so the gap is visible rather than silently assumed already covered.
---

## What it is

The interface between the collection stage and one concept's observation, and a fake adapter that answers controlled fixtures so the collection stage's own logic is testable without a real connector.

## Notes

The UNDERDETERMINED note the task carries — whether the ok ending must carry an actual observed value — is resolved by including one: `ObservationOutcome`'s ok branch carries `observation: string`, matching what `contracts/integration/concept-observation` and `evidence-result` both presuppose, rather than the bare-minimum reading the task's own criteria would also have allowed.
No production consumer of `IObservationSource` exists yet, and none is wired here — that is a later task's (`evidence-collection-stage`).

---
title: Proof for read-case, the knowledge context's composed publication-gate-free read
summary: Unit tests against port fakes for CaseQueryService.readCase and the standalone replayCase, plus integration tests through createCaseQuery over real file-backed stores, proving content-pinned answers, per-half-joint refusal, later-read refusal on dependency drift, revalidation-free replay, and the absence of any publication gate.
implementation: sha256:8a755a23eee8c05540202dc48fa765b8e41e01f833750d450e8a101ffd52a59e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-store-read-case-suite-2
tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the case whole, matching exactly what the document holds, when every structural and coherence rule holds for it
    proves: "Reading a case every rule holds for answers the case whole, pinned by content."
    fails_when: readCase drops, reorders or mistranslates any attribute of the parsed document into the answered Case
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: pins the answered case by exactly the hash the store attached to the version this call read, not a value read-case computes itself
    proves: "Reading a case every rule holds for answers the case whole, pinned by content. — and the UNDERDETERMINED note's routing concern: the pin is the store's own content identity, relayed rather than recomputed"
    fails_when: readCase answers any hash other than the exact one ICaseStore.readVersion returned for that call
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: pins each version by its own hash, never another version's
    proves: "Reading a case every rule holds for answers the case whole, pinned by content."
    fails_when: readCase answers a hash belonging to a different stored version than the one addressed
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
    proves: the composition's typed refusal for an unwritten version, distinct from CaseNotValidError
    fails_when: readCase throws anything but CaseNotFoundError, or omits the slug or version, for a version nothing stored
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a case failing one structural rule, naming the violation in a CaseNotValidError
    proves: "Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal."
    fails_when: a structural violation stops being converted into CaseNotValidError, or the violation text is dropped or altered
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several structural violations into the one CaseNotValidError
    proves: "Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal."
    fails_when: readCase reports fewer than all the structural violations the document holds, or reorders them
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally valid case failing one coherence rule, as the composed CaseNotValidError rather than the coherence module's own IncoherentCaseError
    proves: "Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal — the composition's own type-level join."
    fails_when: readCase lets IncoherentCaseError reach the caller unconverted, or drops the violation text
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several coherence violations into the one CaseNotValidError
    proves: "Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal."
    fails_when: readCase reports fewer than all the coherence violations the case holds against the current glossary and registry, or reorders them
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: names only the structural violations, never a coherence one, when a document fails both a structural rule and what would otherwise be a coherence rule — a document that fails to parse never reaches the coherence checks
    proves: the actual boundary of criterion 2's join, as case-query.service.ts's own code states it — see contested
    fails_when: the coherence violation the glossary would otherwise report appears alongside the structural one, or the structural violation stops appearing at all
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: lets a capability-registry integrity failure reach the caller rather than becoming a coherence violation of the case
    proves: an upstream integrity failure is not swallowed into CaseNotValidError by this composition
    fails_when: readCase catches the thrown DuplicateConceptAnswerError and turns it into a coherence violation, or into any other resolved outcome
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the glossary no longer holds a concept it depends on
    proves: "A case that validated at one read is refused at a later read when the glossary or registration it depends on no longer satisfies a rule."
    fails_when: readCase's second call still answers the case, or throws anything but CaseNotValidError, once the glossary no longer holds the concept
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the capability registry no longer answers a concept it depends on
    proves: "A case that validated at one read is refused at a later read when the glossary or registration it depends on no longer satisfies a rule."
    fails_when: readCase's second call still answers the case, or throws anything but CaseNotValidError, once the registry no longer answers the concept
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers readCase and replayCase identically, in shape, for the same valid pinned version
    proves: "A replay read of a pinned version answers the exact version pinned, without revalidation."
    fails_when: replayCase's answer differs in case content or in hash from what readCase answered for the same valid version
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: replays a pinned version without running the coherence checks at all, answering the case even though the same content would refuse at read-case
    proves: "A replay read of a pinned version answers the exact version pinned, without revalidation."
    fails_when: replayCase throws, or answers differently, once the glossary and registry no longer satisfy what readCase would require
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a replay from just the case store, with no glossary or capability dependency for it to call at all
    proves: the implementation's recorded inference that replay-case is a standalone function taking ICaseStore directly, not a second method on ICaseQuery
    fails_when: replayCase cannot be invoked, or fails, without a glossary or capability argument
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses replay with the same CaseNotFoundError as read-case when the pinned version was never stored
    proves: the implementation's recorded inference that an unstored version is a thrown CaseNotFoundError, exercised here for replay-case as well as read-case
    fails_when: replayCase resolves for an unwritten version, or throws anything but CaseNotFoundError
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: lets a structural parse failure inside replay-case propagate as InvalidCaseDocumentError, never joined into CaseNotValidError
    proves: the implementation's recorded inference that a structural parse failure inside replay-case is left as InvalidCaseDocumentError, unjoined into CaseNotValidError
    fails_when: replayCase throws CaseNotValidError instead of InvalidCaseDocumentError for a structurally invalid stored document, or does not throw at all
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a version written directly to the store as its very next read, with no separate publish step anywhere in this composition
    proves: "No publication gate stands between the authored file and its reading, so a file every rule holds for is a case at its next read."
    fails_when: a version written through ICaseStore.writeVersion is not answered by the very next readCase call for it
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a case whose document declares a version different from the version number it is addressed by, since read-case never cross-checks the two
    proves: the implementation's recorded inference that the document's own declared version attribute is never cross-checked against the version number used to address it in the store
    fails_when: readCase refuses, or silently substitutes the addressed version, when the document's own version field disagrees with the version it was read at
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: answers a case written directly to the real store, pinned by the sha256 of the exact bytes on disk, with no publish step in between
    proves: "Reading a case every rule holds for answers the case whole, pinned by content. and No publication gate stands between the authored file and its reading — through the real file-backed composition rather than fakes"
    fails_when: the answered hash differs from the independently computed sha256 of the exact file on disk, or the version written through the real store is not immediately readable
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses through the real wiring a case document declaring no hypothesis, naming the structural violation
    proves: "Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal — through the real wiring"
    fails_when: the real composition answers the case instead of refusing it, or refuses with anything but CaseNotValidError naming the structural violation
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses through the real wiring a structurally valid case whose collected concept the glossary does not hold, as the composed CaseNotValidError rather than the coherence module's own IncoherentCaseError
    proves: "Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal — through the real wiring, and the composition's type-level join"
    fails_when: the real composition lets IncoherentCaseError escape unconverted, or answers the case despite the missing concept
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses at a later read, through the real wiring, a case that validated earlier once the glossary file no longer holds a concept it depends on
    proves: "A case that validated at one read is refused at a later read when the glossary or registration it depends on no longer satisfies a rule — through the real file-backed glossary"
    fails_when: the second real-wiring read still answers the case after the concept is edited out of the glossary's own file
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: replays the pinned version through the real store, answering it unchanged even after the real capability registration the case depends on is edited away
    proves: "A replay read of a pinned version answers the exact version pinned, without revalidation — through the real file-backed store"
    fails_when: replayCase over the real store answers differently from the earlier valid read, or throws, once the registration is edited away
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: routes each of the three dependencies to the directory named for it, whether all three differ or two of them coincide
    proves: the implementation's recorded inference that createCaseQuery takes three independent data-directory parameters rather than assuming one shared root
    fails_when: the real composition fails to read the case, the glossary or the capability registration when two of the three data directories happen to coincide, or when routed incorrectly among the three parameters
not_applicable:
  - edge_case: two readCase (or replayCase) calls against the same subject at once
    why: read-case is a pure read composed from three stateless port calls per invocation, and no bound node states a concurrency guarantee
  - edge_case: a boundary at either end of a stated range for the version number
    why: no criterion or bound node states a version range; version is an opaque integer address into the store
  - edge_case: a dependency that answers slowly or times out
    why: no bound node states latency or timeout behavior for read-case's own three port calls
  - edge_case: a duplicate hypothesis name within one case
    why: detecting it is case-document-model's own structural rule and its own proof's concern; this task's contribution — joining whatever structural violations exist — is already exercised without re-deriving that logic
untested:
  - a DuplicateGlossaryNameError (or other glossary-port integrity failure) propagating uncaught through readCase, symmetric to the capability-registry integrity-failure test written above — the same delegate-straight-through code path applies, but no test exercises that specific failure
contested:
  - what: "The implementation record's original Notes claimed this composition proves a case violating both a structural and a coherence rule at once refuses in a single error, naming both halves together. No test proves that: readCase's structuralCase() throws CaseNotValidError immediately on any structural violation, before refuseIncoherence is ever invoked — a document that fails to parse never reaches the coherence checks at all, so no document can produce a joint refusal naming violations from both halves in one call."
    why: "Criterion 2, read literally (every violated rule named in the one refusal), does not require the two halves to combine; it is satisfied by joining every violation of whichever half actually ran — which is what this proof tests, together with the short-circuit boundary itself (the 'names only the structural violations…' test). No test was written for the joint-both-halves refusal the original Notes described, because it would have to fail against the code as written, and a test written to fail against correct code would misstate what this composition does. The implementation record's Notes have been corrected to state this accurately rather than resolved away."
---
## What it is
Twenty-six tests — eighteen unit against port fakes, eight integration through the real file-backed composition — proving content-pinned answers, the per-half joint refusal, later-read refusal on dependency drift, revalidation-free replay, and the absence of any publication gate.
One contested finding: an overclaim in the implementation's own prose about combining structural and coherence violations in one call, which the code correctly never does and cannot do — recorded rather than papered over.

## Notes
The short-circuit is not a shortcut: coherence checking operates on the parsed aggregate, which a structural failure never produces, so joining both halves in one call is not just untested but impossible by the composition's own necessary order.
The suite's first run (run/case-store-read-case-suite) failed at lint on a test helper exceeding the standard's parameter cap; fixed by collapsing two trailing parameters into one options object, with no change to any assertion. This record points at the run that followed, run/case-store-read-case-suite-2.

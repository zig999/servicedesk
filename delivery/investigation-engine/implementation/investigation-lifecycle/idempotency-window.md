---
title: The idempotency-window lease mechanism
summary: A subject-type/subject-id/case/ticket-reference key, an in-memory key-and-instant lease store bound to a configured window, and a pure composition that tells a caller which of completed, in-progress or free applies — with no built Investigation and no wiring into a real diagnose entry point.
task: sha256:d5b7ba4a97d1f22a116a4d84dfa3e8772deaf50d43ea91a3bd645752f7b3ca2d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/investigation-lifecycle-idempotency-window-build
files:
- path: src/investigation/idempotency-key.ts
  effect: declares IdempotencyKey ({ subjectType, subjectId, caseReference, ticketRef }), the four flat values rules/investigation/an-investigation-is-idempotent-within-a-window names as what a repeated request repeats, and idempotencyKeyOf(), the canonical `::`-joined string form used to index a lease by that key.
- path: src/investigation/idempotency-lease-store.ts
  effect: declares Lease ({ key, heldAt }), AcquireResult ({ acquired, lease }), and IdempotencyLeaseStore, an in-memory, Map-backed store bound to a configured windowMs at construction. acquire(key, now) atomically checks and claims a lease per key (claiming afresh when none is held or the held one is outside the window, otherwise leaving the held one untouched and answering it for the caller to join); currentLease(key, now) reads a lease as absent once it falls outside the window, deriving that from the two instants alone rather than from a stored flag.
- path: src/investigation/idempotency-resolution.ts
  effect: declares IdempotencyOutcome<CompletedMatch> (the three outcomes — completed, in-progress, free — generic over what a completed match carries), ResolveIdempotencyOptions<CompletedMatch>, and resolveIdempotency(), the pure composition that calls a caller-supplied findCompleted first, then IdempotencyLeaseStore.acquire, and answers exactly one of the three outcomes, claiming the lease itself on the free branch so a concurrent duplicate call sees it as held.
criteria:
- criterion: A repeated request whose key matches a completed investigation within the window answers that investigation, never starting a second one.
  met: true
  how: 'resolveIdempotency calls the caller-supplied findCompleted(key) before touching the lease store at all. Where it resolves to a value, resolveIdempotency answers { outcome: ''completed'', match } immediately and never calls leases.acquire, so no lease is claimed and a caller reading this outcome never starts a second investigation. This task ships no real findCompleted, a caller plugs in the real completed-investigation answer once it exists, but the branch is exercised whole against a fixture findCompleted answering a fixture match.'
- criterion: A repeated request whose key matches a currently held lease joins it rather than starting a second investigation.
  met: true
  how: 'Where findCompleted answers undefined, resolveIdempotency calls leases.acquire(key, now). IdempotencyLeaseStore.acquire answers { acquired: false, lease } for a key whose lease is still within the configured window, leaving that lease untouched, and resolveIdempotency turns that into { outcome: ''in-progress'', lease }, the held lease, unchanged, for the caller to join instead of starting a second investigation. acquire never claims a second lease over an already-held, unexpired one.'
- criterion: The in-progress marker holds only a key and an instant, never a domain state of the investigation.
  met: true
  how: Lease is declared with exactly two fields, key (IdempotencyKey) and heldAt (the acquiring instant as a number), no status, narrative, or reference to an Investigation or any of its attributes. IdempotencyLeaseStore never stores or derives anything beyond that shape; acquire and currentLease both construct and read only { key, heldAt }.
- criterion: A lease outside the configured window no longer blocks a fresh request.
  met: true
  how: IdempotencyLeaseStore.currentLease reads a lease as absent once now minus lease.heldAt is at least windowMs, recomputed fresh from the two instants on every call rather than from a stored expiry flag. acquire calls currentLease first, so a key whose only prior lease is now outside the window is treated exactly as an unheld key, and a fresh acquire succeeds, unblocking the fresh request.
nodes:
- node: rules/investigation/an-investigation-is-idempotent-within-a-window
  encoded_at:
  - src/investigation/idempotency-key.ts
  - src/investigation/idempotency-lease-store.ts
  - src/investigation/idempotency-resolution.ts
  how: IdempotencyKey is exactly the rule's own four repeated values. resolveIdempotency reads the rule's own precedence directly, completed answers first, an unexpired held lease answers next, and only where neither exists does it claim a fresh lease and answer free, and IdempotencyLeaseStore is what makes 'within the configured window' a live, checked condition rather than an unbounded block. The rule's 'and neither starts another' half is what this three-way outcome exists to let a caller act on; actually not starting a second investigation for completed or in-progress is the caller's own responsibility once it reads the outcome, per this task's own scope (no built Investigation, no wiring into a real diagnose entry point — that is task/investigation-lifecycle/diagnose-entry-point).
- node: constraints/in-progress-is-a-lease-not-domain-state
  encoded_at:
  - src/investigation/idempotency-lease-store.ts
  how: Lease's declared shape, key and heldAt alone, is the fitness clause's own literal test ('the lease store holds nothing but keys and instants') satisfied by construction; no field of Lease, AcquireResult or IdempotencyLeaseStore ever names an investigation attribute, a status, or any other domain fact. The constraint's other half, that the investigation store holds no record before completion, is a fact about a different store this task does not build (task/investigation-lifecycle/investigation-store); this task never writes any investigation record, stub or otherwise, which is the design its own Notes name as the intended one over persisting a partial record to back the in-progress join.
- node: scenarios/investigation/a-repeated-request-returns-the-same-investigation
  encoded_at:
  - src/investigation/idempotency-resolution.ts
  how: 'The scenario''s given/when/then is exactly resolveIdempotency''s completed branch, given a completed match findCompleted answers, when the same key resolves again, resolveIdempotency answers { outcome: ''completed'', match } without ever calling leases.acquire, so the completed investigation is what the outcome carries and no second investigation''s lease is ever claimed. The scenario''s own closing line, that the in-progress marker is a lease in the idempotency store, never domain state, is answered by idempotency-lease-store.ts, the same file recorded under constraints/in-progress-is-a-lease-not-domain-state above.'
inferences:
- inferred: The completed-investigation branch is never itself checked against the window by this mechanism, resolveIdempotency accepts whatever findCompleted(key) answers as already decided, rather than re-deriving 'within the window' from a completed match's own instant.
  from: the task's own Notes name this as UNDERDETERMINED and state that an implementation whose completed-investigation match never expires still satisfies every criterion as written; since this task builds no real completed-investigation lookup at all (that is task/investigation-lifecycle/investigation-store's and later task/investigation-lifecycle/diagnose-entry-point's), there is no completed-match instant here for this mechanism to compare against a window, that comparison, if the real findCompleted needs one, belongs to whichever task supplies it.
- inferred: The mechanism is built as a separate, in-memory lease store (IdempotencyLeaseStore, holding only an IdempotencyKey and a heldAt instant) rather than as a stub or partial Investigation record a caller would write to back the in-progress join.
  from: the task's own Notes flag this as UNDERDETERMINED but name the intended design directly, constraints/in-progress-is-a-lease-not-domain-state's fitness clause ('the lease store holds nothing but keys and instants') together with rules/investigation/an-investigation-is-written-once refuse a stub investigation record.
- inferred: An instant is represented as a plain epoch-millisecond number, and every method that needs 'now' (IdempotencyLeaseStore.acquire, .currentLease, resolveIdempotency) receives it as an explicit parameter rather than reading Date.now() or any injected clock internally.
  from: no Instant or Clock type or convention exists anywhere in this codebase yet; case-resolution.ts and both existing fake adapters (FakeObservationSource, FakeHypothesisEvaluator) establish the project's own preference for pure, deterministic behavior driven entirely by what a caller or a test hands in, and the task's own 'testable against fixture keys' phrasing asks for exactly that here.
- inferred: The lease store is held entirely in process memory (a plain Map, no file), never persisted across a process restart.
  from: no specification node states that a lease must survive a process restart; constraints/the-mvp-persists-to-no-database is covered elsewhere in this epic by task/investigation-lifecycle/investigation-store and is not named in this task's own implements. The choice is also load-bearing against existing proof code already in this tree — src/__tests__/unit/investigation/observation-source-modules.spec.ts sweeps every .ts file directly under src/investigation for zero Node-standard-library imports, which a file-backed store (needing node:fs) would violate outright.
- inferred: IdempotencyKey's four components are modeled as flat strings (subjectType, subjectId, caseReference, ticketRef) rather than nesting subject type and id into a Subject-shaped { type, id } object.
  from: the rule itself lists 'subject type, subject id, case and ticket reference' as four parallel components; the one existing local declaration of a Subject-shaped type (observation-source.port.ts) is scoped to that port's own signature, and importing it here would couple this key to an unrelated port for a decision neither this task's criteria nor its implements list ask for.
- inferred: caseReference is kept as one opaque string rather than decomposed into the case's own slug, version and hash.
  from: the rule names case as a single component beside the other three, and domain/investigation/investigation's description of a case pinned by slug, version and hash is not among this task's implements; deciding which of those fields backs the key belongs to whichever task assembles the real key from a real diagnose request, task/investigation-lifecycle/diagnose-entry-point, whose own Notes already carry an open BLOCKING question about where a ticket reference and requester identity for that request originate at all.
- inferred: windowMs is bound once at IdempotencyLeaseStore construction rather than passed on every acquire()/currentLease() call, and resolveIdempotency's several inputs are gathered into one ResolveIdempotencyOptions object rather than passed positionally.
  from: the rule's own phrase 'the configured window' reads as one value configured for the mechanism rather than chosen afresh per call; binding it at construction, together with the options object, is also what keeps every function across these three files within the project's standard's max-params rule without inventing a shape the specification never asked for.
preserved:
- src/__tests__/unit/investigation/observation-source-modules.spec.ts's directory-wide sweep of every .ts file directly under src/investigation/ for zero forbidden-package imports and zero Node-standard-library imports — the three new files import only each other's local types and nothing else, so the sweep keeps passing.
- src/__tests__/unit/investigation/observation-source-modules.spec.ts's and hypothesis-evaluator-modules.spec.ts's 'ships exactly one concrete class implementing I...' checks (IObservationSource, IHypothesisEvaluator) — none of the three new files declares a class implementing either interface, so both counts stay unchanged.
- src/__tests__/unit/dependency-manifest.spec.ts's assertion that the manifest declares no database driver — package.json is untouched by this delivery.
deferred:
- what: The real completed-investigation lookup findCompleted(key) plugs into, an actual query against a written Investigation, however it ends up indexed by this key.
  why: task/investigation-lifecycle/investigation-store builds the write-once store such a lookup would query, and task/investigation-lifecycle/diagnose-entry-point is the composition root that will supply the real findCompleted; this task ships only the plug point, per its own stated scope (no built Investigation).
- what: Actually joining an in-progress lease, waiting on, polling, or subscribing to the original request's own completion once resolveIdempotency answers in-progress.
  why: this task's own governing instructions are explicit that the mechanism only has to tell a caller which outcome applies, never build what the caller does with each; joining belongs to task/investigation-lifecycle/diagnose-entry-point, the composition root.
- what: Wiring IdempotencyLeaseStore or resolveIdempotency into a factory under src/factories/, or into any production consumer.
  why: no consumer exists anywhere in this tree yet, mirroring the same deferral the sibling task/evidence-collection/observation-source-port delivery already recorded for its own port.
- what: An automated module-boundary test naming these three files specifically (mirroring hypothesis-evaluator-modules.spec.ts's own fixed file list), rather than relying solely on the existing directory-wide sweep that already covers them incidentally.
  why: writing that test is proof's task, not this implementation's; named here so the gap is visible rather than silently assumed already covered.
---

## What it is

The mechanism that keeps an impatient repeat from costing a second investigation. The lease it holds is a key and an instant, never a state of anything domain.

## Notes

Both UNDERDETERMINED notes the task carries are resolved deliberately, not left open: the completed-match branch is never itself re-checked against the window (this task builds no real completed lookup to check), and the in-progress branch is backed by a separate in-memory lease store holding only a key and an instant, never a stub investigation record.
No production consumer of `resolveIdempotency` or `IdempotencyLeaseStore` exists yet, and none is wired here — that is a later task's (`diagnose-entry-point`).

---
title: Diagnose payload shape and window dedup
summary: Proves diagnose()'s own five criteria — requester refusal, completed-match reuse, in-progress joining, no-ticket-ref always-fresh, and payload-only sourcing of requester/ticket_ref — over hand-rolled fakes for the injected runFresh pipeline, plus direct unit coverage of the new DiagnosisRunRegistry and a structural/behavioral check against the UNDERDETERMINED note's persisted-status candidate.
implementation: sha256:39261048ff20eaeb52c6b935e9363b53a9febb89f50f56973203f3366bc932d6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-entry-point-diagnose-payload-and-window-dedup-suite-2
tests:
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: refuses a diagnose call with no requester before starting any investigation
    proves: "A diagnose call missing requester is refused before any investigation starts."
    fails_when: "diagnose() calls runFresh, or resolves, or throws anything other than RequesterRequiredError (with its context carrying the given value) for an undefined requester"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: refuses a diagnose call whose requester is an empty string, the same as one that is missing altogether
    proves: "the absent-vs-empty-input edge case over criterion 1's own refusal"
    fails_when: "an empty-string requester is accepted and runFresh is called"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: returns the existing completed investigation for a repeated ticket_ref within the window, without starting a second run
    proves: "A diagnose call carrying a ticket_ref that repeats subject type, the whole attribute-value set, case and that ticket_ref within the window returns the existing completed investigation without starting a second one."
    fails_when: "the second call returns anything but the exact first Assessment, or runFresh is called more than once"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: starts a fresh run instead of returning the cached one once the window for that key has elapsed
    proves: "the within-the-window boundary criterion 2 states, at the end where the window has elapsed"
    fails_when: "a call made after the window has elapsed still receives the stale cached Assessment instead of a fresh run"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: joins the same in-flight run for a repeated ticket_ref submitted while the first call has not settled yet
    proves: "A diagnose call carrying a ticket_ref that repeats those same fields while the first matching call is still in progress joins it rather than starting a second investigation."
    fails_when: "the second call resolves to a different Assessment than the first, or runFresh is called more than once"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: lets a joining call inherit the same rejection as the run it joined, rather than hanging or answering something else, when that run later fails
    proves: "joining an in-progress run (criterion 3) is a genuine await of that run, including its failure, not a separate mechanism that could hang or diverge from it"
    fails_when: "the joining call hangs, resolves, or rejects with anything other than the exact error the joined run rejected with"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: always starts a fresh run when no ticket reference is given, even for two otherwise-identical calls
    proves: "A diagnose call carrying no ticket_ref always starts its own investigation, never matched against any prior call regardless of how closely subject, case or timing coincide."
    fails_when: "the second call is joined or returns the first call's Assessment instead of its own independent run"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: treats an empty-string ticket_ref as a given ticket reference rather than as absent, entering the window dedup instead of always running fresh
    proves: "the absent-vs-empty-input fork inside criterion 4's own no-ticket_ref test — ticket_ref equal to empty string is present input, not absent input"
    fails_when: "an empty-string ticket_ref is treated as absent and runFresh is called twice instead of the second call reading the completed cache"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: passes the payload's own requester and ticket_ref through to the fresh run unchanged
    proves: "requester and ticket_ref are read from the diagnose payload itself, never resolved from any other source."
    fails_when: "runFresh receives a requester or ticket_ref different from what the payload carried"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: threads an absent ticket_ref to the fresh run as an empty string, the mandatory field run-diagnosis.ts already declares
    proves: "the implementation's own inference that an absent payload ticket_ref is threaded to runFresh as the empty string"
    fails_when: "runFresh receives undefined, or anything other than an empty string, for ticket_ref when the payload gave none"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: keys the repeat-request dedup on the case slug alone, so two payloads sharing a slug but differing in version and hash still match
    proves: "the implementation's own inference that the key's case component is the slug alone, never paired with version or hash"
    fails_when: "two calls sharing a slug but differing in case version/hash fail to dedup"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: validates nothing about the payload besides requester and ticket_ref at this boundary, letting an otherwise-unusual field travel through unchanged
    proves: "the implementation's own inference that only requester and ticket_ref are validated at this boundary"
    fails_when: "diagnose() throws or normalizes an empty narrative instead of letting it travel unchanged to runFresh"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: threads the payload's own id straight through to the fresh run, never generating one of its own
    proves: "the implementation's own inference that DiagnosePayload.id travels as a caller-given field"
    fails_when: "runFresh receives an id different from the one the caller gave in the payload"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: propagates a fresh run's own rejection to the caller instead of swallowing it
    proves: "the dependency-that-fails edge case for the free/fresh path — a rejection from runFresh must reach the caller"
    fails_when: "diagnose() swallows the rejection, hangs, or resolves instead of rejecting with the same error"
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: lets a later call for the same key start its own fresh run once the first one has failed and settled
    proves: "the recovery path the implementation's own deferred entry names as a disclosed, undemonstrated fallback"
    fails_when: "the later call hangs, throws the stale first failure again, or answers with anything other than its own fresh Assessment"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: answers undefined for a key nothing has ever run for
    proves: "completedMatch's baseline — no false match for an unseen key"
    fails_when: "completedMatch answers anything but undefined for a key never passed to run()"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: answers undefined for a key with no run currently in flight
    proves: "inProgressRun's baseline — no phantom in-flight promise for an unseen key"
    fails_when: "inProgressRun answers anything but undefined for a key never passed to run()"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: answers the completed assessment for a key whose lease is still current, once run() has resolved
    proves: "run()'s own success path moves the result into the completed map, readable through completedMatch"
    fails_when: "completedMatch does not answer the exact Assessment run() resolved to"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: answers undefined for a completed key once its lease has fallen outside the window, even though the completed record itself was never cleared
    proves: "completedMatch's own boundedness is gated on the lease's own window rather than a second, independent expiry"
    fails_when: "completedMatch still answers the cached Assessment once the backing lease has expired"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: answers the exact promise a caller is meant to join while its own run has not settled yet
    proves: "run() registers its own promise before it can settle, so a concurrent inProgressRun lookup finds it"
    fails_when: "inProgressRun answers undefined or a different promise while the run is still pending"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: clears the in-progress entry once the run has settled successfully, so a caller arriving afterward finds nothing left to join
    proves: "run()'s own cleanup — a settled run is no longer in progress"
    fails_when: "inProgressRun still answers a promise for a key whose run has already resolved"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: never caches a rejected run as completed, and clears its in-progress entry all the same, so a later run for the same key can start its own fresh attempt
    proves: "the module's own documented failure handling — a rejection is neither cached as completed nor left blocking a retry"
    fails_when: "a rejected run is cached as completed, or its running entry is not cleared"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: "holds no status field, and imports no persisted investigation store, no Investigation type and no filesystem module"
    proves: "UNDERDETERMINED note — an implementation persisting a partial investigation record carrying a status field rather than the existing key-and-instant lease store would also satisfy the stated criteria"
    fails_when: "the module declares a status field, or imports an investigation store, the Investigation type, or a filesystem module to back the in-progress marker"
  - file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
    name: holds every recorded run only inside the registry instance itself, so a fresh instance sees nothing for a key and lease a different instance already ran
    proves: "the same UNDERDETERMINED note, behaviorally — the in-progress/completed marker lives only in this instance's own in-process maps"
    fails_when: "a fresh DiagnosisRunRegistry instance can answer completedMatch or inProgressRun for a run it never itself recorded"
not_applicable:
  - edge_case: a resource looked up by identifier that does not exist
    why: "diagnose() and DiagnosisRunRegistry read no store by id; case-source resolution is explicitly out of this task's scope"
  - edge_case: a rate limit or a payload size limit at a transport boundary
    why: "this task is the domain entry point, not a transport layer; no node this task implements names either"
  - edge_case: an empty collection answered where one is expected
    why: "diagnose() answers one Assessment, never a collection"
  - edge_case: a write spanning more than one statement, requiring a transaction
    why: "this task performs no write of its own; persistence lives in run-diagnosis.ts, out of this task's file boundary"
  - edge_case: a slow (rather than failing) dependency
    why: "diagnose.ts and diagnosis-run-registry.ts impose no timeout of their own — a slow runFresh simply keeps a caller and any joiner waiting, the intended join behavior itself"
untested:
  - "a literal simultaneous race whose event order is not the deterministic microtask interleaving this proof drives explicitly — JavaScript's single-threaded execution makes the driven interleaving the faithful reproduction of concurrency for this code, but no other arrival ordering was separately varied"
  - "contracts/investigation/case-source's own case resolution — explicitly out of this task's scope per its own deferred entry"
  - "the wiring in src/factories/diagnose-entry-point.factory.ts — this proof exercises diagnose() directly over hand-built dependencies, never through the factory's own composition"
  - "src/errors/requester-required.error.ts's own error shape beyond instanceof and .context — its message text is not separately asserted"
---

## What it is

Proves diagnose()'s five criteria (requester refusal, completed-match reuse, in-progress joining, no-ticket-ref always-fresh, payload-only sourcing) and DiagnosisRunRegistry's own unit behavior, over hand-rolled fakes. Two tests initially raced against the real implementation (resolveRun called before the second call had reached its own in-progress lookup) — a genuine test-authoring bug, fixed with an added flush; root-caused with an isolated repro before delegating the fix, confirming the production code was correct throughout.

## Notes

None.

---
title: Diagnose payload shape and window dedup
summary: A new diagnose(payload, dependencies) entry point requires a requester, treats ticket_ref as optional, and applies the idempotency-window dedup (return completed, join in-progress, always fresh with no ticket) only when a ticket reference travels, wrapping the already-delivered run-diagnosis.ts pipeline without modifying it.
task: sha256:5c30c22a81bcbddcef7ad25c90f1502a22ed9913fd3581b91b340bf508b0b2b1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-entry-point-diagnose-payload-and-window-dedup-build
files:
  - path: src/investigation/diagnose.ts
    effect: "exports DiagnosePayload, DiagnoseRunInput, DiagnoseWindowDependencies and diagnose(payload, dependencies): Promise<Assessment>. Refuses a missing or empty requester before anything else runs (RequesterRequiredError). Where payload.ticket_ref is undefined, calls the injected runFresh callback unconditionally, building no key and touching neither the lease store nor the run registry. Where a ticket reference is given, builds the repeat-request key (subject built via subject.ts's buildSubject, the case's own slug, and the ticket reference) and resolves it through idempotency-resolution.ts's own resolveIdempotency: a completed outcome returns the cached Assessment; an in-progress outcome joins the same in-flight run by awaiting it; otherwise starts and registers a fresh run through DiagnosisRunRegistry.run(). ticket_ref is threaded to runFresh as the empty string when absent, since run-diagnosis.ts's own RunDiagnosisOptions.ticket_ref stays a mandatory string."
  - path: src/investigation/diagnosis-run-registry.ts
    effect: "exports DiagnosisRunRegistry: an in-process class holding a completed-Assessment map and an in-flight-Promise map, both keyed by idempotencyKeyOf(key). completedMatch(key, now, leases) answers a cached Assessment only where IdempotencyLeaseStore.currentLease(key, now) is still defined, so a completed match is bounded by the same window the lease already computes rather than a second expiry of its own. inProgressRun(key) answers the in-flight promise for a caller to join. run(key, start) records start()'s own promise as running before it can settle, moves its result into the completed map once it resolves, and always clears the running entry."
  - path: src/errors/requester-required.error.ts
    effect: "new typed error RequesterRequiredError(given), carrying context { given } — the same name/message/context shape every existing investigation-context error already keeps, raised by diagnose.ts before any investigation starts."
  - path: src/factories/diagnose-entry-point.factory.ts
    effect: "new createDiagnoseEntryPoint(dependencies): (payload) => Promise<Assessment> — composes createDiagnoseRunner (diagnose.factory.ts, unmodified) as the runFresh callback, alongside one IdempotencyLeaseStore bound to a caller-given windowMs and one DiagnosisRunRegistry, both instantiated once and passed to diagnose()."
criteria:
  - criterion: "A diagnose call missing requester is refused before any investigation starts."
    met: true
    how: "diagnose()'s first statement is refuseMissingRequester(payload.requester), which throws RequesterRequiredError for undefined or empty-string requester before the ticket_ref branch, before any key is built and before runFresh is ever called."
  - criterion: "A diagnose call carrying a ticket_ref that repeats subject type, the whole attribute-value set, case and that ticket_ref within the window returns the existing completed investigation without starting a second one."
    met: true
    how: "resolveRepeat() builds the key from the built Subject, case.slug and ticketRef, and resolveIdempotency's completed outcome (findCompleted backed by DiagnosisRunRegistry.completedMatch, gated on the same key's still-current lease) returns outcome.match directly — runFresh is never called on that path."
  - criterion: "A diagnose call carrying a ticket_ref that repeats those same fields while the first matching call is still in progress joins it rather than starting a second investigation."
    met: true
    how: "an in-progress outcome looks up DiagnosisRunRegistry.inProgressRun(key), the exact Promise the first (free) call registered in run() before its own first await settles, and returns it directly."
  - criterion: "A diagnose call carrying no ticket_ref always starts its own investigation, never matched against any prior call regardless of how closely subject, case or timing coincide."
    met: true
    how: "diagnose()'s ticket_ref-absent branch calls dependencies.runFresh directly and returns; no IdempotencyKey is ever constructed and neither dependencies.leases nor dependencies.registry is touched on this path."
  - criterion: "requester and ticket_ref are read from the diagnose payload itself, never resolved from any other source."
    met: true
    how: "every reference to requester or ticket_ref in diagnose.ts reads payload.requester / payload.ticket_ref directly; the module imports no header, session, environment or configuration source of either value."
nodes:
  - node: contracts/investigation/diagnosis
    encoded_at:
      - src/investigation/diagnose.ts
    how: "diagnose() realizes the published synchronous operation this contract names: case, subject, narrative and requester in (requester mandatory), an optional ticket_ref, assessment out, idempotent within the window exactly when a ticket reference is given — the two REMAINDER halves diagnose-pipeline-composition's own delivery record left to this task."
  - node: domain/investigation/investigation
    encoded_at:
      - src/investigation/diagnose.ts
    how: "honored for its own attribute shape, not re-encoded: investigation.ts and investigation-factory.ts are untouched by this task. What this task encodes is the node's own text that requester and ticket_ref both arrive in the diagnose call itself, requester always given and ticket_ref not."
  - node: rules/investigation/an-investigation-is-idempotent-within-a-window
    encoded_at:
      - src/investigation/diagnose.ts
      - src/investigation/diagnosis-run-registry.ts
    how: "the key the rule names — subject type, the subject's whole attribute-value set, case and ticket reference — is built in resolveRepeat() over the canonical Subject and the case's own slug, and resolved through the already-delivered idempotencyKeyOf/resolveIdempotency/IdempotencyLeaseStore machinery, unchanged, in the rule's own precedence (completed, then in-progress, then free). A request with no ticket reference never builds this key at all, so it is never matched."
  - node: constraints/in-progress-is-a-lease-not-domain-state
    encoded_at:
      - src/investigation/diagnosis-run-registry.ts
    how: "the in-progress marker stays exactly the lease IdempotencyLeaseStore already keeps (key and instant, unmodified); no status field is added to Investigation and neither the investigation store nor the lease store's own shape is touched. DiagnosisRunRegistry's two maps are purely in-process routing state — never persisted, never part of any domain aggregate."
  - node: scenarios/investigation/a-repeated-request-returns-the-same-investigation
    encoded_at:
      - src/investigation/diagnose.ts
    how: "given a completed investigation for the same key inside the window, when the same request is submitted again, resolveRepeat()'s completed branch returns the cached assessment and no second investigation is started."
  - node: scenarios/investigation/no-ticket-reference-never-repeats
    encoded_at:
      - src/investigation/diagnose.ts
    how: "given two calls for the same subject and case, neither carrying a ticket reference, when the second is diagnosed, diagnose()'s ticket_ref-absent branch always calls runFresh — a second, independent investigation starts and the first is neither returned nor joined."
inferences:
  - inferred: "the case component of the repeat-request key is the case's own slug alone, never paired with its version or hash."
    from: "idempotency-key.ts's own module comment explicitly defers this exact decision to this task; the rule names case as one identity-level component beside subject type/attributes and ticket reference, and case.ts's own comment states slug as the case's declared identity, distinct from replay-is-pinned's separate slug+version+hash content pin."
  - inferred: "run-diagnosis.ts's own mandatory RunDiagnosisOptions.ticket_ref receives the empty string wherever the diagnose payload gives none."
    from: "run-diagnosis.ts is out of this task's file boundary (wrapped, never modified) and declares that field with no optionality of its own. evidence.ts's own capability_name/capability_version already establishes an empty-string-for-an-unresolved-relationship convention in this exact codebase."
  - inferred: "the existing completed investigation a repeated call returns is its Assessment, not the whole Investigation aggregate."
    from: "run-diagnosis.ts's own runDiagnosis and diagnose-pipeline-composition's own delivered contract already answer Promise<Assessment>, matching contracts/investigation/diagnosis's own assessment out."
  - inferred: "a completed match's own window-boundedness is decided by asking whether the same key's lease is still current, rather than a second, independent expiry of its own."
    from: "domain/investigation/investigation carries no absolute instant a completed record could otherwise be checked for staleness against, and idempotency-resolution.spec.ts's own proof establishes that resolveIdempotency itself never re-derives within the window from a completed match — that responsibility is left entirely to findCompleted."
  - inferred: "requester and ticket_ref are the only two DiagnosePayload fields validated at this boundary; every other field keeps run-diagnosis.ts's own already-established, already-mandatory shape, unvalidated here."
    from: "the task's own five criteria name only requester's presence and ticket_ref's optionality. Every other field's own validation already happens downstream, and validating them again here would widen this task past its own criteria."
  - inferred: "DiagnosePayload.id travels as a caller-given field rather than being generated inside diagnose()."
    from: "domain/investigation/investigation states id as a required string with no generation rule anywhere in the specification, and diagnose-pipeline-composition's own delivery record already inferred the same for RunDiagnosisOptions.id."
preserved:
  - "run-diagnosis.ts's own RunDiagnosisOptions and runDiagnosis(): unmodified, invoked unchanged as the injected runFresh callback."
  - "diagnose.factory.ts's own createDiagnoseRunner, DiagnoseDependencies and DiagnoseCall: unmodified, composed unchanged inside the new diagnose-entry-point.factory.ts."
  - "idempotency-key.ts's IdempotencyKey/idempotencyKeyOf, idempotency-lease-store.ts's IdempotencyLeaseStore and idempotency-resolution.ts's resolveIdempotency: unmodified, called exactly as delivered."
  - "investigation.ts's Investigation type and investigation-factory.ts's BuildInvestigationOptions/buildInvestigation: unmodified."
  - "observation-source-modules.spec.ts's own directory-wide sweep over every .ts file directly under src/investigation/: still holds against the two new files this task adds to that directory."
deferred:
  - what: "investigation.ts's Investigation.ticket_ref, investigation-factory.ts's BuildInvestigationOptions.ticket_ref and run-diagnosis.ts's own RunDiagnosisOptions.ticket_ref remain a mandatory plain string with no optionality of their own, even though domain/investigation/investigation declares ticket_ref without required:true."
    why: "run-diagnosis.ts is explicitly out of this task's file boundary (wrap it, never modify it). Widening investigation.ts/investigation-factory.ts alone, without also widening RunDiagnosisOptions, would change no observable behavior, so it was left untouched rather than made cosmetically wider for no functional gain."
  - what: "contracts/investigation/case-source's own actual case resolution — a payload's raw case identity resolved and pinned by content through ICaseQuery.readCase(slug, version) at the start of the request — is not implemented here; DiagnosePayload.case is accepted as an already-resolved Case."
    why: "this task's own implements list does not name contracts/investigation/case-source. Building that resolution is a distinct, not-yet-planned composition layer, and doing it here would widen this task past payload shape and window dedup."
  - what: "a narrow, undemonstrated race: where the first (free) claimant's own fresh run has already failed and settled while the lease it claimed is still held for the rest of the window, a concurrent request that resolves to in-progress finds nothing to join and falls back to starting its own fresh run instead."
    why: "none of this task's five criteria exercise a failed first attempt followed by a retry within the same window, and IdempotencyLeaseStore offers no release() to clear a lease on failure. The fallback keeps such a request from hanging forever rather than leaving it unanswered, but it is a disclosed, undemonstrated recovery path rather than a proven one."
---

## What it is

The diagnose payload shape (case, subject, narrative, requester, optional ticket_ref) and the window-dedup decision — return completed, join in-progress, or always start fresh when no ticket_ref travels — wrapping the already-delivered run-diagnosis.ts pipeline without modifying it. The piece the prior plan's diagnose-entry-point task left permanently BLOCKING.

## Notes

None.

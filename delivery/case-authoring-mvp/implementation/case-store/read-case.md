---
title: Read case — the knowledge context's published case-query composition
summary: Composes the versioned JSON file store, the case document model, and the coherence validator into read-case and replay-case, so a case answers whole and pinned by content only while every validator rule holds now, refusing otherwise with all violations named together.
task: sha256:f3294caaedbb0421b3adbb0cd439023a663192e645359139b54c838c2899d99a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-store-read-case-build
files:
  - path: src/case/case-query.port.ts
    effect: publishes ICaseQuery (contracts/knowledge/case-query) with its one operation readCase(slug, version), and the ReadCaseResult shape { case, hash } both readCase and replayCase answer with
  - path: src/case/case-query.service.ts
    effect: implements ICaseQuery as CaseQueryService, composing an injected ICaseStore, IGlossaryQuery and ICapabilityQuery — readCase reads the pinned version, parses it, runs the coherence checks fresh on every call, and joins any structural or coherence violations into one CaseNotValidError; also exports the standalone replayCase(slug, version, caseStore), which parses the pinned version's bytes without ever touching the glossary or capability registry
  - path: src/errors/case-not-found.error.ts
    effect: adds CaseNotFoundError(slug, version), the typed refusal for a version nothing has stored
  - path: src/errors/case-not-valid.error.ts
    effect: adds CaseNotValidError(slug, version, violations), the one joint refusal read-case raises whether the cause was a structural or a coherence violation, naming every one together
  - path: src/factories/case-query.factory.ts
    effect: wires createCaseQuery(caseDataDirectory, glossaryDataDirectory, capabilityDataDirectory), composing the three existing leaf factories into one ICaseQuery
criteria:
  - criterion: Reading a case every rule holds for answers the case whole, pinned by content.
    met: true
    how: "CaseQueryService.readCase returns { case: theCase, hash: stored.hash } — theCase is parseCaseDocument's whole aggregate and stored.hash is FileCaseStore's sha256 of the exact bytes this call read"
  - criterion: Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal.
    met: true
    how: "readCase catches InvalidCaseDocumentError from parseCaseDocument and, where structurally invalid, throws CaseNotValidError carrying every structural problem; where it parses, it runs caseCoherenceViolations and throws the same CaseNotValidError carrying every coherence violation where any exist — either branch names every violated rule together in the one error type"
  - criterion: A case that validated at one read is refused at a later read when the glossary or registration it depends on no longer satisfies a rule.
    met: true
    how: "CaseQueryService holds no cache of any prior result — every readCase call re-invokes caseCoherenceViolations, which re-reads through IGlossaryQuery and ICapabilityQuery on every call, so a term or a registration that stops satisfying a rule between two reads changes the second read's answer"
  - criterion: A replay read of a pinned version answers the exact version pinned, without revalidation.
    met: true
    how: "replayCase(slug, version, caseStore) takes no glossary or capability dependency at all — structurally it cannot run the coherence checks — and reads only ICaseStore.readVersion for the exact addressed version, parsing its exact stored bytes and answering { case, hash } pinned by that version's own content hash"
  - criterion: No publication gate stands between the authored file and its reading, so a file every rule holds for is a case at its next read.
    met: true
    how: "readCase reads directly from ICaseStore.readVersion, which answers whatever writeVersion last persisted with no intermediate status; no approval or publication flag exists anywhere in this composition, so any version written becomes readable at its very next read"
nodes:
  - node: rules/knowledge/validation-runs-at-every-read
    encoded_at: [src/case/case-query.service.ts]
    how: "readCase runs the full structural-then-coherence check on every call, with no gate and no cache; replayCase is coded as the declared exception — it never calls caseCoherenceViolations at all"
  - node: rules/knowledge/every-case-version-remains-readable
    encoded_at: [src/case/case-query.service.ts]
    how: "Both readCase and replayCase take an explicit version and address ICaseStore.readVersion(slug, version) with it — never a latest lookup"
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    how: "Honored by composition: readCase's coherence step delegates the whole check to caseCoherenceViolations, which already implements this rule against IGlossaryQuery; this task calls it and joins its answer into the one refusal"
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    how: "Honored the same way: caseCoherenceViolations already implements this check against ICapabilityQuery; readCase calls it on every read and joins any violation into CaseNotValidError"
  - node: rules/knowledge/the-contract-check-reads-the-current-registration
    encoded_at: [src/case/case-query.service.ts]
    how: "CaseQueryService stores only the three port references given at construction and never a result; every readCase call passes through to a fresh caseCoherenceViolations call, which itself reads ICapabilityQuery.readCapability anew each time"
  - node: contracts/knowledge/case-query
    encoded_at: [src/case/case-query.port.ts, src/case/case-query.service.ts, src/factories/case-query.factory.ts]
    how: "ICaseQuery publishes exactly the one operation this contract names, read-case, mapped to readCase(slug, version); CaseQueryService is its one implementation, and createCaseQuery is the factory a consumer wires it through"
  - node: contracts/system/case-authoring
    encoded_at: [src/case/case-query.service.ts, src/errors/case-not-valid.error.ts, src/errors/case-not-found.error.ts]
    how: "The curator's promise — author a case and have every validator rule answer at reading, with all refusals at once — is what CaseNotValidError exists to keep: whichever half of the validator produced the violations, this is the one type read-case raises, naming all of them together, with no separate approval step anywhere in this composition"
  - node: constraints/the-mvp-persists-to-no-database
    how: "This task adds no dependency and no store of its own — it wires the case store, the glossary and the capability registry only through their existing file-backed factories, all of which already persist to plain files"
  - node: constraints/a-case-is-stored-as-one-json-document
    how: "readCase and replayCase both read a case through exactly one ICaseStore.readVersion call and hand its one document straight to parseCaseDocument, which reads the whole aggregate from that one document alone"
inferences:
  - inferred: an unstored version is signaled as a typed refusal, CaseNotFoundError, raised from the service, rather than as a discriminated held-false resolution the way the lower-level term/concept/capability ports answer absence
    from: the project's standard scoping absent-resource refusal to a typed error raised in the service for .service.ts files, matching CaseQueryService as the top-level get-this-case operation, distinct from the internal sub-checks feeding a larger validation
  - inferred: replay-case is modeled as a standalone exported function taking ICaseStore directly, not as a second method on the published ICaseQuery interface
    from: the contract declares its operations as exactly read-case, while the validation-runs-at-every-read rule states replay as the declared exception to the same rule, not as a second published contract
  - inferred: a structural parse failure inside replay-case is left to propagate as InvalidCaseDocumentError, unjoined into CaseNotValidError
    from: CaseNotValidError's purpose is specifically the refusal the case-authoring capability and the every-read rule describe for a fresh reading's current-validity promise; replay is the declared exception to that promise, so reusing the same type there would misstate what replay answers for
  - inferred: the document's own declared version attribute is never cross-checked against the version number used to address it in the store
    from: no rule links case.version to the store's addressing parameter the way the slug-matches-file-name rule links the slug to the file's name
  - inferred: createCaseQuery takes three independent data-directory parameters rather than assuming one shared root
    from: each of the three leaf factories it composes already declares its own independent dataDirectory parameter with no shared-root convention evidenced anywhere
divergences:
  - cites: COR-02
    file: src/case/case-query.service.ts
    departure: the CaseNotFoundError and CaseNotValidError this file raises carry a name, a message and a context field, but no status property.
    why: this matches every one of the nine pre-existing business-error classes in src/errors that the glossary and capability-registry services already raise the same way; no controller or status-map exists yet anywhere in this project, so adding the field in isolation would invent that layer's shape ahead of it
preserved:
  - the three composed leaf factories (createCaseStore, createGlossaryQuery, createCapabilityQuery) and everything beneath them, untouched
  - parseCaseDocument's structural refusal and validate-case-coherence's coherence refusal, called but never modified
deferred:
  - what: nothing consumes ICaseQuery through a transport yet.
    why: this initiative's scope ends at the published in-process read; a transport is outside this plan
---
## What it is
The composition point of the whole plan: the curator's promise made concrete — one file, read, all refusals named together, no gate in between.
readCase joins structural and coherence violations into one CaseNotValidError; replayCase is the declared exception, parsing a pinned version's exact bytes without touching either upstream context.

## Notes
This composition joins every violation of whichever half of the validator actually ran into one CaseNotValidError; it does not combine structural and coherence violations from the same call, because coherence checking needs the parsed aggregate a structural failure never produces — a document that fails to parse never reaches the coherence checks at all. The proof's `contested` entry records this precisely: an earlier draft of this note overclaimed a joint structural-plus-coherence refusal that the code, correctly, does not and cannot produce.
No status field on the two new errors follows the tree's existing convention exactly; adding one now would invent a mapping no transport yet exists to receive.

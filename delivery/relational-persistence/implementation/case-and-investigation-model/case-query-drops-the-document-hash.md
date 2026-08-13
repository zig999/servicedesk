---
title: ReadCaseResult and readCase drop the retired document hash; run-diagnosis's header stops calling
  the pin content-based
summary: Removes the leftover hash field from ReadCaseResult and readCase's return in the knowledge context's
  published read, and corrects run-diagnosis.ts's own module header to describe the pinned case by slug
  and version rather than by content, closing a trace binding /reconcile flagged as stale.
task: sha256:853c721e60eb418a1f7f6936edab33e3a98ca92f1db6f644fe7f2f8052208583
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-case-query-drops-the-document-hash-build-2
files:
- path: case/case-query.port.ts
  effect: 'ReadCaseResult now declares only `case: Case`, with no `hash` field; its own JSDoc and ICaseQuery.readCase''s
    JSDoc no longer describe read-case''s answer as "pinned by content", stating instead that it is validated
    at this reading and carries no document digest.'
- path: case/case-query.service.ts
  effect: 'CaseQueryService.readCase now returns `{ case: theCase }`, no longer spreading `stored.hash`
    into the answer; readCase''s own JSDoc and replayCase''s own JSDoc are corrected to stop describing
    read-case''s shape as pinned by content identity, since neither function''s answer carries such a
    pin any longer.'
- path: investigation/run-diagnosis.ts
  effect: The module's own header comment now describes the case this pipeline runs as pinned by slug
    and version at the start of the request, rather than pinned by content, matching domain/investigation/investigation
    and rules/investigation/replay-is-pinned's own wording; no executable code in this file changed.
criteria:
- criterion: ReadCaseResult (case-query.port.ts) declares no hash field, and readCase's return (case-query.service.ts)
    carries no hash.
  met: true
  how: 'ReadCaseResult is now `{ readonly case: Case }` with `hash` removed, and CaseQueryService.readCase''s
    return statement is `{ case: theCase }`, no longer reading `stored.hash` at all.'
- criterion: Every real caller of readCase (diagnose.controller.ts, seed.ts) is unaffected, since none
    reads a hash off its result today.
  met: true
  how: 'Verified both callers directly: diagnose.controller.ts destructures only `{ case: pinnedCase }`
    from readCase''s result, and seed.ts''s verifySeededCase awaits readCase(...) for its refusal side
    effect alone, never touching the returned value''s shape. Neither required any change, confirmed by
    the passing typecheck/lint/secret-scan run this record cites.'
- criterion: run-diagnosis.ts's own module header comment describes the case this pipeline runs as pinned
    by slug and version, never by content.
  met: true
  how: The header's one sentence naming the pin was rewritten from '...pinned by content at the start
    of the request (contracts/investigation/case-source)' to '...pinned by slug and version at the start
    of the request (contracts/investigation/case-source)' — the only occurrence of 'pinned by content'
    in the file, confirmed by search before and after the edit.
nodes:
- node: contracts/knowledge/case-query
  encoded_at:
  - case/case-query.port.ts
  - case/case-query.service.ts
  how: ReadCaseResult's shape and every JSDoc describing read-case now match the contract's own Description
    exactly — a case by slug and version, validated at this reading, and read whole — with the document
    hash the contract never named removed from the type and from the prose that used to describe it.
- node: rules/investigation/replay-is-pinned
  encoded_at:
  - case/case-query.port.ts
  - case/case-query.service.ts
  - investigation/run-diagnosis.ts
  how: 'This task''s criteria reach only the rule''s case-by-slug-and-version clause (per the task''s
    own REMAINDER note; the model, prompt_version and evidence clauses are unchanged and already correct
    elsewhere). That clause is now what all three files state: ReadCaseResult and readCase''s return carry
    no digest over the case''s content, replayCase''s own doc says neither function''s shape is pinned
    by anything but slug and version, and run-diagnosis.ts''s header names the pin the same way.'
- node: domain/investigation/investigation
  encoded_at:
  - investigation/run-diagnosis.ts
  how: 'Governs criterion 3 alone: the header comment''s description of the case this pipeline runs now
    matches this aggregate''s own stated fact that the case reference is pinned by slug and version, never
    by a digest — a fact investigation.ts''s own PinnedCase type (unchanged, out of this task''s scope)
    already encodes since an earlier delivery. This task does not touch investigation.ts or PinnedCase;
    it only corrects the comment in run-diagnosis.ts that had fallen out of step with that already-settled
    fact.'
inferences:
- inferred: The surrounding JSDoc prose in case-query.port.ts and case-query.service.ts — describing ReadCaseResult
    and readCase's answer as 'pinned by content identity' — needed correcting alongside the field removal,
    not just the type and the return statement themselves.
  from: 'The framework''s own rule that code, tests and documentation are not a second home for a domain
    fact: leaving those comments as written would have kept stating, in prose, exactly the retired content-hash
    pin the task''s objective and rules/investigation/replay-is-pinned say the field no longer carries.'
preserved:
- 'diagnose.controller.ts''s destructuring of `{ case: pinnedCase }` from readCase''s result, and its
  downstream use as the pinned case passed into runDiagnose — unaffected by dropping `hash`, since it
  never read that field.'
- seed.ts's verifySeededCase, which calls readCase only for its refusal-on-invalid side effect and never
  inspects the returned value's shape.
- StoredCaseVersion.hash (case-store.port.ts) and its use inside case-query.service.ts's heldVersion/structuralCase
  path — the store-level content-identity hash a database adapter still needs an equivalent of, a distinct
  value from ReadCaseResult's retired field and outside this task's three named files.
- PinnedCase's own slug/version-only shape in investigation.ts, already narrowed by an earlier delivery
  and not reopened here.
---

## What it is

The reconciliation between a stale trace binding /reconcile surfaced and the source it flagged: two files drop a real field the specification retired, a third corrects a comment that had fallen out of step with it.

## Notes

REMAINDER, from the specification — rules/investigation/replay-is-pinned's other three clauses (model, prompt_version, evidence) are untouched by this task, per the task's own REMAINDER note; they are already the unchanged attributes task/case-and-investigation-model/investigation-record-shape's own delivery record says buildInvestigation already copies straight through.
ADVISORY, from the specification — contracts/investigation/case-source, the more precise citation run-diagnosis.ts's header could carry, sits under epic/service-on-the-database's own covers rather than this epic's; this task's implements is satisfied by domain/investigation/investigation and rules/investigation/replay-is-pinned without reaching into that epic's claim, per the task's own Decision line.

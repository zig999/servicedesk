---
target: backend
title: CaseHoldsVersionsError domain refusal
summary: Adds the CaseHoldsVersionsError domain error class and registers it as an
  HTTP 409 refusal in the shared status map.
task: sha256:888b527f2998132dfe262862d91928214c6a0cbfbf0e252334adc8f1f0268558
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-deletion-case-holds-versions-refusal-build-2
files:
- path: src/errors/case-holds-versions.error.ts
  effect: 'Defines CaseHoldsVersionsError, a plain Error subclass carrying a { slug:
    string } context and a Brazilian-Portuguese message naming the case ("caso") and
    its remaining versions ("versão"), with no English domain noun and no raw lifecycle
    token.'
- path: src/errors/status-map.ts
  effect: Imports CaseHoldsVersionsError and registers it in STATUS_BY_ERROR_CLASS
    at 409, beside the other case-lifecycle 409 refusals, so statusForError maps it
    to HTTP 409 and the existing error-handler middleware's domainEnvelope renders
    its name as the code, its message as the message, and its context as details.
criteria:
- criterion: A CaseHoldsVersionsError raised from a route handler is answered with
    HTTP 409.
  met: true
  how: The class is added to STATUS_BY_ERROR_CLASS at 409 in status-map.ts; statusForError(error)
    returns 409 for any instance, and the existing error-handler middleware's domainEnvelope
    path sends that status for any handler that lets the error reach it.
- criterion: The response to a CaseHoldsVersionsError carries the error code CaseHoldsVersionsError.
  met: true
  how: 'The constructor sets this.name = ''CaseHoldsVersionsError''; domainEnvelope
    already sets code: error.name for any error found in the map, unchanged by this
    delivery.'
- criterion: The message of a CaseHoldsVersionsError names the case slug it was raised
    for.
  met: true
  how: 'The constructor interpolates the slug parameter into the message: o caso "${slug}"
    ainda possui versão, e só um caso sem nenhuma versão pode ser excluído.'
- criterion: The details of a CaseHoldsVersionsError carry the case slug it was raised
    for.
  met: true
  how: The constructor sets this.context = { slug }; domainEnvelope already renders
    any error's context as details, unchanged.
- criterion: The details of a CaseHoldsVersionsError carry no field other than the
    case slug.
  met: true
  how: 'The context type is Readonly<{ slug: string }>, a single-field object literal
    — no other property is assigned.'
- criterion: The message of a CaseHoldsVersionsError is written in Brazilian Portuguese.
  met: true
  how: The whole message text is Portuguese prose, matching the phrasing register
    of the sibling classes CaseAlreadyHasDraftError and CaseHoldsNoDraftError.
- criterion: The message of a CaseHoldsVersionsError names the case by the word "caso".
  met: true
  how: The message opens with o caso "${slug}".
- criterion: The message of a CaseHoldsVersionsError contains no occurrence of the
    English word "case" for the case.
  met: true
  how: The message uses exclusively "caso" and contains no standalone English word
    "case".
nodes:
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  encoded_at:
  - src/errors/case-holds-versions.error.ts
  - src/errors/status-map.ts
  how: This task implements only the refusal half of the rule's statement — the message,
    the details and the HTTP 409 mapping. The accept branch and the condition that
    chooses between them belong to the sibling tasks (delete-case-over-case-lifecycle,
    store-deletes-a-versionless-case) and are not touched here.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/case-holds-versions.error.ts
  how: The error's message is written entirely in Brazilian Portuguese, matching the
    language every other refusal in this error set already uses.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/case-holds-versions.error.ts
  how: The message names the case by "caso" and the thing that blocks deletion by
    "versão", using neither noun's English word, and avoids the raw lifecycle tokens
    draft/released and their Portuguese words entirely, since the rule this error
    answers to is indifferent to which state the remaining version is in.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/errors/case-holds-versions.error.ts
  how: CaseHoldsVersionsError imports nothing — no framework, no driver, no provider
    client — so a future domain-level delete operation can construct and throw it
    without pulling any infrastructure package into the domain module that raises
    it. The status mapping lives separately, in status-map.ts, imported only by HTTP-facing
    middleware.
inferences:
- inferred: 'CaseHoldsVersionsError''s exact shape — a plain Error subclass with a
    Readonly<{ slug: string }> public context field, name set explicitly in the constructor,
    and a Portuguese message built from the slug.'
  from: The identical shape of the sibling case-lifecycle 409 refusals CaseAlreadyHasDraftError
    and CaseHoldsNoDraftError in src/errors/, which the inventory names as the convention
    to follow.
- inferred: The details key the slug sits under is slug (not e.g. caseSlug or identifier).
  from: The same sibling classes' context shape ({ slug }), per the task's own Notes
    pointing to the key the delivered error envelope already uses for the slug in
    other case refusals.
- inferred: The layer that attaches HTTP 409 to CaseHoldsVersionsError is the existing
    status-map.ts registry read by error-handler.middleware.ts, not a status carried
    by the error class itself.
  from: Every existing case-lifecycle 409 refusal already being registered there rather
    than self-mapped, together with constraints/the-domain-depends-on-no-infrastructure,
    which a framework-derived error class would have breached.
- inferred: The message states only that the case "ainda possui versão" without naming
    draft or released, rather than enumerating both states.
  from: rules/knowledge/a-case-holding-no-version-may-be-deleted's own statement,
    which refuses the delete for a case "holding any version, draft or released" without
    distinguishing them, combined with the ban on the raw lifecycle token — naming
    one state and not the other would misstate the condition.
deferred:
- what: The accept/refuse condition itself, and the delete operation that raises CaseHoldsVersionsError
    in its refused branch.
  why: The task's own Notes mark this REMAINDER, assigning it to task/case-deletion/delete-case-over-case-lifecycle
    and task/case-deletion/store-deletes-a-versionless-case; this task only implements
    the named error and its status mapping.
- what: constraints/a-successful-case-deletion-answers-with-no-content (the accepted
    branch's response shape).
  why: The task's own Notes mark this ADVISORY, noting it governs only the accepted
    branch and belongs with the delete operation task, not this refusal.
---

## What it is

The domain error a delete raises over a case holding any version, draft or released, and its registration in the status map at 409, beside the other case-lifecycle conflicts.

## Notes

The first build attempt (run/case-deletion-case-holds-versions-refusal-build) failed at test-unit on one unrelated, pre-existing timing-tolerance flake in src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts (expected elapsed_ms >= 20, got 19), in a file this delivery does not touch. A clean re-run (run/case-deletion-case-holds-versions-refusal-build-2) passed every step; the record pins that run.

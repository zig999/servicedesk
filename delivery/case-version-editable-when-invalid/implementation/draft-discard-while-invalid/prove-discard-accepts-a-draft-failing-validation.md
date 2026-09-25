---
target: backend
title: Discard already accepts a draft failing validation -- confirmed, no change
summary: Verifies that discard.controller.ts, discard.operation.ts and discard.routes.ts already accept
  and answer a discard of a draft whose manifest is empty or whose subject fails glossary coherence, since
  discard's own call chain never parses or validates the case document; no source was created or modified.
task: sha256:78c8c12acf2458f0b0eb99e2ec7578ace6fdc23390683b92fb84974963a5957a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-discard-while-invalid-prove-discard-accepts-a-draft-failing-validation-build
files:
- path: src/case/discard.operation.ts
  effect: unchanged by this delivery; discardCaseVersion already checks only assembled === undefined (CaseNotFoundError)
    and assembled.state !== 'draft' (CaseVersionNotDraftError), calling neither parseCaseDocument, structuralCase
    nor readCase, so a manifest-empty or glossary-incoherent draft is accepted unconditionally as long
    as it exists and is a draft
- path: src/http/discard.controller.ts
  effect: unchanged by this delivery; handleDiscardRequest only awaits dependencies.discard(slug, version)
    and returns nothing, running no validation of its own
- path: src/http/discard.routes.ts
  effect: unchanged by this delivery; the route handler already ends with reply.code(204).send() with
    no payload
- path: src/http/dto/discard.dto.ts
  effect: unchanged by this delivery; declares only a params schema, no response body schema, so Fastify
    sends no body for the 204
criteria:
- criterion: A discard of a draft whose manifest holds no entry is answered HTTP 204.
  met: true
  how: discard.operation.ts never inspects the manifest before discarding, and discard.routes.ts answers
    204 with no body on success
- criterion: After that discard, the store answers no case version at that draft's slug and number.
  met: true
  how: store.discard() removes the version and its own manifest entries, unconditional on manifest content
- criterion: After that discard, a draft next created for the same case is not numbered with the discarded
    draft's number.
  met: true
  how: version numbering is the store's own unrelated concern, untouched by whether the discarded draft's
    manifest was empty
- criterion: A discard of a draft whose stored subject names a subject type the glossary does not hold
    is answered HTTP 204.
  met: true
  how: discard's call chain never runs glossary coherence checks (no call to structuralCase, parseCaseDocument
    or readCase), so a glossary-incoherent subject is never inspected before the discard is accepted
nodes:
- node: rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  how: 'the acceptance half of this rule already holds: discard.operation.ts''s own condition (draft state
    alone) is the whole of what discard.operation.ts decides, run through no validator, so a discard is
    accepted whatever validator rule of validation-runs-at-every-read would otherwise fail over the draft'
  encoded_at:
  - src/case/discard.operation.ts
  - src/http/discard.controller.ts
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  how: the scenario's given (a manifest-empty draft) and then (discard accepted, version and manifest
    entries removed) are the criteria this record confirms met by the existing, unmodified code
  encoded_at:
  - src/case/discard.operation.ts
- node: constraints/a-successful-case-version-discard-answers-with-no-content
  how: discard.routes.ts already answers HTTP 204 with no body on an accepted discard, and discard.dto.ts
    declares no response body schema for Fastify to serialize one
  encoded_at:
  - src/http/discard.routes.ts
  - src/http/dto/discard.dto.ts
inferences:
- inferred: no source file was created or modified; the four files listed above are named only because
    they are where the three implemented nodes' facts are encoded, for the trace to bind against, not
    because this delivery changed them
  from: direct reading of discard.operation.ts, discard.controller.ts, discard.routes.ts and discard.dto.ts
    confirmed every criterion already holds; the task's own rationale anticipated this ("no source change
    is planned")
preserved:
- discard.operation.ts, discard.controller.ts, discard.routes.ts and discard.dto.ts are byte-for-byte
  unchanged by this delivery
- only-a-draft-case-version-may-be-discarded's own CaseVersionNotDraftError refusal over a released version,
  and the case-not-found refusal, are untouched
---

## What it is

No source change. This record documents a direct verification -- reading discard.operation.ts, discard.controller.ts, discard.routes.ts and discard.dto.ts -- that discard already accepts a draft whatever validator rule of validation-runs-at-every-read would fail over it, and already answers HTTP 204 with no body on success, exactly as this task's criteria and the specification's own decision-log entry for constraints/a-successful-case-version-discard-answers-with-no-content already say the delivered route gives.

## Notes

The task's own rationale anticipated this outcome ("no source change is planned"); the task-implementer verified it directly against the current tree rather than trusting the inventory's summary alone, and confirmed every criterion holds unconditionally because discard's call chain never constructs, parses or validates the case document.

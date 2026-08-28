# Corrective increment — revise-hypothesis 500 on typed refusals

## Observed behavior

Running the delivered system: `POST /v1/cases/perfil-mobile-tecnico-probe/hypotheses`, editing an
existing hypothesis's `criterion` from the manifest screen, responds

```
HTTP 500
{"error":{"code":"INTERNAL_ERROR","message":"an unexpected error occurred"}}
```

Request body sent by the frontend:

```json
{"hypothesis_name":"multiplos-devices-vinculados","criterion":"O técnico tem duas ou mais instalações do app vinculadas ao seu usuário, cada uma em um aparelho distinto, mas apenas uma pode estar ativa. Mais de uma instância ativa permite que uma tarefa inicie em um celular, e que o técnico termine em outro, gerando inconsistências.","collects":["perfil-mobile-tecnico"],"resolution":{"outcome":"issue-multiplos-devices-vinculados","referral":{"action":"remover-devices-obsoletos","recipient":"fila-suporte-mwo"}},"subject":"technician"}
```

The body matches `reviseHypothesisBodySchema` field-for-field and the domain shapes for a
hypothesis-revision; this is not a malformed request.

## Root cause, read from the source

`src/src/case/revise-hypothesis.operation.ts`'s `ReviseHypothesisOperation.reviseHypothesis` can
throw one of four typed domain errors before ever reaching the case store:
`CaseHoldsNoDraftError`, `HypothesisRevisionCollectsNoConceptError`, `ConceptNotInGlossaryError`,
`ConceptRefusesSubjectTypeError`.

None of the four is registered in `src/src/errors/status-map.ts`'s `STATUS_BY_ERROR_CLASS` map.
`error-handler.middleware.ts` calls `statusForError(error)`, and when it returns `undefined` for an
unmapped class, falls through to the generic `reply.code(500).send({ error: { code:
'INTERNAL_ERROR', message: 'an unexpected error occurred' } })` — exactly the response observed.

This is a known, already-disclosed gap, not a new discovery: two existing delivery records flag it
and defer the fix to a human-authorized corrective task:

- `delivery/case-management-http-api/implementation/case-lifecycle-http/revise-hypothesis-route.md`
  (criterion 3, `met: false`): *"CaseHoldsNoDraftError carries no entry in
  src/errors/status-map.ts ... The mismatch is left for a human to settle through a corrective
  task."*
- `delivery/revise-hypothesis-draft-gate/implementation/revise-hypothesis-draft-gate/refuse-without-draft.md`
  (divergence citing COR-04): *"CaseHoldsNoDraftError is not added to status-map.ts's
  STATUS_BY_ERROR_CLASS table ... This same operation's three pre-existing refusals
  (ConceptNotInGlossaryError, HypothesisRevisionCollectsNoConceptError,
  ConceptRefusesSubjectTypeError) are left unmapped there too."*

This scope is that human authorization: fix `status-map.ts` so all four typed refusals reach the
caller as a typed status rather than the generic 500.

## What the correction does

Add the four classes to `STATUS_BY_ERROR_CLASS` in `src/src/errors/status-map.ts`, following the
grouping convention the file's own header comment already documents:

- `CaseHoldsNoDraftError` → **409** — the case's own current state (no draft version) forbids the
  operation, the same group as `CaseVersionNotDraftError`, `CaseAlreadyHasDraftError`,
  `CaseVersionNotReleasedError`.
- `ConceptNotInGlossaryError` → **404** — names a concept the glossary plainly does not hold, the
  same group as `ConceptNotHeldError`, `VocabularyTermNotHeldError`.
- `HypothesisRevisionCollectsNoConceptError` → **422** — a well-formed request that would violate a
  business invariant (a hypothesis-revision collecting no concept), the same group as
  `ManifestWouldHoldNoHypothesisError`.
- `ConceptRefusesSubjectTypeError` → **422** — same group, the same shape as
  `SubjectDoesNotCoverCaseInputsError` (a well-formed request whose content violates a business
  invariant).

The file's own header comment, which enumerates each group's members, is updated to name the four
new entries under their correct group.

None of the three business rules behind these four errors —
`rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft`,
`rules/knowledge/case-terms-exist-in-the-glossary`,
`rules/knowledge/a-hypothesis-collects-at-least-one-concept`,
`rules/knowledge/a-concept-accepts-the-declared-subject-type` — fixes an HTTP status in its own
statement. The status choice is this project's own engineering decision, the same way every other
already-mapped entry in the file is, per the file's own header comment.

## Human authorization

The human who reported the 500 above reviewed this diagnosis and approved routing it as a
corrective increment through `/plan-work`, with the four proposed HTTP statuses, before this scope
was written.

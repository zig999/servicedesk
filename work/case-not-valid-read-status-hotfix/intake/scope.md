# Scope

Corrective increment.

## The wrong behavior

A read naming a stored case version that fails `validation-runs-at-every-read` (i.e.
`CaseQueryService` throws `CaseNotValidError`) is answered with the generic unmapped-error
fallback — HTTP 500, per `constraints/a-domain-error-unmapped-by-status-is-refused-generically`
— instead of the distinguishable HTTP 409 the specification now requires.

Confirmed directly, not guessed: `src/__tests__/unit/http/read-case.routes.spec.ts:179-183`
asserts today —

```ts
built.readCase.mockRejectedValueOnce(new CaseNotValidError('a-slug', 1, ['a violated rule']));
...
expect(response.statusCode).toBe(500);
```

— documenting the very bug.

## What the specification requires

`rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name` (decided during
a prior initiative, already sound in this specification) states:

> A read naming a stored case version for which some validator rule of
> validation-runs-at-every-read does not hold at that reading is refused with an HTTP 409
> response reporting a CaseVersionNotValidError; it is never answered with the generic refusal a
> domain error the status map does not name receives, and never with the CaseNotFoundError that
> answers a slug or version no case version was ever written for.

## The file the wrong behavior lives in

`src/errors/status-map.ts` — the `STATUS_BY_ERROR_CLASS` map. `CaseNotValidError` (defined in
`src/errors/case-not-valid.error.ts`, thrown by `src/case/case-query.service.ts`) is the one
domain error this map does not list, so `statusForError()` returns `undefined` and the generic
fallback answers.

## Scope, deliberately narrow

This increment closes exactly the missing status-code mapping (500 instead of 409) for the
*existing* `CaseNotValidError` class. It does **not** rename the class to `CaseVersionNotValidError`
to match the specification's own literal name — that is a broader, separate decision: it would
ripple into the already-working frontend consumer (`error-ui-state.ts`, which maps the existing
name today) and into other already-delivered tests (including two tests a review-change pass on a
separate, frontend initiative already flagged as contradicting the specification's decided name).
That rename is named as a remainder for a human to decide separately. This increment's own
objective and criteria are scoped to: the read is refused with HTTP 409 (not 500), reporting the
existing `CaseNotValidError` by its current name, the moment `CaseQueryService`'s own validation
throws it.

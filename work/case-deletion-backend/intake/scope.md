# Scope: delete a Case with no case-version — backend

Per the specification analysed and committed at a7aa31f3 on branch `main`, implement the
`delete` operation of the `Case` aggregate (`domain/knowledge/case`), published on
`contracts/knowledge/case-lifecycle`: delete is accepted only while the case holds no
case-version, draft or released, and refused otherwise with an HTTP 409 response reporting a
`CaseHoldsVersionsError` naming the case slug.

Specification nodes this scope answers to: `domain/knowledge/case`,
`domain/knowledge/case-version`, `rules/knowledge/a-case-holding-no-version-may-be-deleted`,
`scenarios/knowledge/a-case-holding-no-version-is-deleted`,
`contracts/knowledge/case-lifecycle`, `rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug`,
`rules/knowledge/a-slug-identifies-one-case`.

This was surfaced by a database health review: `production.cases` held a row (`slug='test'`)
whose one draft had been discarded, leaving an empty case with no operation able to remove it.

Backend only — a frontend affordance for this act, if the curator's case-listing surface needs
one, is a separate scope under `case-deletion-frontend`.

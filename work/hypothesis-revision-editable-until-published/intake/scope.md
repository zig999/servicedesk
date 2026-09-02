# Scope: hypothesis revision editable until published (backend)

Implement the specification committed under `knowledge/` on 2026-09-02: a hypothesis revision is
overwritten in place while unreleased, and creates the next revision only once a released case
version has adopted it (`rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased`).

Cover: `revise-hypothesis` (`contracts/knowledge/case-lifecycle`) choosing between overwriting the
hypothesis's own highest existing revision in place and creating the next one, per that rule and
`rules/knowledge/a-released-hypothesis-revision-is-never-altered`,
`rules/knowledge/a-hypothesis-revision-number-is-never-reused`,
`rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft`.

Source document: `temp/entendimento-revisao-de-hipotese-editavel-ate-publicacao.md`.

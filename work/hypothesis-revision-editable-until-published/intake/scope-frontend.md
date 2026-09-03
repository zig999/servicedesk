# Scope: hypothesis revision editable until published (frontend)

Evolves the plan already at `work/hypothesis-revision-editable-until-published` (backend-only so
far) with the frontend half of the same change. The specification now states
`rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased`: revising a hypothesis
writes into its own highest existing revision in place while unreleased, and creates the next
revision only once a released case version has adopted it.

Cover, on the frontend: the curator's hypothesis-editing screen (the editor inside the case draft)
no longer forcing the "open the manifest builder to repin" step after a save that overwrote the
already-pinned revision (the pinned revision number did not change, so the draft's manifest entry
needs no repin) — while still offering it, exactly as today, after a save that did create a new
revision (the pinned entry now points at a lower, superseded number).

Source document: `temp/entendimento-revisao-de-hipotese-editavel-ate-publicacao.md`.

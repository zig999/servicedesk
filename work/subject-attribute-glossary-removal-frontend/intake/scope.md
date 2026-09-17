# Scope: remove the glossary vocabulary subject-attribute — frontend

Per the specification analysed and committed at 65c02dc9 on branch
`subject-attribute-glossary-removal`, remove the glossary vocabulary
`subject-attribute` from the frontend end to end, matching the backend
removal already delivered as `subject-attribute-glossary-removal-backend`:
the glossary no longer publishes a `subject-attribute` vocabulary, and a
subject's attribute names are free text rather than a governed term.

Specification nodes this scope answers to: `domain/investigation/subject-attribute-value`,
`domain/knowledge/case-input-requirement`, `rules/glossary/a-vocabulary-holds-each-name-once`,
`rules/glossary/a-glossary-read-by-an-unheld-name-is-refused`,
`rules/investigation/a-subject-holds-one-value-per-attribute`,
`rules/investigation/a-composed-subject-presents-every-case-input-requirement`,
`rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set`,
`rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`,
`contracts/investigation/glossary-source`.

Known impact (frontend, `frontend/app/src/`), from a grep of every file naming
`subject-attribute`, `SubjectAttribute`, `subjectAttribute`, `addedAttributes` or
`mergedAttributes`:

- `routes/glossary-browser-screen.tsx` — the glossary browser's own vocabulary tab set
  names `subject-attribute` as a browsable vocabulary; that tab and everything backing it
  goes.
- `routes/glossary-browser-screen.test-support.ts` — fixture/stub support for the above.
- `hooks/use-glossary-vocabulary.ts` — the vocabulary union type this hook reads narrows
  by one member.
- `hooks/use-glossary-vocabulary.spec.ts` — its own tests.
- `routes/case-simulation-subject-panel.tsx` — the simulation screen's own "+ attribute"
  control, which let an operator add an attribute the case's own input requirements did
  not already name; case-input-requirements coverage is already the frontend's own gate
  (delivered separately), so this control becomes dead weight once the backend no longer
  checks names against a glossary.
- `routes/case-simulation-subject-panel.test-support.ts`,
  `routes/case-simulation-subject-panel-attributes.spec.ts`,
  `routes/case-simulation-subject-panel-json-view.spec.ts` — tests of the above.
- `routes/case-simulation-ready-view.test-support.ts` — shared test support touching the
  same subject shape.
- `hooks/use-simulation-subject.ts` — `addedAttributes`/`mergedAttributes` state that fed
  the "+ attribute" control.
- `hooks/use-simulation-subject.spec.ts`,
  `hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts` —
  its own tests.
- `hooks/use-simulate-case.ts`, `hooks/use-simulate-hypothesis.ts` — read the composed
  subject the panel/hook above build; touched only if they name the vocabulary or the
  removed state directly, not for the coverage check itself (delivered separately).
- `hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts` —
  test touching the same composed-subject shape.
- `hooks/use-test-connector-panel.ts`,
  `routes/connector-test-panel-fields.spec.ts`,
  `routes/connector-test-panel-attribute-reconciliation.spec.ts` — the connector test
  panel's own subject-attribute handling, a separate consumer of the same vocabulary.
- `services/connector-configuration-subject-placeholder-statements.ts`,
  `services/simulation-subject-derivation.ts` — services deriving subject shape/placeholder
  statements from the glossary vocabulary or case input requirements.

Every file above is a candidate; which ones actually need a change (versus already reading
case-input-requirements exclusively) is for the inventory and binding steps to settle, not
this scope statement.

Out of scope: the backend (`src/`), already delivered as
`subject-attribute-glossary-removal-backend`. `frontend` is declared `edits_freely` in
`siegard.json`, but this change is a capability's surface and a domain fact (what an
operator can add to a simulated subject, and what the glossary browser lists) — not a
label, a colour or a control's cosmetic shape — so it takes the plan-work → implement-task →
review-change route, not a direct edit.

---
title: Frontend surface naming the subject-attribute glossary vocabulary or the +attribute state it fed
summary: The glossary browser's subject-attribute tab, the two hooks reading/exposing that vocabulary
  member, the simulation subject panel's "+ attribute" control and its addedAttributes/mergedAttributes
  state, and their own tests are the real touch points; five of the twenty candidate files only read the
  composed subject or case-input-requirements and never name the vocabulary or the removed state.
sources:
- intake/scope.md
area:
- src/routes/glossary-browser-screen.tsx
- src/routes/glossary-browser-screen.test-support.ts
- src/hooks/use-glossary-vocabulary.ts
- src/hooks/use-glossary-vocabulary.spec.ts
- src/routes/case-simulation-subject-panel.tsx
- src/routes/case-simulation-subject-panel.test-support.ts
- src/routes/case-simulation-subject-panel-attributes.spec.ts
- src/routes/case-simulation-subject-panel-json-view.spec.ts
- src/routes/case-simulation-ready-view.test-support.ts
- src/hooks/use-simulation-subject.ts
- src/hooks/use-simulation-subject.spec.ts
- src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
- src/hooks/use-simulate-case.ts
- src/hooks/use-simulate-hypothesis.ts
- src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
- src/hooks/use-test-connector-panel.ts
- src/routes/connector-test-panel-fields.spec.ts
- src/routes/connector-test-panel-attribute-reconciliation.spec.ts
- src/services/connector-configuration-subject-placeholder-statements.ts
- src/services/simulation-subject-derivation.ts
- src/hooks/use-case-input-requirements.ts
- src/hooks/use-simulation-subject.test-support.ts
- src/hooks/use-case-simulation-cockpit.test-support.ts
- src/routes/connector-test-panel.test-support.ts
modules:
- name: glossary-browser-screen
  path: src/routes/glossary-browser-screen.tsx
  role: touched
- name: glossary-browser-screen-test-support
  path: src/routes/glossary-browser-screen.test-support.ts
  role: touched
- name: use-glossary-vocabulary
  path: src/hooks/use-glossary-vocabulary.ts
  role: touched
- name: use-glossary-vocabulary-spec
  path: src/hooks/use-glossary-vocabulary.spec.ts
  role: touched
- name: case-simulation-subject-panel
  path: src/routes/case-simulation-subject-panel.tsx
  role: touched
- name: case-simulation-subject-panel-test-support
  path: src/routes/case-simulation-subject-panel.test-support.ts
  role: touched
- name: case-simulation-subject-panel-attributes-spec
  path: src/routes/case-simulation-subject-panel-attributes.spec.ts
  role: touched
- name: case-simulation-subject-panel-json-view-spec
  path: src/routes/case-simulation-subject-panel-json-view.spec.ts
  role: touched
- name: case-simulation-ready-view-test-support
  path: src/routes/case-simulation-ready-view.test-support.ts
  role: touched
- name: use-simulation-subject
  path: src/hooks/use-simulation-subject.ts
  role: touched
- name: use-simulation-subject-spec
  path: src/hooks/use-simulation-subject.spec.ts
  role: touched
- name: use-simulation-subject-hold-dispatch-open-for-missing-requirement-spec
  path: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  role: touched
- name: use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement-spec
  path: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  role: touched
- name: use-simulate-case
  path: src/hooks/use-simulate-case.ts
  role: adjacent
- name: use-simulate-hypothesis
  path: src/hooks/use-simulate-hypothesis.ts
  role: adjacent
- name: use-test-connector-panel
  path: src/hooks/use-test-connector-panel.ts
  role: depends-on
- name: connector-test-panel-fields-spec
  path: src/routes/connector-test-panel-fields.spec.ts
  role: adjacent
- name: connector-test-panel-attribute-reconciliation-spec
  path: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  role: adjacent
- name: connector-configuration-subject-placeholder-statements
  path: src/services/connector-configuration-subject-placeholder-statements.ts
  role: adjacent
- name: simulation-subject-derivation
  path: src/services/simulation-subject-derivation.ts
  role: adjacent
- name: use-case-input-requirements
  path: src/hooks/use-case-input-requirements.ts
  role: depends-on
conventions:
- statement: A glossary vocabulary is read through the shared useGlossaryVocabularyOptions(vocabulary)
    hook, never through a bespoke fetch, and the vocabulary argument is typed as the GlossaryVocabulary
    union rather than a bare string.
  seen_at: src/routes/case-simulation-subject-panel.tsx:34,40 and src/hooks/use-test-connector-panel.ts:164
- statement: Each browsable vocabulary in the glossary browser is one Tabs/TabsTrigger/TabsContent triple
    driving one VocabularyPanel instance, keyed by the same vocabulary string used as the tab's value.
  seen_at: src/routes/glossary-browser-screen.tsx:64-86
- statement: 'A composed simulation subject is always the shape { type: string; attributes: readonly {
    attribute: string; value: string }[] }, repeated with a local type alias in every hook/service that
    builds or forwards it (SimulationSubject, SimulateSubject, SimulateHypothesisSubject) rather than
    importing one shared type.'
  seen_at: src/hooks/use-simulation-subject.ts:22-25, src/hooks/use-simulate-case.ts:16-19, src/hooks/use-simulate-hypothesis.ts:11-14
- statement: A curator-editable attribute-row list (SubjectAttributeRow with a stable `id`, distinct from
    the attribute name) is the established pattern for "one row per attribute, added/removed/edited by
    row id" — used identically for the simulation panel's addedAttributes and the connector-test panel's
    placeholder-reconciled attributes.
  seen_at: src/hooks/use-simulation-subject.ts:88 (state) and src/hooks/use-test-connector-panel.ts:11-18
    (type) and 168 (state)
- statement: A rule id referenced by name inside a test's own describe-block prose (e.g. "rules/investigation/a-subject-attribute-is-drawn-from-the-glossary")
    is not itself evidence the test exercises glossary-drawn behavior; connector-test-panel-fields.spec.ts's
    own test of that description exercises placeholder reconciliation, not a glossary read of "subject-attribute"
    at all.
  seen_at: src/routes/connector-test-panel-fields.spec.ts:70-95
must_not_duplicate:
- what: The shared glossary-vocabulary-options hook (useGlossaryVocabularyOptions), including its options-mapping
    and loading/error/refetch shape
  at: src/hooks/use-glossary-vocabulary.ts
- what: The row-reconciliation helper for a curator-editable attribute list keyed by stable row id (add/remove/change
    by id, not position)
  at: src/hooks/use-simulation-subject.ts (onAddAttribute/onRemoveAttribute/onAttributeChange) and src/hooks/use-test-connector-panel.ts
    (reconcileAttributeRows)
- what: The subject-placeholder-token extraction from a connector configuration's JSON text (address/query/headers/body
    walk, ${subject:name} pattern)
  at: src/services/simulation-subject-derivation.ts (subjectPlaceholderNamesInConfiguration) and src/services/connector-configuration-subject-placeholder-statements.ts
    (extractSubjectAttributeNames) — two independent implementations of the same walk already exist; a
    task must not add a third
risks:
- risk: Narrowing GlossaryVocabulary to drop "subject-attribute" breaks any code that still passes that
    literal, including code this scope does not list if it exists elsewhere
  consumers:
  - src/routes/case-simulation-subject-panel.tsx (useGlossaryVocabularyOptions("subject-attribute") at
    line 40)
  - src/hooks/use-glossary-vocabulary.spec.ts (literal "subject-attribute" test cases)
- risk: Removing addedAttributes/mergedAttributes/onAddAttribute/onRemoveAttribute/onAttributeChange from
    SimulationSubjectState breaks every test that drives readiness or dispatch through those fields, even
    though those tests' own subject is the missing-requirement readiness rule, not the glossary vocabulary
  consumers:
  - src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts (drives readiness
    via onAddAttribute/onAttributeChange)
  - src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts (drives useCaseSimulationCockpit's
    subject.onAddAttribute/addedAttributes the same way)
  - src/hooks/use-simulation-subject.spec.ts (criterion 4/7/MNT-04 tests of curator-added attributes)
- risk: case-input-requirements coverage is a separate, already-delivered gate that determines requiredFields
    and readiness independently of the glossary; removing the +attribute control and its state must not
    touch that gate's own implementation or its "never refuses on a required field's empty input" behavior
  consumers:
  - src/hooks/use-case-input-requirements.ts (the requirements read itself)
  - src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts and src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
    (assert the coverage/readiness rule, which must keep passing once the +attribute control is gone,
    on whatever the removal leaves of their own scenarios)
- risk: SubjectAttributeRow/SubjectAttributeValue types and the reconciliation helper in use-test-connector-panel.ts
    are structurally identical to the simulation panel's row shape but are not glossary-vocabulary-driven
    at all (they come from connector-configuration placeholder names); a task could wrongly fold the connector-test-panel's
    attribute handling into this removal
  consumers:
  - src/hooks/use-test-connector-panel.ts (reconcileAttributeRows, unrelated to the subject-attribute
    vocabulary)
  - src/routes/connector-test-panel-fields.spec.ts and src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    (would wrongly fail if that handling were touched)
- risk: use-simulation-subject.test-support.ts and use-case-simulation-cockpit.test-support.ts are shared
    fixture files neither naming the vocabulary nor the removed state directly, but every spec above imports
    them; an edit there for an unrelated reason could silently mask or break the removal's own tests
  consumers:
  - src/hooks/use-simulation-subject.spec.ts, src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts,
    src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
---

## What it is

The frontend surface that names the glossary vocabulary `subject-attribute` directly, or the `addedAttributes`/`mergedAttributes` state the simulation subject panel's "+ attribute" control fed, plus every sibling file needed to see how those pieces connect.
Of the twenty candidate files the scope named, fourteen actually name the vocabulary or the removed state and are real touch points: the glossary browser screen and its test support, the `use-glossary-vocabulary` hook and its spec, the case-simulation subject panel and its three specs plus test support, the case-simulation ready-view test support, and `use-simulation-subject` with its two specs, plus the cockpit's own missing-requirement spec which drives the same removed state through `useCaseSimulationCockpit`.
Five files sit adjacent only: `use-simulate-case.ts` and `use-simulate-hypothesis.ts` compose a generic `{type, attributes}` subject and name neither the vocabulary nor the removed state; `use-test-connector-panel.ts` reads the surviving `subject-type` vocabulary member only, and its own attribute rows come from connector-configuration placeholders, not the glossary; `connector-test-panel-fields.spec.ts` and `connector-test-panel-attribute-reconciliation.spec.ts` exercise that placeholder-driven reconciliation, not `subject-attribute`, despite one test's own prose naming a since-superseded rule id.
The two derivation services, `simulation-subject-derivation.ts` and `connector-configuration-subject-placeholder-statements.ts`, hold two independent but structurally identical placeholder-name-extraction walks; neither names the glossary vocabulary — they read case-input-requirements and connector-configuration text respectively.

## Notes

`use-case-input-requirements.ts` implements the already-delivered case-input-requirements gate this scope's own note points to; it is untouched by this removal and is the named consumer any task must verify against, not extend.
The composed-subject shape (`{type, attributes: {attribute, value}[]}`) is repeated with a separate local type alias in `use-simulation-subject.ts`, `use-simulate-case.ts` and `use-simulate-hypothesis.ts` rather than shared from one place; a task removing `addedAttributes` must keep that shape's field-level contract (attribute/value pairs) intact for those three consumers, since none of them import the type being changed.
`SubjectAttributeRow`/`SubjectAttributeValue`, defined in `use-test-connector-panel.ts`, are imported by `use-simulation-subject.ts` for its own `addedAttributes` state; removing the simulation panel's use does not mean the type itself goes — the connector-test panel still needs it for its own, unrelated placeholder-derived rows.
The glossary browser's `ALL_TAB_LABELS`/`VOCABULARY_TAB_CASES`/`ALL_TAB_CASES` fixtures in its test support are shared across every tab's test, so removing the "Subject attributes" entry there changes array lengths and orderings other tabs' own assertions may implicitly rely on.

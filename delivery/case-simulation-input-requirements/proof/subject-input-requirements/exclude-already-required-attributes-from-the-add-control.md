---
title: Proof for excluding already-required attributes from the "+ attribute" control
summary: New and one corrected spec in case-simulation-subject-panel-attributes.spec.ts proving the five
  criteria of exclude-already-required-attributes-from-the-add-control and its own UNDERDETERMINED note
  over state.addedAttributes.
implementation: sha256:0095a0520453e60cfb15a78278c7a7c99f6371773e8226fdf266fae611c0b75a
run: run/subject-input-requirements-exclude-required-suite-3
tests:
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5, rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)
    > offers exactly the subject-attribute vocabulary's own current terms as options, when no requirement
    names any of them
  proves: Not a criterion of this task -- a pre-existing test for task/subject-derivation/subject-panel's
    own criterion 5, corrected (fixture only, its own assertion left unchanged) so its default requiredFields
    (naming "account-id", one of the two mocked vocabulary terms) no longer collides with this task's
    own new filter. Without this correction, this pre-existing test would fail against the very source
    that satisfies this task's own criterion 1, for a reason that has nothing to do with either task's
    own concern.
  fails_when: the add-attribute Select ever fails to offer every mocked vocabulary term ("account-id"
    and "email") when state.requiredFields names none of them.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control excludes every attribute name state.requiredFields
    already names (criteria 1 and 3) > removes the required attribute's own name from the Select's own
    options, leaving only the vocabulary term no requirement names
  proves: The attribute Select offers no attribute name the state's own requirement set already names
    (criterion 1). Since onAttributeChange can only ever be invoked with an option this Select actually
    renders, this same assertion also proves that no attribute the requirement set already names can be
    added a second time through this control (criterion 3).
  fails_when: the opened listbox's own options still include "account-id" (an attribute state.requiredFields
    already names), or omit "email" (the one mocked term no requirement names).
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- every option the filtered Select still offers stays glossary-drawn,
    the control itself never becoming free text (criterion 2) > keeps the Attribute field a Select-typed
    combobox, not an Input, once a required attribute has been filtered out of its options
  proves: Every option the Select still offers is drawn from the glossary's subject-attribute vocabulary,
    never typed as free text -- confirmed by the control itself staying a Select/combobox even once filtering
    has narrowed its options (criterion 2).
  fails_when: the Attribute field's own trigger stops being a role=combobox BUTTON once the requirement
    set has filtered out an option -- e.g. if the narrowed case were rendered through a free-text Input
    instead.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the control offers no option, rather than falling back to the unfiltered
    vocabulary, once the requirement set already names every attribute the vocabulary holds (criterion
    5, edge case) > opens an empty listbox when every subject-attribute vocabulary term is already named
    by a requirement
  proves: Where the requirement set already names every attribute the vocabulary holds, the control offers
    no option rather than falling back to the unfiltered list (criterion 5).
  fails_when: the opened listbox renders any option at all -- e.g. falls back to the unfiltered two-term
    vocabulary -- once requiredFields already names both "account-id" and "email".
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- an attribute already picked through an earlier added-attribute row
    stays offered in a later row's own Select (UNDERDETERMINED) > still offers an attribute already typed
    into an earlier row as an option for a later, still-unfilled row
  proves: the task's own UNDERDETERMINED note -- every criterion scopes the exclusion to state.requiredFields
    alone, and none of the attribute-provenance/one-value-per-attribute rules this task implements names
    state.addedAttributes either, so an implementation that also excluded an attribute already typed into
    an earlier row would still satisfy every criterion as written; this task's own shipped filter does
    not do that, and this test fixes that fact rather than assuming it.
  fails_when: the later row's own listbox stops offering "email" once an earlier row has already been
    set to "email" -- i.e. the implementation the note names, which filters against state.addedAttributes
    as well as state.requiredFields.
not_applicable:
- edge_case: two curator-added rows independently coming to name the same non-requirement attribute (a
    duplicate the assembled subject would then carry)
  why: the task's own REMAINDER note assigns rules/investigation/a-subject-holds-one-value-per-attribute's
    own first-recorded-wins resolution, for this exact case, to the act that assembles a subject's whole
    attribute-value set before a diagnose/simulate-case/simulate-hypothesis call -- outside this task's
    own candidate set, which only filters this one control's own offered options. The UNDERDETERMINED
    test above already establishes that state.addedAttributes plays no part in that filter; nothing further
    is this task's own to assert.
- edge_case: a required field naming an attribute the subject-attribute vocabulary itself does not currently
    hold
  why: availableAttributeOptions is a plain subtractive filter over the vocabulary's own returned options;
    an attribute absent from that list was never an offered option to begin with, so this changes nothing
    observable and no criterion of this task turns on it.
- edge_case: the subject-attribute glossary read itself failing or still loading while a requirement is
    present
  why: unaffected by this task -- the loading/error states for that read are already proven in case-simulation-subject-panel-json-view.spec.ts
    and untouched by this delivery; this task only narrows the options list once that read has already
    settled.
- edge_case: two concurrent operations against the panel (e.g. two rows being interacted with "at once")
  why: availableSubjectAttributeOptions is a pure, synchronous computation over already-rendered state,
    recomputed on every render from state.requiredFields alone; two rows read the same computed array
    and neither read's timing depends on the other's, so there is no concurrency hazard this task's own
    criteria raise.
untested:
- whether two curator-added rows that come to share the same non-requirement attribute name are ever resolved
  (e.g. first-recorded-wins) before a diagnose/simulate call is not proven anywhere in this file -- this
  task's own REMAINDER note assigns that resolution to a different, not-yet-identified act assembling
  the subject's whole attribute-value set, and nothing in this task's own criteria or the source it delivers
  settles it.
- useGlossaryVocabularyOptions still answering with the whole, unfiltered vocabulary for its OTHER consumers
  (criterion 4) is a non-regression claim about components this task's own delivery does not touch (e.g.
  glossary-browser-screen.tsx); it is not re-asserted here since this task never modifies that hook, and
  that hook's own pre-existing tests (outside this file) already cover its own unfiltered-return behavior
  for those callers.
---

## What it is
Proof that the curator's manual "+ attribute" control stops offering an attribute the pinned version's own requirements already present, while staying a glossary-drawn Select and leaving every other reader of the vocabulary hook unaffected.

## Notes
None.

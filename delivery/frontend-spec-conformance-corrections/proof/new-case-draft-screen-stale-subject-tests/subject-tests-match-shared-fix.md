---
title: NewCaseDraftScreen's subject-field tests match the shared component's corrected behavior
summary: Independently confirms, against case-version-editor-form-fields.tsx and both corrected spec files
  as they stand, that all four corrected assertions match the subject Input's current disabled={isBlocked}/"Subject
  type" behavior and that nothing else in either file changed; adds one new test proving this screen's
  own isBlocked (createMutation.isPending) is what the four corrected assertions' "false" actually depends
  on.
implementation: sha256:c8dea32775865be2ca78d9f43a96648f5ff47353e3762bdd168ebdd8340cc4fd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/new-case-draft-screen-stale-subject-tests-subject-tests-match-shared-fix-suite
tests:
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: NewCaseDraftScreen — seeding from the case's own latest released version > pre-populates title,
    when_to_use, subject, fallback outcome/referral and consolidation register from the case's own latest
    released version, read via GET /v1/cases/{slug}/versions/{version}
  proves: Given the 'pre-populates title, when_to_use, subject, fallback outcome/referral and consolidation
    register' test, the subject input assertion no longer expects disabled to be present while the create
    form is idle.
  fails_when: 'The assertion at line 39, expect(subjectInput.hasAttribute(''disabled'')).toBe(false),
    trips the moment either side of the fact it pins moves — case-version-editor-form-fields.tsx''s subject
    Input reverting to an unconditional disabled (or to any disabled={true} while isBlocked is false),
    or useNewDraftVersionForm''s own isBlocked: createMutation.isPending stopping being false once a released
    version has been seeded and the create mutation is still idle.'
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: NewCaseDraftScreen — seeding from the case's own latest released version > leaves the form blank
    with the subject pre-set from the glossary and shows first-version copy when the case's version history
    holds no released version
  proves: Given the 'leaves the form blank with the subject pre-set from the glossary' test, the subject
    input assertion no longer expects disabled to be present while the create form is idle.
  fails_when: The assertion at line 86, the same hasAttribute('disabled')).toBe(false) shape, fails for
    the same reason as the test above but exercised through the no-released-version branch specifically
    — a regression there (e.g. a stray disabled reintroduced only on the glossary-seeded blank-form path)
    would be caught here even if the released-version path stayed correct.
- file: src/routes/new-case-draft-screen.spec.ts
  name: NewCaseDraftScreen > renders a blank form with no version's content pre-loaded, other than the
    subject field pre-set from the glossary
  proves: Given the 'renders a blank form with no version's content pre-loaded' test, the subject input
    assertion no longer expects disabled to be present while the create form is idle.
  fails_when: The assertion at line 28 fails if the subject Input is disabled on the screen's very first,
    un-fetched mount before any glossary or version-list read completes — the earliest point isBlocked
    could wrongly read true.
- file: src/routes/new-case-draft-screen.spec.ts
  name: NewCaseDraftScreen > does not pre-set the subject field when the subject-type vocabulary currently
    returns no terms
  proves: Given the 'does not pre-set the subject field when the subject-type vocabulary currently returns
    no terms' test, the field lookup uses the label 'Subject type' rather than 'Subject type (fixed)'.
  fails_when: await screen.findByLabelText<HTMLInputElement>('Subject type') at line 53 times out and
    throws if case-version-editor-form-fields.tsx's FormField wrapping the subject Input carries any label
    other than exactly 'Subject type' — including a reverted 'Subject type (fixed)' — because getByLabelText/findByLabelText
    match the accessible name exactly.
- file: src/routes/new-case-draft-screen-subject-field.spec.ts
  name: NewCaseDraftScreen — subject field, blocked by the create Save in flight > disables the subject
    input while the create POST is in flight
  proves: 'The mechanism the four corrected assertions above all depend on staying false — useNewDraftVersionForm''s
    own isBlocked: createMutation.isPending, wired into case-version-editor-form-fields.tsx''s disabled={isBlocked}
    on the subject Input — actually flips the subject Input''s disabled attribute once this screen''s
    own create mutation goes pending. None of the four corrected assertions exercises this state (all
    four mount with the create form idle), so this is the one test in NewCaseDraftScreen''s own suite
    that would catch a regression where isBlocked stopped being read from createMutation.isPending, or
    the subject Input stopped reading disabled from isBlocked at all — a change that would otherwise silently
    leave the subject field editable while a POST that could still fail is in flight.'
  fails_when: 'Clicking Save with a never-resolving POST stub leaves subjectInput.hasAttribute(''disabled'')
    false rather than becoming true — i.e. case-version-editor-form-fields.tsx''s subject Input stops
    reading disabled={isBlocked}, or useNewDraftVersionForm stops setting isBlocked: createMutation.isPending.'
untested:
- 'Subject-input re-enabling once the create POST resolves — either a 201 (switching this screen into
  edit mode) or a non-2xx failure (leaving the curator on the still-blank form) — is not asserted anywhere
  in NewCaseDraftScreen''s own spec files, including the test this delivery adds. The added test deliberately
  never resolves its POST stub, so it fails for exactly one reason (the field never disabling) rather
  than two. new-case-draft-screen-save.spec.ts''s own re-enabling test asserts the Save button''s own
  re-enabling after a failure, not the subject input''s. CaseVersionEditorScreen''s analogous test (case-version-editor-screen-subject-field.spec.ts)
  does not stand in for this screen: it exercises useEditDraftVersionForm''s own isBlocked, a different
  hook from useNewDraftVersionForm''s createMutation.isPending that this screen actually uses.'
not_applicable:
- edge_case: Concurrent double-click issuing exactly one POST
  why: already proven, unmodified, by new-case-draft-screen-save.spec.ts's 'issues exactly one POST when
    Save is clicked twice in quick succession'; this corrective task's four criteria are about the subject
    field's disabled/label assertions specifically and this test is untouched by the correction, so no
    new test is warranted for it here.
- edge_case: A dependency (the glossary vocabularies, the version list, the version record) failing or
    answering slowly
  why: already proven, unmodified, by the loading-placeholder and load-error/retry tests in both spec
    files (listed under the implementation record's own preserved); none of the four corrected assertions
    touches those tests, and this task rearranges no behavior there.
- edge_case: Absent/empty/boundary/duplicate-collection cases
  why: the four corrected assertions concern only a boolean disabled attribute and a label string on one
    already-rendered field; no numeric range, empty-collection or duplicate-uniqueness concern is raised
    by what this task corrects or by the additional test this delivery adds.
---

## What it is

The proof for the stale-subject-tests corrective task: an independent confirmation, read fresh
against the target tree, that the four corrected assertions match the shared component's actual
current behavior, plus one new test exercising the one state none of the four corrected
assertions reaches — the subject field disabled while this screen's own create Save is in flight.

## Notes

None.

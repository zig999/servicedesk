---
title: Output schema help text and its pinning test
summary: The Output schema field's disclosure paragraph and the spec test that pins its exact wording,
  both needing the top-level-only claim replaced with a recursive one.
sources:
- work/recursive-output-schema-fields/intake/frontend-scope.md
area:
- frontend/app/src/routes/capability-form-fields.tsx
- frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts
modules:
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: capability-form-fields-output-schema-guidance-spec
  path: frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts
  role: touched
- name: json-code-editor-field
  path: frontend/app/src/shared/components/json-code-editor-field.tsx
  role: adjacent
- name: capability-create-screen-test-support
  path: frontend/app/src/routes/capability-create-screen.test-support.ts
  role: depends-on
- name: capability-detail-screen-test-support
  path: frontend/app/src/routes/capability-detail-screen.test-support.ts
  role: depends-on
conventions:
- statement: The output-schema disclosure paragraph is a single <p> with classes text-sm text-muted-foreground,
    sitting beside the JsonCodeEditorField with id="output_schema"; written as exactly five sentences,
    in Portuguese, with no digits and no braces.
  seen_at: frontend/app/src/routes/capability-form-fields.tsx:217-234
- statement: The disclosure text's exact wording is pinned sentence-by-sentence by a dedicated spec file,
    matched via case-insensitive regex against the paragraph's textContent; one describe block per numbered
    criterion.
  seen_at: frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts:52-63
- statement: The spec asserts the paragraph renders identically on both the create screen and the detail
    screen, and separately asserts sentence count stays exactly five and that no check/refusal or read-only-nature
    vocabulary appears.
  seen_at: frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts:23-39,122-157
must_not_duplicate:
- what: The findGuidanceParagraph helper (locates the guidance <p> by matching "o que é inserido aqui
    é json" in its textContent)
  at: frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts:15-21
risks:
- risk: Criterion 3's regex is an exact match against the current top-level-only wording; rewriting the
    help text without updating this regex will fail the existing test.
  consumers:
  - frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts
- risk: Criterion 8 counts sentences by splitting on . and expects exactly 5; a rewrite that adds a sentence
    must update this assertion, not just the copy.
  consumers:
  - frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts
- risk: Criterion 7 forbids digits and braces (no worked example); an illustrative path example must avoid
    digits or the existing no-example assertion breaks.
  consumers:
  - frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts
- risk: The same guidance paragraph is asserted to render identically on both the capability create screen
    and the capability detail screen; a fix must not diverge the two screens.
  consumers:
  - frontend/app/src/routes/capability-create-screen.test-support.ts
  - frontend/app/src/routes/capability-detail-screen.test-support.ts
---

## What it is

The route module renders the Output schema field via JsonCodeEditorField followed by a disclosure paragraph pinned sentence-by-sentence by a dedicated spec file, one describe block per specification-node criterion.
The current paragraph states the top-level-only reading the specification no longer holds; both the copy and the pinning test need to change together.

## Notes

No i18n/copy-file layer exists for this text; it is inline JSX string content in the route component.
No specification-node content itself needs changing; only this frontend copy and its pinning test are in scope.

---
title: Subject field honors isBlocked like every other declared attribute
summary: case-version-editor-form-fields.tsx's subject field now disables through isBlocked instead of
  unconditionally, and its label no longer claims the field is fixed.
task: sha256:ac04f0428bcc164deffd9194136626457e76271a922acf4e43215b3b31e0c18a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-field-fixed-bug-subject-follows-isblocked-build
files:
- path: src/routes/case-version-editor-form-fields.tsx
  effect: the subject field's Input now takes disabled={isBlocked} instead of an unconditional disabled,
    matching every other declared-attribute field (title, when_to_use, consolidation_register, the three
    fallback fields); its FormField label reads "Subject type" instead of "Subject type (fixed)"; the
    file's own header comment, which listed the wireframe's field set and had recorded "subject fixed/disabled"
    as part of it, is corrected to describe subject as a declared attribute corrected the same way as
    every other while draft holds, disabled through isBlocked like the rest.
criteria:
- criterion: Given a draft case version whose form is not blocked (not saving, not in conflict, not released),
    the subject field's input is enabled.
  met: true
  how: the Input rendered for subject now takes disabled={isBlocked}, the same expression every other
    declared-attribute field in this form already used; with isBlocked false the input is enabled.
- criterion: Given a case version whose form is blocked (isBlocked is true, for any of its stated reasons),
    the subject field's input is disabled, the same as every other declared-attribute field.
  met: true
  how: disabled={isBlocked} is the identical expression title, when_to_use, consolidation_register and
    every fallback field already render their own disabled through, so whatever sets isBlocked true for
    those fields disables the subject field the same way, for the same reasons.
- criterion: The subject field's label no longer states or implies that the field is fixed.
  met: true
  how: the FormField's label prop changed from "Subject type (fixed)" to "Subject type" -- no wording
    remains claiming the field cannot be edited.
nodes:
- node: domain/knowledge/case-version
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
  how: the node lists subject as a declared attribute (required, typed domain/glossary/subject-type) with
    no distinction from title, when_to_use, fallback or consolidation_register, and states under Responsibility
    that a version corrects its own declared attributes while draft state holds, the same freedom its
    manifest already holds. The corrected source now disables the subject Input through the same isBlocked
    expression as every other declared attribute, rather than unconditionally, so the field is editable
    in draft exactly as the node states, and the label stops asserting otherwise.
inferences:
- inferred: the corrected label reads exactly "Subject type", with no parenthetical qualifier of any kind.
  from: the adjacent labels in the same form -- "Title", "When to use", "Fallback outcome", "Fallback
    referral (action)" -- name the field plainly or, where a parenthetical appears, use it to disambiguate
    two fields of the same kind (the two fallback referral fields), never to assert a behavioral property
    of the control. Neither the task's criteria nor domain/knowledge/case-version states an exact label
    string, so the plain form matching that convention was chosen; the criterion itself asks only that
    the label stop stating or implying "fixed".
preserved:
- every other declared-attribute field's disabled={isBlocked} wiring (title, when_to_use, consolidation_register,
  fallback.outcome, fallback.referral.action, fallback.referral.recipient) -- untouched
- the Save control's own disabled={isBlocked || status === "clean"} and its isReadOnly-gated omission
- the aria-invalid/aria-describedby wiring on title and when_to_use, and FormField's error-rendering branch,
  both left as they were
- the FormField label-wraps-control association technique documented in the file's header comment, unchanged
  for every field including subject
- the file staying under MNT-01's three-hundred-line component limit
---

## What it is

The subject field now disables through the same isBlocked expression as every other declared-attribute field, and its label no longer claims the field is fixed.

## Notes

None.

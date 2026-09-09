---
contract_version: siegard-reconcile/4
title: The save control's form ownership under the footer portal
summary: 'A delivery gave this screen''s form a stable id and its submit control an explicit form attribute
  naming it, so the control keeps its form owner once ButtonFooter''s createPortal moves it out of the
  form''s DOM subtree; two prose comments predating the edit were removed under the project''s no-comments
  rule. The human states the change is correct: nothing about the revise request, the field validation
  or the answer''s display was altered, and the delivery''s own suite passed over it. The implementation
  record named no node with encoded_at, so its bind wrote nothing and all thirteen bindings this file
  already carried read stale.'
target: frontend
files:
- path: src/routes/hypothesis-revision-form-fields.tsx
  change: the form now carries a stable id and its submit control names that id, so activating the control
    submits the form instead of doing nothing once the footer portal renders the control outside the form's
    DOM subtree; two explanatory comments were removed and no field, request or displayed answer changed
nodes:
- node: domain/glossary/action
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the \"Referral action\" Select bound to\
    \ resolution.referral.action, lines 183-201 — name=\"resolution.referral.action\"\nrender={({ field\
    \ }) => (\n  <Select\n    value={field.value || null}\n    onChange={field.onChange}\n    onBlur={field.onBlur}\n\
    \    options={actionOptions.options}\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/concept
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the Collects checkbox list, lines 121-138\
    \ — {collectsOptions.map((concept) => {\n  const checked = field.value.includes(concept.name);\n \
    \ return (\n    <Checkbox\n      key={concept.name}\n      id={`collects-${concept.name}`}\n     \
    \ checked={checked}\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the \"Resolution outcome\" Select bound\
    \ to resolution.outcome, lines 157-174 — name=\"resolution.outcome\"\nrender={({ field }) => (\n\n\
    \  <Select\n    value={field.value || null}\n    onChange={field.onChange}\n    onBlur={field.onBlur}\n\
    \    options={outcomeOptions.options}\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the \"Referral recipient\" Select bound\
    \ to resolution.referral.recipient, lines 210-227 — name=\"resolution.referral.recipient\"\nrender={({\
    \ field }) => (\n  <Select\n    value={field.value || null}\n    onChange={field.onChange}\n    onBlur={field.onBlur}\n\
    \    options={recipientOptions.options}\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the disabled subjectType Input, lines\
    \ 95-97 — <FormField label=\"Subject type (from draft, fixed)\" errorId=\"subject-error\">\n  <Input\
    \ value={subjectType} disabled readOnly />\n</FormField>\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the same read-only subjectType field,\
    \ lines 95-97 — the case-version's own declared subject attribute, shown but not editable from this\
    \ form — <FormField label=\"Subject type (from draft, fixed)\" errorId=\"subject-error\">\n  <Input\
    \ value={subjectType} disabled readOnly />\n</FormField>\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the hypothesis_name Input, gated by hypothesisNameEditable,\
    \ lines 87-92 — <Input\n  {...register(\"hypothesis_name\")}\n  disabled={!hypothesisNameEditable\
    \ || isSubmitting}\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the criterion Textarea (lines 100-107),\
    \ the Collects fieldset (lines 109-149) and the resolution field group (lines 151-231) together, which\
    \ compose the revision's own content — <FormField label=\"Criterion\" errorId=\"criterion-error\"\
    \ error={errors.criterion?.message}>\n  <Textarea\n    {...register(\"criterion\")}\n    disabled={isSubmitting}\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/referral
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the paired "Referral action" and "Referral
    recipient" fields, lines 178-230 — name="resolution.referral.action"

    ...

    name="resolution.referral.recipient"

    '
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the outcome/referral group wrapped in\
    \ one row, lines 151-231 — <div className=\"flex gap-4\">\n  <FormField\n    label=\"Resolution outcome\"\
    \n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the trailingActions slot rendered beside\
    \ the submit control inside ButtonFooter, lines 233-238 — the extension point the specification leaves\
    \ to the interface for whatever control carries abandonment, without this file wiring any write into\
    \ it — <ButtonFooter>\n  <Button type=\"submit\" form={HYPOTHESIS_REVISION_FORM_ID} disabled={isSubmitting}>\n\
    \    Save hypothesis\n  </Button>\n  {trailingActions}\n</ButtonFooter>\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the four vocabulary-bound fields, which
    offer only options already supplied from the glossary hooks rather than free text — lines 121-230
    — options={outcomeOptions.options}

    ...

    options={actionOptions.options}

    ...

    options={recipientOptions.options}

    '
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the always-rendered resolution.outcome,\
    \ resolution.referral.action and resolution.referral.recipient fields, lines 151-231 — <FormField\n\
    \  label=\"Resolution outcome\"\n  errorId=\"resolution.outcome-error\"\n  error={errors.resolution?.outcome?.message}\n\
    >\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/hypothesis-revision-save-form-ownership.returns/.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hypothesis-revision-save-form-ownership.returns/`, which are the evidence behind every entry above.

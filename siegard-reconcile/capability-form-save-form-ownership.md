---
contract_version: siegard-reconcile/4
title: The save control's form ownership on the capability authoring screen
summary: 'A delivery gave this screen''s form a stable id and its submit control an explicit form attribute
  naming it, so the control keeps its form owner once ButtonFooter''s createPortal moves it out of the
  form''s DOM subtree. The human states the change is correct: nothing about the register-capability request,
  the field validation or the success navigation was altered, and the delivery''s own suite passed over
  it on the first attempt. The implementation record named no node with encoded_at, so its bind wrote
  nothing and all eight bindings this file carried read stale — three of them already stale before this
  delivery, from the direct commit that introduced the portal.'
target: frontend
files:
- path: src/routes/capability-form-fields.tsx
  change: the form now carries a stable id and its submit control names that id, so activating the control
    submits the form instead of doing nothing once the footer portal renders the control outside the form's
    DOM subtree; no field, request, validation or navigation changed
nodes:
- node: domain/integration/capability
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the form fields rendering each of the aggregate's\
    \ declared attributes: the Concept selector (lines 88-105), the Name/Version/Nature/Timeout inputs\
    \ (lines 108-154), the Connector input (157-164), and the Input schema / Output schema textareas (166-195)\
    \ — <FormField label=\"Concept\" errorId=\"concept-error\" error={errors.concept?.message}>\n  <Controller\n\
    \    control={control}\n    name=\"concept\"\n    render={({ field }) => (\n      <Select\n      \
    \  value={field.value}\n        onChange={field.onChange}\n        onBlur={field.onBlur}\n       \
    \ options={conceptSelectOptions}\n        disabled={isSubmitting}\n        placeholder=\"Select a\
    \ concept\"\n        aria-invalid={errors.concept != null}\n        aria-describedby={errors.concept\
    \ != null ? \"concept-error\" : undefined}\n      />\n    )}\n  />\n</FormField>\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at nowhere — the enumeration's own values are not\
    \ declared in this file; it only maps whatever the imported constant already holds — const NATURE_OPTIONS:\
    \ SelectOption[] = CAPABILITY_NATURES.map((nature) => ({\n  value: nature,\n  label: nature,\n}));\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/investigation/field-semantics
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the paragraph beside the Output schema field, lines\
    \ 185-193 — <p className=\"text-sm text-muted-foreground\">\n  O que é inserido aqui é <code>JSON</code>.\
    \ Os nomes de campo lidos a partir\n  dele são as chaves do próprio objeto <code>properties</code>\
    \ de nível\n  superior deste schema. O <code>type</code> e a <code>description</code>{\" \"}\n  declarados\
    \ por cada uma dessas chaves, onde o schema os declara, são lidos\n  como a semântica declarada desse\
    \ campo. Nenhum outro conteúdo deste schema é\n  lido ou validado. Uma <code>description</code> aqui\
    \ declara o que seu valor\n  significa e não nomeia nenhuma decisão.\n</p>\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the closing sentence of the same paragraph, lines
    190-192 — Uma <code>description</code> aqui declara o que seu valor significa e não nomeia nenhuma
    decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at nowhere — this file consumes a precomputed validity
    flag rather than checking the schema''s own syntax — isSubmitting || !inputSchema.isValid || !outputSchema.isValid
    || isDirty === false;'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at nowhere — the Nature control offers every value\
    \ the imported constant lists, unrestricted — <Select\n  value={field.value}\n  onChange={field.onChange}\n\
    \  onBlur={field.onBlur}\n  options={NATURE_OPTIONS}\n  disabled={isSubmitting}\n  aria-invalid={errors.nature\
    \ != null}\n  aria-describedby={errors.nature != null ? \"nature-error\" : undefined}\n/>\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the paragraph beside the Output schema field, lines\
    \ 185-193 — <p className=\"text-sm text-muted-foreground\">\n  O que é inserido aqui é <code>JSON</code>.\
    \ Os nomes de campo lidos a partir\n  dele são as chaves do próprio objeto <code>properties</code>\
    \ de nível\n  superior deste schema. O <code>type</code> e a <code>description</code>{\" \"}\n  declarados\
    \ por cada uma dessas chaves, onde o schema os declara, são lidos\n  como a semântica declarada desse\
    \ campo. Nenhum outro conteúdo deste schema é\n  lido ou validado. Uma <code>description</code> aqui\
    \ declara o que seu valor\n  significa e não nomeia nenhuma decisão.\n</p>\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at nowhere — the concept options are listed plainly\
    \ with no uniqueness check — const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept)\
    \ => ({\n  value: concept.name,\n  label: concept.name,\n}));\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/capability-form-save-form-ownership.returns/.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/capability-form-save-form-ownership.returns/`, which are the evidence behind every entry above.

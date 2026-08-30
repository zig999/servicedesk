---
title: Output_schema field-semantics guidance — proof
summary: Three new tests prove the guidance renders in both compositions of CapabilityFormFields and states meaning-versus-decision; criteria 5 and 6 are not independently tested, with why recorded.
implementation: sha256:66a0776a654dfb8bc86a2a38eef78dae0c25b5d17422e391bec3e11b6448d5db
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-output-schema-guidance-output-schema-field-guidance-suite-2
tests:
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: renders guidance beside the Output schema editor naming type and description as what the platform reads
  proves: Criterion 1 — the capability form dialog shows guidance at the output_schema editor naming per-field type and description as what the platform reads, plus criterion 3 (no other schema content is read or validated).
  fails_when: the dialog renders no such paragraph, or the paragraph's text no longer states that no other content is read or validated.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: contrasts a meaning example against a decision example in the same paragraph
  proves: Criterion 4 — the guidance states that a description says what a value means and never a decision.
  fails_when: the guidance drops either worked example, or states only one side of the contrast.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: renders the same guidance text beside the routed screen's own Output schema editor
  proves: Criterion 2 — the routed capability detail screen shows the same guidance at its output_schema editor.
  fails_when: the routed screen's own composition of CapabilityFormFields renders no guidance, or renders different text from the dialog's.
untested:
- 'Criterion 5 (JsonTextareaField''s props and rendering unchanged for its other consumers) is not tested here: it is a claim about which files this delivery did not open, verifiable by reading the diff (json-textarea-field.tsx is untouched) rather than by a test — no assertion could distinguish ''unchanged'' from ''coincidentally still working'' for a file this task never edited.'
not_applicable:
- edge_case: A valid output_schema whose properties declare no description still saves (criterion 6).
  why: Already exercised by every existing schema test in capabilities-browser-screen-capability-form-schema.spec.ts and capability-detail-screen-save.spec.ts, none of which fills a description into any property and all of which still save successfully; this task added no validation logic that could newly block them, so a new test would restate what those suites already establish.
---

## What it is
Three tests proving the guidance renders identically in both compositions of the capability form and states the meaning-versus-decision contrast the specification requires.

## Notes
The first suite run failed both new dialog-scoped tests: they inspected the dialog before the Concept vocabulary's own async load resolved (the form had not yet rendered), following a pattern this codebase's own working precedent (capabilities-browser-screen-capability-form-schema.spec.ts) already avoids by awaiting `within(dialog).findByLabelText("Name")` first. Fixed by adding that same await; suite-2 passed clean.

---
title: The two schema fields written only by the operator's own apply
summary: The Input schema and Output schema fields stand untouched by any draft answer's arrival and change only where the operator applies one of the drafted schemas, each field independently, and never over an unsubmitted edit without confirmation.
rationale: I kept arrival-leaves-them-alone and applying-writes-exactly-one in a single task because they are one seam read from two sides -- who may write those two fields -- and splitting them would leave a delivered state in which applying silently replaces an edit held nowhere else.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
objective: The content of the Input schema field and the Output schema field changes only through the operator's own act of applying a drafted schema, one field per act and never over an unsubmitted edit that has not been confirmed.
criteria:
- When a drafted outcome arrives, the Input schema field's content stands exactly as it stood before the request was dispatched.
- When a drafted outcome arrives, the Output schema field's content stands exactly as it stood before the request was dispatched.
- When any of the four refusal statements arrives, both fields' content stand exactly as they stood before the request was dispatched.
- Applying the draft's input_schema writes that text into the Input schema field.
- Applying the draft's input_schema leaves the Output schema field's content exactly as it stood.
- Applying the draft's output_schema writes that text into the Output schema field.
- Applying the draft's output_schema leaves the Input schema field's content exactly as it stood.
- An applied write reaches the field through the same onChange value-and-validity contract the field's own typing uses, so save-gating and Discard read applied text exactly as they read typed text.
- Where the field applied to holds an edit the operator has not submitted, the write is offered only once the operator confirms it, and what is offered for confirmation states the drafted text against what currently stands in that field.
- Where such a confirmation has not been given, that field's content stands exactly as it stood.
- The confirmation and its diff are the existing apply-over-unsaved-edit dialog and diff computation, not a second implementation of either.
- Applying either schema issues no register-capability call, and the capability registered at the identity being edited stands exactly as it stood.
- The act applying each schema is offered on the capability create screen and on the capability detail screen alike.
depends_on:
- task/schema-helper-request-and-statement/answered-draft-stated-to-the-operator
reference:
- frontend/app/src/routes/capability-form-fields.tsx
- frontend/app/src/hooks/use-capability-form.ts
- frontend/app/src/hooks/use-capability-detail-view.ts
- frontend/app/src/routes/connector-configuration-form-fields.tsx
- frontend/app/src/services/connector-configuration-apply-diff.ts
- frontend/app/src/shared/components/json-textarea-field.tsx
implements:
- rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
- rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
---

## What it is

The single write path from a stated draft into the capability form, and the guarantee that no other path exists.
Each schema is applied by its own act, so an operator who wants the input schema and not the output schema takes exactly one of them.

## Notes

The inventory records three risks that all turn on this path -- the detail screen's dirty baseline, the save-gating on the two fields, and the minify-at-submit contract -- which is why the criteria fix the onChange route rather than the resulting text alone.
UNDERDETERMINED, from the specification -- rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes and scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale both state that the act applying a stated draft stays offered once it stands stale; no criterion of this task reaches that -- criterion 13 asks only that the act be offered on the create screen and on the detail screen, which leaves the stale case open.
REMAINDER, from the specification -- The remaining clauses of rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes and of scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale -- the marking itself, the staleness comparison, the cleared-choice case and the withheld draft request -- reach no criterion of this task, which governs only the two fields' content and the acts writing it.
ADVISORY, from the specification -- Criterion 13 rests on the Schema Helper standing on both the authoring and the editing surface, a fact held by rules/integration/a-capability-authoring-surface-offers-a-schema-helper, not a candidate here.
Decision, beyond the covers — stand: rules/integration/a-capability-authoring-surface-offers-a-schema-helper is the sibling epic's own claim, implemented by this initiative's other epic's tasks; this task assumes the helper stands wherever that epic puts it and fixes only what writing the two fields does there.
ADVISORY, from the specification -- Criteria 8 and 11 name reuse targets (the field's own onChange contract, the existing apply-over-unsaved-edit dialog and diff) no candidate states as such; the bound rule states only that applying writes the text, registers nothing, and is offered over an unsubmitted edit once confirmed. Read as implementation-reuse direction rather than as a domain fact, the two criteria stand.

---
title: Rewrite the three orphaned specs to drive the operation Select
summary: connector-configuration-form-fields-configuration-helper.spec.ts, connector-configuration-form-fields-apply-confirmation.spec.ts
  and connector-configuration-create-screen-apply-draft.spec.ts choose an offered operation from the Select
  instead of typing a path or a method.
objective: The three orphaned spec files exercise the Configuration Helper the way it now works — choosing
  an offered operation from the Select — and every other assertion in each file is unchanged.
criteria:
- connector-configuration-form-fields-configuration-helper.spec.ts drives the helper by choosing an entry
  from the operations Select, never by typing into a path or a method field.
- connector-configuration-form-fields-apply-confirmation.spec.ts drives the helper the same way, and every
  assertion about the apply-confirmation behavior it already held is unchanged.
- connector-configuration-create-screen-apply-draft.spec.ts drives the helper the same way, and every
  assertion about the create-screen apply-draft behavior it already held is unchanged.
- The full frontend suite (npm test) passes with these three files included.
sources:
- intake/orphaned-configuration-helper-tests.md
implements:
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
---

## What it is

Rewrites only the three spec files' Configuration Helper interactions; every other assertion in each file, and all production code, is untouched.

## Notes

UNDERDETERMINED, from the specification — no criterion constrains how the operations these rewritten specs choose from state their methods, so nothing here excludes stubbing the Select's entries with the OpenAPI document's own lower-case path-item keys, which rules/integration/an-openapi-operations-method-is-upper-cased refuses. That rule is not implemented by this task (see the epic's uncovered) — its casing is already delivered and tested by the sibling task operation-choice-fields, so any fixture this task stubs should reuse upper-cased method values consistent with that delivery rather than assert casing itself.
REMAINDER, from the specification — two clauses of rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing's statement reach no criterion here: that the helper offers every operation the document declares once its link is fetched and parses, and that the draft request names the chosen pair's own path and method. Belongs to: the already-delivered sibling task that built the Configuration Helper's operations Select.
ADVISORY, from the specification — the criteria name a Select as the control the operation is chosen from; rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper states which control carries the choice is form, not a specification fact, so a later change of control would break these three files without any node changing. A seam the specification declines to close, not a contradiction.
ADVISORY, from the specification — domain/integration/openapi-operation, domain/integration/openapi-document-operations and rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper are exercised only incidentally by this task (see the epic's uncovered): they supply the shape the Select offers and the surface the three specs already drive, all delivered before this task, which changes no production behavior.

---
type: invariant
statement: Applying a capability schema draft's input_schema, or its output_schema, writes that text into the Input schema field or the Output schema field respectively of the surface the Schema Helper stands on and registers nothing; over a field the operator has unsubmittedly edited, that write is offered only once the operator confirms it -- stated against what currently stands there -- and is refused until confirmed, that field's content standing exactly as it stood.
constrains:
- domain/integration/capability
---

## Description

The two fields are applied independently: applying input_schema never touches output_schema, and applying output_schema never touches input_schema, so an operator who wants one and not the other takes exactly one act.
This is the same restraint applying-a-drafted-configuration-changes-only-the-local-edit and an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation already hold over the sibling connector configuration draft, read here over two fields rather than one: applying is the operator's own act, and an edit held nowhere else is never silently replaced.
Nothing is registered by applying either field; register-capability remains the one write that changes what is registered, taken only at the operator's own later submission.

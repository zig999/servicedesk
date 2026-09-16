---
target: frontend
title: Drafted capability schema draft stated to the operator
summary: CapabilitySchemaHelperFields now states a drafted outcome's input_schema, output_schema and unresolved items (each by name and by its own reason) beside the helper, sourced from a new capability-schema-draft-disclosure service and its messages module.
task: sha256:6a41243ccaaa9653335c58d9f92e181062c45b93c4d3df7200cc41960b163de5
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-answered-draft-stated-to-the-operator-build
files:
- path: src/routes/capability-schema-helper-fields.tsx
  effect: Added a CapabilitySchemaDraftStatement subcomponent, rendered when state.outcome.kind === 'drafted', that states the draft's input_schema text, output_schema text, and (when non-empty) its unresolved items, each item stated by its name and by the reason-specific label capabilitySchemaDraftDisclosureFrom produced for it; wired inside the existing component's return, after the operations-read aria-live region.
- path: src/services/capability-schema-draft-disclosure.ts
  effect: New service exposing CapabilitySchemaDraftDisclosure/CapabilitySchemaDraftUnresolvedItemDisclosure types and capabilitySchemaDraftDisclosureFrom(draft), which maps a CapabilitySchemaDraft's input_schema, output_schema and unresolved items (each paired with a human-readable reasonLabel) into the shape the fields component renders, unaltered from what the answer carried.
- path: src/services/capability-schema-messages.ts
  effect: New messages module holding the three section labels (input schema, output schema, unresolved) and a reason->label lookup (capabilitySchemaDraftUnresolvedReasonMessage) covering the two enumeration values schema-not-reducible-to-a-type and name-claimed-by-another-parameter, each with a distinct label, falling back to the raw reason string for any value outside that vocabulary.
criteria:
- criterion: Where the outcome is a drafted one, the surface states that answer's input_schema text.
  met: true
  how: CapabilitySchemaDraftStatement always renders a section with disclosure.inputSchema (== draft.input_schema unaltered) whenever it is mounted, and it is only mounted when state.outcome.kind === 'drafted'.
- criterion: Where the outcome is a drafted one, the surface states that answer's output_schema text.
  met: true
  how: The same component always renders a second section with disclosure.outputSchema (== draft.output_schema unaltered), under the same mounting condition.
- criterion: Every unresolved item the answer carried is stated, each by the name that answer gave it.
  met: true
  how: capabilitySchemaDraftDisclosureFrom maps every entry of draft.unresolved (no filtering, no dedup) into a disclosure item carrying its own name; the component lists every one of them.
- criterion: Each stated unresolved item carries the reason the answer named for it.
  met: true
  how: 'Each mapped item carries both the raw reason and a reasonLabel produced by capabilitySchemaDraftUnresolvedReasonMessage(item.reason); the list item renders ''{name}: {reasonLabel}''.'
- criterion: An item whose reason is schema-not-reducible-to-a-type is stated apart from an item whose reason is name-claimed-by-another-parameter, neither read as the other and neither collapsed into a single undifferentiated reason.
  met: true
  how: The reason-message lookup table gives the two enum values two distinct sentences, so the rendered reasonLabel differs by reason and never collapses to one shared text.
- criterion: Where the answer carries one name under both reasons, both items are stated, each under its own reason.
  met: true
  how: The unresolved list is keyed by '{name}:{reason}' and rendered via a plain .map over every array entry, so two entries sharing a name but differing in reason both render as separate list items, each with its own reasonLabel.
- criterion: The surface states no unresolved name the answer did not carry.
  met: true
  how: capabilitySchemaDraftDisclosureFrom only ever maps names present in draft.unresolved; nothing else is added to the list.
- criterion: The surface states no unresolved reason the answer did not carry for the item it is stated against.
  met: true
  how: Each item's reasonLabel is derived solely from that same item's own item.reason; no reason is attached across items.
- criterion: Where the answer carried no unresolved item, no unresolved name and no reason stands stated.
  met: true
  how: The unresolved section (heading and list) is rendered only under disclosure.unresolved.length > 0; an empty array renders neither the label nor any list item.
nodes:
- node: rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/routes/capability-schema-helper-fields.tsx
  - src/services/capability-schema-draft-disclosure.ts
  - src/services/capability-schema-messages.ts
  how: The invariant's own scope for this draft (input_schema, output_schema, and every unresolved item by name and by reason, stating nothing the answer did not carry) is answered exactly by CapabilitySchemaDraftStatement together with the disclosure service.
- node: domain/integration/capability-schema-draft
  encoded_at:
  - src/services/capability-schema-draft-disclosure.ts
  how: capabilitySchemaDraftDisclosureFrom reads exactly the three attributes the value-object declares (input_schema, output_schema, unresolved) and nothing else, carrying input_schema/output_schema through unaltered.
- node: domain/integration/capability-schema-draft-unresolved-item
  encoded_at:
  - src/services/capability-schema-draft-disclosure.ts
  - src/routes/capability-schema-helper-fields.tsx
  how: Each unresolved item is carried and rendered by its own name and its own reason, one pairing per item, matching the value-object's two required attributes.
- node: domain/integration/capability-schema-draft-unresolved-reason
  encoded_at:
  - src/services/capability-schema-messages.ts
  how: capabilitySchemaDraftUnresolvedReasonMessage's lookup table covers exactly the enumeration's two closed values (schema-not-reducible-to-a-type, name-claimed-by-another-parameter) with a distinct label each, and falls back to the raw string for anything outside that vocabulary rather than inventing a third label.
inferences:
- inferred: The drafted statement is rendered inside CapabilitySchemaHelperFields itself (the surface already holding the Schema Helper), not as a separate screen or dialog.
  from: The launching task's own framing together with rules/integration/a-capability-authoring-surface-offers-a-schema-helper's statement that the helper is never a separate screen or dialog, and the sibling reference connector-configuration-helper-fields.tsx's convention of stating a drafted outcome inside the helper's own fields component.
- inferred: The Portuguese label text for the two schema sections, the unresolved section heading, and the two reason sentences.
  from: No node states operator-facing copy for this draft; connector-configuration-messages.ts's own UNRESOLVED_REASON_MESSAGES table and DRAFT_DISCLOSURE_* labels are the project's established convention for exactly this situation, so new copy was written in the same register rather than left unstated.
- inferred: input_schema and output_schema are rendered as their raw, unaltered text (in a <pre>, monospace, whitespace-preserving block) rather than reformatted or pretty-printed.
  from: The task's own restatement that the surface 'states nothing the answer did not carry,' and the sibling reference's identical treatment of draft.configuration (rendered raw in a <pre> with no reformatting) in connector-configuration-helper-fields.tsx.
preserved:
- CapabilitySchemaHelperFieldsProps' existing public shape and every currently-rendered element (link input, operation Select, request button, operations-read disclosure region) are unchanged; the new statement is additive, appended after them.
- useCapabilitySchemaHelper and use-draft-capability-schema-from-openapi.ts are untouched; the new rendering reads only the already-exposed state.outcome discriminated union, writing into no field of the form.
---

## What it is

What the operator reads when the operation answers with a draft: the two schema texts and the disclosure of everything the draft could not honestly resolve, stated beside the Schema Helper.

## Notes

None.

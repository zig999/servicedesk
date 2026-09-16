---
target: frontend
title: Answered draft stated to the operator -- proof
summary: Component-level tests over CapabilitySchemaHelperFields prove every criterion of a drafted outcome's statement (both schema texts, every unresolved item by name and by its own reason, apart by reason, nothing beyond what the answer carried), and service-level tests over capability-schema-draft-disclosure.ts and capability-schema-messages.ts decide the three domain nodes' facts whole.
implementation: sha256:5d939e954e6b21a348145cf398bf360f8af1930ad1dcbea618979ffe708a1909
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-answered-draft-stated-to-the-operator-suite
tests:
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- a drafted answer's whole draft is stated (criteria 1, 2, 3, 4, 5, 6, 7, 8) > renders both schema texts verbatim and exactly the three unresolved items the answer carried, each labeled under its own reason
  proves: Criteria 1, 2, 3, 4, 5, 6, 7, 8 together -- a drafted outcome's surface states the answer's own input_schema and output_schema text, states every unresolved item the answer carried by the name it gave it, pairs each with a non-empty reason-specific label, gives an item held under the name-claimed-by-another-parameter reason the same label another item under that same reason gets while differing from an item under schema-not-reducible-to-a-type sharing its name, and states no more and no fewer items than the answer carried.
  fails_when: either schema text is missing or altered from the answer's own text, the rendered list of unresolved items omits one the answer carried, includes an item the answer did not carry, deduplicates the name repeated under both reasons into a single item, gives two items with the same reason two different labels, or gives two items with different reasons the same label.
  demonstrates: rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- an answer carrying no unresolved item states none (criterion 9) > renders no unresolved list item when the answer's unresolved list is empty
  proves: Criterion 9 -- where the answer carried no unresolved item, no unresolved name and no reason stands stated.
  fails_when: any unresolved list item renders on a drafted outcome whose answer carried an empty unresolved list.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftDisclosureFrom -- the draft's input_schema and output_schema are carried through unaltered, and the disclosure holds exactly the draft's three declared attributes > returns inputSchema and outputSchema equal, character for character, to the draft's own fields, and no key beyond inputSchema, outputSchema and unresolved
  proves: domain/integration/capability-schema-draft's fact whole -- the disclosure reads exactly the value-object's three declared attributes (input_schema, output_schema, unresolved), carrying the two schema strings through unaltered and adding no fourth field.
  fails_when: inputSchema or outputSchema differs from the draft's own field, or the returned disclosure object carries a key beyond inputSchema, outputSchema and unresolved.
  demonstrates: domain/integration/capability-schema-draft
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftDisclosureFrom -- an empty unresolved list is carried through as an empty list, inventing no item > returns an empty unresolved array for a draft carrying none
  proves: domain/integration/capability-schema-draft's unresolved attribute stays an array, never undefined or fabricated, at the empty-collection boundary.
  fails_when: an empty unresolved input maps to anything other than an empty array -- undefined, null, or a fabricated entry.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftDisclosureFrom -- every unresolved entry is mapped one-to-one, each disclosure item carrying that same entry's own name and reason unaltered > maps every unresolved entry in order, preserving each one's own name and reason and adding nothing beyond a reasonLabel
  proves: domain/integration/capability-schema-draft-unresolved-item's fact whole -- each disclosure item carries exactly the value-object's two declared attributes (name, reason), taken unaltered from its own source entry, plus the computed reasonLabel and nothing else.
  fails_when: a mapped item's name or reason differs from the entry it was mapped from, an entry is dropped or reordered, or a mapped item carries a field beyond name, reason and reasonLabel.
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/services/capability-schema-messages.spec.ts
  name: capabilitySchemaDraftUnresolvedReasonMessage -- the enumeration's two closed values each get their own distinct, non-empty label, and a reason outside that vocabulary falls back to itself unchanged > gives schema-not-reducible-to-a-type and name-claimed-by-another-parameter two distinct, non-empty labels, and returns a value outside the two-value vocabulary unchanged
  proves: domain/integration/capability-schema-draft-unresolved-reason's fact whole -- the closed two-value enumeration is covered exactly, each value with its own distinct label, and any value outside it is never given one of those two labels.
  fails_when: the two enumerated reasons produce the same label, either produces an empty label, or a reason outside the two-value vocabulary is altered rather than returned unchanged.
  demonstrates: domain/integration/capability-schema-draft-unresolved-reason
not_applicable:
- edge_case: The outcome is idle, pending, or one of the refused kinds (openapi-document-not-fetched, openapi-document-not-readable, openapi-operation-not-found, unrecognized-failure) rather than drafted.
  why: Every criterion of this task conditions on 'the outcome is a drafted one'; this task's own REMAINDER notes exclude the refused-outcome rule entirely, and the outcome's own classification into those kinds is already decided by the prior task's own hook tests.
- edge_case: Two unresolved items sharing both the same name and the same reason (an exact duplicate entry).
  why: No criterion or node this task implements states dedup behavior for an exact duplicate entry; resolving a genuine name collision is the already-delivered backend rule a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order.
- edge_case: Malformed or non-JSON content inside input_schema or output_schema text.
  why: Criteria 1 and 2 require only that the answer's own text is stated verbatim; no criterion or node validates, parses, or reformats its content.
untested:
- The exact Portuguese wording chosen for the two schema-section labels, the unresolved-section heading, and the two reason sentences is the implementation's own recorded inference; no test here pins that literal text, and tests instead check content and distinctness without asserting the words used.
- The implementation's choice to render input_schema and output_schema inside a <pre>, monospace, whitespace-preserving block rather than some other presentation is the implementation's own recorded inference about arrangement; tests here assert only that the exact given text is present on the surface, never the element or styling used to show it.
- 'UNDERDETERMINED, from the specification -- no criterion locates where the draft is stated, and every criterion says only ''the surface'', which any surface satisfies: this entry names no concrete alternative implementation to test against. The implementation''s own placement of the statement inside CapabilitySchemaHelperFields itself is an inference about arrangement, and is not pinned by any test here.'
---

## What it is

Component-level tests proving CapabilitySchemaHelperFields states a drafted outcome's whole draft (both schemas, every unresolved item by name and reason), and service-level tests deciding domain/integration/capability-schema-draft, domain/integration/capability-schema-draft-unresolved-item and domain/integration/capability-schema-draft-unresolved-reason's own facts whole.

## Notes

None.

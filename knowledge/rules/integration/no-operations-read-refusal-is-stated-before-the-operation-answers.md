---
type: invariant
statement: >-
  No refusal a-refused-operations-read-states-its-refusal-to-the-operator states is stated of an
  operations-read request the operation has not answered.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

The same bound `no-draft-refusal-is-stated-before-the-operation-answers` puts on the sibling call's refusals and `a-registration-outcome-is-never-stated-before-the-registry-answers` puts on a submission's two outcomes: a refusal stated before an answer arrives is a refusal invented by the surface. `a-refused-operations-read-states-its-refusal-to-the-operator` states which refusals reach the operator and what each of them tells them, and says nothing about when one may be stated.

The hazard is this call's own. `a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing` leaves the operator no way to name an operation but from the listing this read produces, so a refusal stated while the read is still outstanding sends them to correct a link or a document nothing has yet found fault with — to retype a link that was answering, or to abandon the helper and author the Configuration field by hand — and a read that then answers with operations answers into a surface already saying none were listed.

The sibling rule is written over `draft-connector-configuration-from-openapi` and, by its own text, reaches no further, so the bound is stated here for `read-openapi-document-operations` rather than by widening a standing decision. Home is a new invariant over `domain/integration/openapi-document-operations`, the element `a-refused-operations-read-states-its-refusal-to-the-operator` itself constrains: the api contract cannot declare a presentation, and the element declares what a fetched document's operations are rather than what a surface states about reading them.

It adds no attribute to that element, publishes no operation and refuses no call, and it does not decide what that surface states while an operations read is outstanding. Which control carries a refusal, its wording and its placement stay the interface's own, as every other surface rule here leaves them.

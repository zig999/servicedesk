---
type: invariant
statement: >-
  A surface offering an operator entry of a connector configuration states, at that entry, that
  what is entered is a JSON object; that the HTTP connector reads its method, address, statusMap
  and responseMap and reads a query, headers and a body where it declares them; and that a
  placeholder is written as ${subject:<attribute-name>}, ${requester} or ${credential:<name>} —
  each of those claims one
  an-http-connector-configuration-declares-its-method-and-status-vocabulary,
  an-http-connector-configuration-declares-its-call or
  a-connector-configuration-placeholder-is-written-in-one-of-three-forms already holds, the entry
  stating no further claim and refusing nothing.
constrains:
  - domain/integration/connector-configuration
---

## Description

A connector configuration is opaque text an operator authors directly, and the keys it must carry are stated by rules the operator authoring it has not read; an entry that says nothing leaves them to learn the keys from a collection that ended unavailable.
The statement is bounded to what three rules already hold and carries no example of its own, for the reason an-output-schema-entry-states-what-the-system-reads-from-it and an-output-schema-entrys-statement-carries-no-sixth-claim give for the sibling registry's entry: guidance drawn from the nodes that hold a fact is not a second home for it, and a screen carrying its own worked example would be.

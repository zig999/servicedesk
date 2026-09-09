---
type: invariant
statement: >-
  The security schemes an operation of a fetched OpenAPI 3.x document requires are the schemes
  named by the first requirement object of the security field in effect for that operation —
  the operation's own security field where it declares one, otherwise the document's top-level
  security field — every scheme that one requirement object names and no scheme of any further
  alternative object the same field declares, and no scheme at all where the field in effect is
  an empty array, where that first object names no scheme, or where no security field is
  declared at either level, the draft then generating no credential placeholder and naming no
  security scheme unresolved.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Which security field is in effect, and what an empty array means, is read the way OpenAPI 3.x itself already defines it and not as a preference of this specification's: an operation declaring no security field of its own is governed by the document's top-level field, and an empty array at either level declares that no security is required. Reading either differently would be reading a document other than the one the operator named, the same standing a-connector-configuration-draft-places-each-part-where-the-call-carries-it already gives a path item's parameters and a $ref. The first requirement object is the one read because the objects of a security array are alternative ways to satisfy the same operation — any one of them admits the call — and the first is the only one nameable without a preference the document never states, exactly the reading that same rule already gives the servers array's first entry. Within the object read, every scheme it names is required together rather than alternatively, so all of that object's schemes are read and none of another's. No scheme in effect leaves nothing unresolved: the operation asks for no credential, and naming a security scheme in the unresolved list there would disclose a failure that did not happen.

This is the premise `a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme` and `a-security-scheme-collision-at-one-drafted-key-favors-declared-order` both read from: which schemes are required, and in which order, before either asks what becomes of them.

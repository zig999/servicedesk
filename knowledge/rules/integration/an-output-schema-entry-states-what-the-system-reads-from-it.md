---
type: policy
statement: >-
  A surface offering an operator entry of the output schema a capability registration
  declares states, at that entry, what the system reads out of what is entered there: that
  it is entered as JSON; that the fields it declares are the keys of that schema's own
  top-level `properties` object; that each such key's own `type` and `description`, where
  the schema states them, are read as that field's declared semantics; that no other
  content of the schema is read or validated; and that a `description` entered there
  states what a value means and names no decision. Every claim that statement makes is one
  domain/investigation/field-semantics or
  rules/glossary/a-description-states-meaning-never-policy already holds — the surface
  states no further fact about how the schema is read, carries no worked example of its
  own, and refuses nothing on any of these grounds.
expression: >-
  For an operator on a surface s offering entry of the output_schema a capability
  registration declares — an authoring at an identity nothing is registered at, or an edit
  of the registration a surface read at one, alike — s states, wherever that entry stands:
  that what is entered is JSON; that the field names read from it are the keys of its own
  top-level `properties` object; that such a key's own declared `type` and `description`,
  where the entered schema states them, are read as that field's declared semantics; that
  nothing else in the entered schema is read or validated; and that a `description`
  entered there states what its value means and names no decision the case's own criterion
  or this specification's own rules and scenarios govern. Each of those five claims is the
  statement of domain/investigation/field-semantics or of
  rules/glossary/a-description-states-meaning-never-policy, and s states no sixth claim
  about what an output schema is read for and carries no worked example of its own. s
  refuses no entry and checks no entered content against any of the five: what a
  registration is refused for stays a-capability-declares-its-contract's and
  a-capability-declares-well-formed-schemas' own, and s promises no check neither of them
  performs.
constrains:
  - domain/integration/capability
  - domain/investigation/field-semantics
consistency: eventual
---

## Description

An output schema is the one attribute of a capability registration whose content an operator authors freely and the system later reads structurally rather than storing whole: `domain/investigation/field-semantics` reads one field per key of that schema's own top-level `properties` object, with that key's own `type` and `description` as the field's declared semantics, and reads nothing else in it — "an operator's own hint, never enforced". No node stated whether the operator authoring it learns that at the moment of authoring. Left unstated, the one person whose typing decides what every later citation may name (`a-cited-field-exists-in-the-capability-output-schema`) learns which part of their text is load-bearing only by having a registration come back wrong, or never.

The statement is owed at the entry rather than left out, because nothing else in the system tells the operator this and nothing refuses them for getting it wrong. `a-capability-declares-well-formed-schemas` asks only whether the text parses, and `a-capability-input-schema-holds-a-well-formed-object` records that the output schema's `properties` convention holds "only by an inference this specification discloses, never checked at registration" — so a schema declaring its fields somewhere other than a top-level `properties` object is accepted whole and reads, downstream, as no fields at all. That is silence at a surface, which this specification has refused wherever it has met it: `a-composed-subject-presents-every-case-input-requirement` states an empty requirements read to the composer explicitly rather than leaving an unexplained absence, and `a-submitted-registration-states-its-outcome-to-the-operator` states an outcome the operator could not otherwise infer from the surface they stand on. Here the unstated thing is upstream of both — not what happened, but what the entry is for.

What the statement says is bounded by the two nodes that already hold it, and adds nothing. The distinction between meaning and decision is part of what to enter, not a separate lesson: a `description` is published vocabulary, and `a-description-states-meaning-never-policy` holds that one naming a decision is a second home for a fact the specification places elsewhere — an operator typing it into a schema is exactly how that second home gets made, and the entry is the one place where saying so prevents it rather than reporting it. The surface stating those facts is not itself a home for them: it states them as guidance drawn from the nodes that hold them, which is why it carries no worked example of its own and states no sixth claim — the example illustrating meaning against decision belongs to the node that draws the distinction, and a surface carrying its own would be a fact of the business living in a screen.

Nothing about any element changes and no hint comes into the specification. `domain/knowledge/case-input-requirement`'s standing decision keeps a property's own declared `type` and `description` outside what any element carries — presentation guidance for whoever displays an entry, never part of what the entry states — and this decides only what a surface says to the person doing the entering, carrying no schema content anywhere.

Which control carries the statement, its wording, where it sits beside the entry and how it is presented are form and belong to the interface, exactly as this specification's other surface rules leave them.

Consistency is eventual because the surface holds nothing this statement is true of: it states what is read out of an output schema by a reading that happens elsewhere and later — at collection, into `domain/investigation/field-semantics` — and never at the moment of the entry it stands beside.

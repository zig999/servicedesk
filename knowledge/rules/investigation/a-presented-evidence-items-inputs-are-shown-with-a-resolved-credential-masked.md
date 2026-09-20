---
type: invariant
statement: >-
  An operator-facing surface presenting a collected evidence item shows that item's inputs
  — the serialized inputs the collection was issued with — masking whatever value a
  credential placeholder resolved to within them by putting the fixed text `***REDACTED***`
  in that value's place, the same text for every masked value whichever credential it came
  from and however long the value was, so the operator reads what was asked of the
  capability and never a credential's real value.
constrains:
  - domain/investigation/evidence
---

## Description

An observation read without what was asked for it is half a record: the same operator who can see that a collection returned ok, at which instant and under which semantics cannot tell, from the observation alone, which subject attributes and which arguments the call actually carried, and so cannot tell an honest answer to the wrong question from a wrong answer to the right one. contracts/investigation/case-simulation already faces the whole record at the curator — evidence per concept among it — and rules/investigation/the-customer-sees-only-the-text already fixes that this operational detail faces the operation and not the end customer, so inputs are shown rather than dropped, on the same surface and beside the same item.
What is withheld is one part and only one: a connector's call may embed a placeholder naming a credential the connector reads from environment configuration rather than from any operator-editable text, and rules/integration/an-unreachable-connector-ends-unavailable already records that the resolved call's own text may hold what such a placeholder resolved to. rules/integration/a-diagnostic-response-masks-a-resolved-credential holds exactly that value out of the other read this system offers an operator into a connector's call; a presented evidence item's inputs are the second such read, and they carry the same restraint rather than a second answer to one question.
Masking replaces the resolved value and never the field that held it, so the shape of what was issued stays legible; an item whose inputs carry no credential value is shown whole, and an item recorded with empty inputs shows that emptiness, the same honest degradation the record itself already carries elsewhere.
What stands in the withheld value's place is one fixed text and the same one every time. A rendering that followed the value — its length, its first or last characters, the credential's own name — would hand back in the shape of the mask a part of exactly what the mask exists to withhold, and a rendering an operator cannot tell apart from content would turn an honest withholding into a record read as if the call had carried that literal. `***REDACTED***` is neither: it is not the shape of any credential and not the shape of the `${credential:<name>}` placeholder that rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms admits, so the operator reading inputs sees at once that a value was held back there and which field held it.
rules/integration/a-diagnostic-response-masks-a-resolved-credential fixes that its own read masks and fixes no rendering for it, so the text stated here diverges from no rendering this specification already holds; whether that read's response carries this same text stays that rule's own question, and this rule claims nothing about it.

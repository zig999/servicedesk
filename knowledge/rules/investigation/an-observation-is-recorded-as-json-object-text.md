---
type: invariant
statement: >-
  An evidence item whose result is ok records its observation as JSON object text, and the values it
  carries under the producing capability's output schema field names are reached by parsing that text,
  never by reading it as free text.
constrains:
  - domain/investigation/evidence
---

## Description

The observation attribute is a string because the record carries the payload serialized rather than a shape of its own; this is what that string holds — one JSON object, keyed by the same field names domain/investigation/field-semantics snapshots onto the item that carries it.
Reading such an observation is therefore parsing it: a reader that scans the text instead grounds a value on the text's own punctuation and key names as readily as on what the capability returned, and a judgment or a presentation resting on that is grounded in nothing collected.
rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches decides which of those field names are present at all; this states how the ones present are reached, and the two together are why a citation's field is answerable from the item itself.
The other three endings stand outside this rule, exactly as domain/investigation/evidence-result already holds them: only ok carries a usable observation, and the rest are facts about the attempt.

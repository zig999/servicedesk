---
title: Connector-configuration draft states its status and response maps
summary: The backend work that makes a drafted connector configuration carry a statusMap, a responseMap
  and the disclosure of how both were read from the chosen operation's responses.
rationale: One epic rather than one per layer, because the reader, the generator, the draft type and the
  HTTP answer all answer the same claim — what a draft states about the chosen operation's responses —
  and splitting them would make each half's claim unreconcilable on its own.
sources:
- intake/scope.md
covers:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft-response-field
- domain/integration/connector-configuration-draft-reading-note
- domain/integration/connector-configuration-draft-reading-note-kind
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
- rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
- rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/a-connector-configuration-draft-response-carries-no-capability
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
- rules/integration/a-drafted-connector-configuration-is-answered-as-a-read
- rules/integration/a-connector-configuration-draft-registers-nothing
uncovered:
- node: rules/integration/a-drafted-connector-configuration-is-answered-as-a-read
  why: The answer's status is untouched by this plan; the draft route already answers a generated draft
    with HTTP 200, and only the answer's body grows.
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  why: Draft generation stays a pure function over the fetched document and what is registered; no task
    in this plan adds a write of any kind.
---

## What it is
The backend half of the connector-configuration-draft change: reading the chosen operation's responses, drafting the two maps from them, carrying the disclosure material on the draft, and answering it over HTTP.
It also holds the one task that answers for a fact the specification newly enunciates about an observation's fields and the code already implements.

## Notes
The Configuration Helper screen, its readiness panel and its pt-BR messages are the frontend target's and are claimed by no part of this epic.
The draft-generation rules this change does not touch — subject placeholders, generated credentials, the method comparison, the refusals — are read-only context here, and no task of this epic answers for them.
a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs entered covers after an unstated-fact decision extended it to read a $ref-referenced response through, rather than adding a new node; grown in, not read-only, since the task reading the operation's responses now implements it.

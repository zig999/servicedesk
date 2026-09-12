---
type: invariant
statement: >-
  A connector configuration draft's configuration declares a responseMap holding, for each
  response field a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  reads from a success response schema of the chosen operation — a success response schema being
  the schema a response keyed by a numeric status from 200 through 299 declares under the media
  type application/json and no other, read through its $refs, with the parts of an allOf merged
  into one properties object and the variants of a oneOf or an anyOf united into one — exactly one
  entry keyed by the field's own name and holding the path to it, a name read under differing
  paths from more than one success response schema holding the path read from the lowest status,
  that entry's disclosed response field carrying as the success status it was read from the lowest
  of the success statuses whose schema declares the field at the drafted path and carrying as its
  declared type and its required listing the ones that same schema declares, however differently
  another success response schema declaring the field at that path declares either of them, and an
  operation from which no such field is read drafted with an empty responseMap object and never
  without one.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The document names the fields a success response carries and the path to each; it never names which of them a capability reads or under what name, so the draft keys every field by its own name and leaves the choice of which to keep and what to rename to the operator, who reads which capability fields those keys reach through a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads.
Every success response schema contributes, rather than the lowest one alone, because a field one status carries and another does not is still a field the operation answers with, and the draft exists to hand the operator the most the document states.
A field several success statuses declare at one path is disclosed under the lowest of them, the same status whose reading is kept where the paths differ, so the status a response field carries is always the lowest success status the drafted path was read from and the operator reads one status against one path rather than a status chosen by a second reading.
The type and the required listing are read from that same lowest status's schema, so an operator reads one status, one path and one account of the field together, rather than an account assembled from schemas the disclosed status does not name.
application/json is the one media type read for the same reason a-connector-configuration-drafts-request-body-fields-are-its-json-schemas-top-level-properties reads it alone for the request body: the body an observation parses is JSON, and a content object's entries are alternative encodings with no first among them.
The responseMap is drafted even where it holds no entry because a configuration lacking one ends an observation unavailable before any call is issued.

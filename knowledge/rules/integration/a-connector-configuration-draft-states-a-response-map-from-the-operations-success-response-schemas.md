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
  and an operation from which no such field is read drafted with an empty responseMap object and
  never without one.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The document names the fields a success response carries and the path to each; it never names which of them a capability reads or under what name, so the draft keys every field by its own name and leaves the choice of which to keep and what to rename to the operator, who reads which capability fields those keys reach through a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads.
Every success response schema contributes, rather than the lowest one alone, because a field one status carries and another does not is still a field the operation answers with, and the draft exists to hand the operator the most the document states.
application/json is the one media type read for the same reason a-connector-configuration-drafts-request-body-fields-are-its-json-schemas-top-level-properties reads it alone for the request body: the body an observation parses is JSON, and a content object's entries are alternative encodings with no first among them.
The responseMap is drafted even where it holds no entry because a configuration lacking one ends an observation unavailable before any call is issued.

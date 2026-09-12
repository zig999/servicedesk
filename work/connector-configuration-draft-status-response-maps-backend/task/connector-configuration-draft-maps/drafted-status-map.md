---
title: Draft the statusMap and disclose each status
summary: The generator's always-present statusMap and the status readings that pair each drafted entry
  with the document's own description.
rationale: The map entry and its disclosure are cut as one task because each drafted entry yields exactly
  one reading from the same act of reading a status, and separating them would split one derivation across
  two deliverables.
sources:
- intake/scope.md
objective: The drafted configuration text holds a statusMap whose entries are exactly the numeric statuses
  the chosen operation declares, each under the ending a fixed reading of the status gives it, and the
  draft carries one status reading per entry.
criteria:
- The drafted configuration object holds a statusMap key for every operation, including one declaring
  no responses, where it holds an empty object.
- A numeric status from 200 through 299 is drafted with ending ok.
- The statuses 401, 403 and 407 are drafted with ending denied.
- A numeric status outside 200 through 299 and other than 401, 403 and 407 is drafted with ending unavailable.
- No declared status is drafted with ending timeout.
- A response keyed default produces no statusMap entry.
- A response keyed by a range such as 2XX produces no statusMap entry.
- The draft carries exactly one status reading per drafted statusMap entry, holding that entry's status
  and ending.
- A status reading carries the description the document declares for that response, and carries none where
  the document declares none.
depends_on:
- task/connector-configuration-draft-maps/openapi-responses-reading
- task/connector-configuration-draft-maps/draft-disclosure-type
implements:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-status-reading
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
---


## What it is
The statusMap half of what draftedConfigurationText emits, with its disclosure.

## Notes
The inventory records that the drafted object literal never emits statusMap today and that the two new keys are always emitted, never conditionally.
UNDERDETERMINED, from the specification — No criterion demonstrates that a purely numeric responses key outside 100 through 599 (such as 42 or 600) produces no statusMap entry — the rule now states this explicitly, but nothing here tests it. Add a criterion.
UNDERDETERMINED, from the specification — No criterion covers a response declared as a $ref to a reusable response object (components/responses) — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs now requires such a response be read through before its description is read. Add a criterion.
REMAINDER, from the specification — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs is implemented here only for its response-$ref-and-description clause; its path-item-parameter-merge and parameter/request-body/security-scheme $ref clauses belong to the task drafting the call's address, query, headers and body.
REMAINDER, from the specification — a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits — the default-response-not-drafted and status-range-not-drafted disclosure — reaches no criterion of this task, as this rule's own Description defers it there explicitly.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas and a-success-response-schemas-single-object-property-is-read-through-as-its-envelope reach no criterion of this task, which names the statusMap and status readings only.
REMAINDER, from the specification — an-observation-carries-only-the-output-schema-fields-its-response-map-reaches (runtime observation) and a-connector-configuration-draft-response-carries-no-capability (the answer's shape) reach no criterion of this task.
ADVISORY, from the specification — The one-status-reading-per-drafted-entry criterion is backed only by the two elements' own Description prose, not by an explicit rule statement — unlike the reading-notes rule, which states its one-note-per-pairing cardinality directly. Consider whether the statusMap rule's own statement should carry this cardinality explicitly.

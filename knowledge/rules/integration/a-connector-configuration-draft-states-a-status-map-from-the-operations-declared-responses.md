---
type: invariant
statement: >-
  A connector configuration draft's configuration declares a statusMap holding exactly one entry
  for each key of the chosen operation's responses object that is a numeric HTTP status code, a
  key written as a three-digit decimal number from 100 through 599, and no entry for any other
  key, a purely numeric key outside that range included — the entry's ending ok for a status from
  200 through 299, denied for the statuses 401, 403 and 407, and unavailable for every other
  numeric status — so that an operation declaring no numeric status key is drafted with an empty
  statusMap object and never without one.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The document names which statuses the operation answers with and never names which of this system's four endings a status means, so the draft chooses each ending by a fixed reading of the status alone and discloses the choice beside the document's own description of that status in its status_readings, for the operator to keep or change.
A denial is read only from the three statuses that name an authentication or authorization refusal, because every other status an observation meets unclassified already ends it unavailable under an-unclassified-status-ends-unavailable, so drafting those as unavailable states the ending they would take rather than changing it.
No declared status is drafted as timeout, an ending that names a call the connector never received an answer to.
The three-digit bound is the whole of the space an observation's own status can fall in, so a key outside it names no status a call could ever answer with.
The statusMap is drafted even where it holds no entry because a configuration lacking one ends an observation unavailable before any call is issued.
Which of the keys that are not numeric statuses the operator is told about, and under what condition, is a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits's own.

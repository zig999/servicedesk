---
type: invariant
statement: Where the Configuration field of an authoring or editing surface already holds an edit the operator has not submitted, applying a connector configuration draft to it is performed only where the operator, in a further explicit act, confirms that the unsubmitted edit is to be replaced; where the operator does not so confirm, the field's content stands exactly as it was.
constrains:
  - domain/integration/connector-configuration
---

## Description

An applied draft is total over the Configuration field, the same replace-whole an edit typed by hand already is, so applying one over an edit the operator already made would destroy content held nowhere else — the same hazard a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface already answers for a discard with a further explicit act, held to here for the same reason: a costly act this specification refuses to infer from a first gesture alone.

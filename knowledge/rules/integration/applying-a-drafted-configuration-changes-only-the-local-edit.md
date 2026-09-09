---
type: invariant
statement: Applying a connector configuration draft to the Configuration field of an authoring or editing surface replaces only that field's own local, unsubmitted content; it issues no register-connector call, and every connector configuration currently registered stands exactly as it stood.
constrains:
  - domain/integration/connector-configuration
---

## Description

A draft is generated for review, and applying it is the operator carrying that review into the field they are already editing — the same field register-connector submits from and a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface already returns to its last-read content. Applying it registers nothing on its own account, the same restraint a-connector-configuration-draft-registers-nothing already holds for generating one; the operator still reviews the applied text and still submits it, or does not, exactly as they would an edit typed by hand.

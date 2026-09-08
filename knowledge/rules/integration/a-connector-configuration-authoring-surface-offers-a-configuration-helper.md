---
type: invariant
statement: A surface authoring or editing a connector configuration offers, beneath its Configuration field, a Configuration Helper through which an operator names an OpenAPI document link and one of its operations and requests a connector configuration draft generated from it; requesting a draft issues no register-connector call.
constrains:
  - domain/integration/connector-configuration
---

## Description

The helper lives inside the one surface an operator already authors or edits a connector configuration from, never a separate screen or a dialog of its own — the same surface a-connector-configuration-authoring-may-be-abandoned-without-registering and a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface already govern. Offering it is a fact about what the operator can do there; which control carries it, its wording and where exactly it sits beneath the Configuration field are form and belong to the interface, not here.

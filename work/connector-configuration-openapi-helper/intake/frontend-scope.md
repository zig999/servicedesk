Deliver the frontend half of the connector-configuration-openapi-draft capability specified in
knowledge/ under the integration context: the Configuration Helper section on the existing
connector configuration authoring/editing surface, covering the three surface rules left
uncovered by the backend-half plan
(a-connector-configuration-authoring-surface-offers-a-configuration-helper,
applying-a-drafted-configuration-changes-only-the-local-edit,
an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation) and their grounding
scenario (applying-a-draft-over-an-unsaved-edit-asks-for-confirmation).

The section sits inline in ConnectorConfigurationFormFields, beneath the existing Configuration
field, on both the create-screen and the detail-ready-view. It calls the backend's published
draft-connector-configuration-from-openapi operation (delivered by the backend-half initiative:
task/connector-configuration-openapi-draft-backend/draft-operation-http-surface) with an OpenAPI
document link, an operation, and reads back a connector-configuration-draft (configuration text,
unresolved list, generated credentials, method mismatch). Applying the draft writes only the
Configuration field's own local, unsubmitted React Hook Form state -- never a register-connector
call. The section itself issues no register-connector call either. Where the Configuration field
already holds an edit the operator has not submitted, applying a draft requires the operator's own
further explicit confirmation before overwriting it, in the same dialog pattern the existing
"Discard changes" affordance already uses.

Out of scope: everything the backend-half plan already covers (the operation itself, its
refusals, and how a draft's content is resolved) -- this scope only consumes that operation and
renders/applies its answer.

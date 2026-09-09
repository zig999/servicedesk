Deliver the backend half of the connector-configuration-openapi-draft capability specified in
knowledge/ under the integration context: the new domain elements (connector-configuration-draft
and its three nested value objects), the 10 new rules governing fetch/parse refusal, exact-match
subject-placeholder resolution against a registered capability (capability optional),
credential-placeholder generation for reducible security schemes, never inventing responseMap or
statusMap, and method comparison against the currently registered connector configuration, plus
the new published api contract contracts/integration/connector-configuration-draft (operation
draft-connector-configuration-from-openapi) and the architecture constraint that the OpenAPI
document is fetched by the backend.

Out of scope: the frontend Configuration Helper surface (rules
a-connector-configuration-authoring-surface-offers-a-configuration-helper,
applying-a-drafted-configuration-changes-only-the-local-edit,
an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation) — that is a separate,
later initiative once this backend operation exists.

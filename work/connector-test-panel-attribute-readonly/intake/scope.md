# Corrective increment ask

The human's own words: "quando clicar em ADD ATTRIBUTE, os atributos adicionados vem em campo do
tipo input, não podem ser editáveis, apenas value é editável."

Observed on the Connector Test Panel (`ConnectorTestPanelFields`,
`src/routes/connector-test-panel-fields.tsx`), reached from the connector configuration edit
screen (`/connectors/$connector`).

## Wrong behavior in already-delivered code

Each attribute row's "Attribute" field renders as an editable `Input`
(`connector-test-panel-fields.tsx`, the row's first `Input`), letting the operator type an
arbitrary attribute name. The attribute name is already governed by the specification and by an
already-delivered feature (the closed initiative
`connector-test-panel-placeholder-attributes`, task `reconcile-test-panel-attribute-rows`):
`useTestConnectorPanel`'s `onAddAttribute` reconciles the rows against the subject-attribute
placeholders parsed out of Configuration's own text — the name is derived, never operator-typed.

## The fix

The Attribute field must stop being editable (render read-only, still styled as an input) while
the Value field stays editable exactly as today.

No new domain fact — the derivation rule is already specified and already implemented in the
reconciliation logic; only the UI incorrectly allows editing a field it should not.

# Scope

Extend the existing routed detail/edit screen pattern to the creation path, for both Connector
Configurations and Capabilities, replacing their popup-dialog "New ..." creation flow with a
full-page screen just like the existing edit screen.

## The human's own words (translated from Portuguese)

"Na tela http://localhost:5173/connectors, ao clicar no botão 'New connector configuration',
abre-se um panel no estilo pop up para preencher o nome e configuration. O comportamento
esperado é uma janela igual a de edição: http://localhost:5173/connectors/ifs-fsm-tech-profile-connector."

And, symmetrically:

"Na tela http://localhost:5173/capabilities, ao clicar no botão 'New Capability', abre-se um
panel no estilo pop up para preencher os dados da capability. O comportamento esperado é uma
janela igual a de edição: http://localhost:5173/capabilities/perfil-mobile-tecnico-reader/1.0.0."

## Context established by prior investigation

`route-tree.tsx` and its two edit routes ("/connectors/$connector" -> ConnectorConfigurationDetailScreen,
"/capabilities/$name/$version" -> CapabilityDetailScreen) were added by
task/connector-capability-detail-editing/{connector-configuration-detail-route,capability-detail-route},
whose own header comments state the popup Dialog's "New connector configuration" / "New capability"
creation path was deliberately left untouched at the time: "the popup Dialog's own 'New connector
configuration' creation path is untouched, still hosted on connectorConfigurationsRoute above" (and
the same wording for capability). Both detail screens are currently edit-only, parametrized by an
existing identity in the URL; they have no create-mode branch today.

This is not a new domain fact -- it reapplies an interaction (a full-page detail-style screen) the
specification and the codebase already established for editing, extending it to creation. Both
registries' own register operations (contracts/integration/connector-configuration-registry,
contracts/integration/capability-registry) are already create-or-replace, undistinguished at the
domain level between "creating" and "editing" -- the create/edit distinction lives only in the UI's
own form state (`ConnectorConfigurationFormTarget`, `CapabilityFormTarget`), which already models it
today for the popup Dialog and is reused, not replaced, by whatever routes creation to a full page.

No layout/mockup is supplied; there is no intake/layout reference for this scope.

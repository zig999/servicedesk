---
entries:
- field: statement
  unstated: No node states the HTTP status or the response body with which a successful removal of a connector configuration by name is answered — contracts/integration/connector-configuration-registry declares remove-connector and the api contract class declares no responses, domain/integration/connector- configuration-registry names the operation as its responsibility only, and rules/integration/removing-a- connector-configuration-is-unconditional states that both branches of the removal are answered alike without naming what that answer is.
  found: 'work/delete-routes-connector-capability-concept/intake/scope.md: "Each follows the same shape the existing discard (case version) and remove-hypothesis routes already establish in this codebase: an HTTP DELETE, 204 on success..." — "Each" covering the three removals that section lists, remove-connector among them; restated under "Convenções a seguir" as "Verbo HTTP DELETE, resposta 204 no sucesso". A 204 carries no body, so the status the material names states the body too.'
---

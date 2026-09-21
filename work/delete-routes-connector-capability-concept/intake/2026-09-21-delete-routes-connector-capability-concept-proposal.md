# Novas rotas de exclusão: ConnectorConfiguration, Capability, Concept

Material para `/analyse`. Escrito em 2026-09-21, a partir da leitura de `knowledge/` (autoridade),
`src/migrations/` e `src/src/`. Ver levantamento estrutural completo em
[`relacao-case-hypothesis-concept-capability-connector.md`](./relacao-case-hypothesis-concept-capability-connector.md)
(2026-09-09, verificado contra o código) — este documento não repete aquela cadeia, só a referencia.

## Estado atual

Hoje só duas entidades têm exclusão: `CaseVersion` (`discard`, `only-a-draft-case-version-may-be-discarded`)
e `Hypothesis`/manifesto (`removeHypothesis`, recusa esvaziar o manifesto). As rotas de
`ConnectorConfiguration`, `Capability` e `Concept` só expõem `PUT` (registro/substituição integral) e
`GET` — nenhuma tem `DELETE`. Confirmado em `src/src/http/register-connector.routes.ts`,
`register-capability.routes.ts`, `register-concept.routes.ts` (só `app.put`).

## O que o schema relacional já decide

Nenhuma FK aponta para `connector_configurations` (`migrations/0008`). `capabilities.connector` é
`TEXT` sem FK — o domain model já declara essa frouxidão de propósito
(`domain/integration/connector-configuration.md`: "nothing enforces that the name resolves to a
configuration that exists").

FKs que apontam para `concepts.name` (sem `ON DELETE CASCADE`, portanto `RESTRICT` por padrão):
`capabilities.concept` (`0007`), `hypotheses.concept_name` e `hypothesis_revisions.concept_name`
(`0004`/`0009`), `investigation_evaluations.concept` e `investigation_evidence.concept` (`0005`),
`concept_accepts.concept_name` (`0002`).

FK que aponta para `capabilities (name, version)`: só `investigation_evidence.capability_name,
capability_version` (`0005`). Nenhum vínculo persistido de case/hypothesis para capability — os
requisitos de entrada são derivados a cada leitura (`case-input-requirements.ts`), nunca armazenados.

## Decisões fechadas com o usuário em 2026-09-21

1. **`DELETE /v1/connectors/:connector` é incondicional.** Nenhuma checagem de uso. Consistente com o
   vínculo já frouxo por design; uma capability deixada apontando para um connector removido degrada
   pela regra já existente `rules/integration/an-unresolvable-observation-ends-unavailable`, o mesmo
   caminho que hoje trata uma capability registrada antes do connector existir.

2. **`DELETE /v1/glossary/concepts/:name` recusa quando o concept está em uso, vivo ou histórico.**
   Recusa se: alguma `Capability` o responde (`capability.concept`); alguma `Hypothesis`/
   `HypothesisRevision`, de qualquer `CaseVersion`, o coleta (`concept_name` em `hypotheses` ou
   `hypothesis_revisions`/`hypothesis_revision_collects`); ou alguma `Evidence`/`Evaluation` de
   investigação já registrada o cita. Espelha as FKs reais — sem isso a exclusão bateria direto na
   constraint do banco como erro cru (violação de FK, sem tipo de domínio, sem status HTTP mapeado).

3. **`DELETE /v1/capabilities/:name/:version` recusa quando citada em evidência histórica.** Único
   vínculo real no schema é `investigation_evidence(capability_name, capability_version)`. Mesmo
   espírito de `only-a-draft-case-version-may-be-discarded`: nunca apagar o que uma investigação já
   usou. Nenhuma checagem viva é necessária (nada mais referencia capability por FK ou por campo
   armazenado).

## Convenções a seguir (para consistência com o que já existe)

- Nomenclatura de erro de "em uso": seguir o padrão `ConceptAlreadyAnsweredError`,
  `ManifestWouldHoldNoHypothesisError`, `CaseVersionNotDraftError` — um erro nomeado por entidade e
  motivo, não um genérico `EntityInUseError`.
- Verbo HTTP `DELETE`, resposta `204` no sucesso, mapeamento de erro em `status-map.ts` (mesmo lugar
  que já mapeia os erros de `discard`/`removeHypothesis`).
- Rota, controller, DTO e operation seguindo a mesma separação de arquivos que `discard.*` e
  `remove-hypothesis.*` já usam.

## Fora de escopo deste material

- Qualquer control de UI (botão de excluir, diálogo de confirmação) nas telas de conector, capability
  e glossário — isso é decisão de `/plan-work` sobre a superfície, não fato de domínio.
- Mudar o schema para adicionar `ON DELETE CASCADE` em qualquer FK existente — as decisões acima
  assumem `RESTRICT` continua sendo o comportamento correto (perder histórico de investigação nunca é
  aceitável neste domínio, conforme `only-a-draft-case-version-may-be-discarded`).

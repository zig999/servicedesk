---
title: writeCapabilities upserta por identidade, sem apagar a tabela inteira
summary: Corrige RelationalCapabilityStore.writeCapabilities para não fazer DELETE
  sem filtro na tabela capabilities, permitindo salvar qualquer capability mesmo quando
  outra linha já tem evidência associada.
objective: PUT /v1/capabilities/:name/:version cria ou substitui a capability na identidade
  dada sem falhar quando qualquer linha de capabilities é referenciada por investigation_evidence.
criteria:
- PUT /v1/capabilities/perfil-mobile-tecnico-reader/1.0.0 com um input_schema alterado,
  contra um banco onde essa identidade já tem ao menos uma linha em investigation_evidence
  citando-a, responde 200 com a capability atualizada, nunca 500.
- Registrar uma capability em uma identidade (name, version) nova sucede mesmo quando
  outra capability já registrada está referenciada por investigation_evidence.
- Uma linha de capabilities referenciada por investigation_evidence nunca é apagada
  como efeito colateral de escrever uma capability de identidade diferente.
- Nenhuma escrita em capabilities emite mais um DELETE sem filtro de WHERE contra
  a tabela inteira.
implements:
- contracts/integration/capability-registry
- domain/integration/capability
- domain/investigation/evidence
sources:
- intake/scope.md
---

## What it is

A correção do mecanismo de escrita do registry de capabilities: writeCapabilities passa a
fazer upsert escopado por (name, version) em vez de apagar e reinserir a tabela inteira.

## Notes

None.

# Registros que estavam no banco antes de 2026-08-21, lidos antes de serem apagados

O humano autorizou apagar tudo o que já estava no banco `neondb` antes do registro de
`perfil-mobile-tecnico`. Isto é a cópia do que havia, lida do próprio banco imediatamente antes
do `DELETE`, porque dois desses registros carregam mapeamentos do IFS que alguém já fez e que a
árvore não guarda em nenhum outro lugar.

Nada aqui é fonte para nenhum registro futuro sem ser conferido: os dois connectors abaixo
**não resolveriam**, pelo motivo na última seção.

## O que havia — 11 linhas em 6 tabelas

| tabela | linhas |
|---|---|
| `cases` | `device-init-data-loss`, órfã — nenhuma `case_versions`, nenhuma hipótese |
| `subject_types` | `fsm-task`, `fsm-technician` |
| `concepts` | `fsm-task-visit-allocation` (ttl 60), `fsm-technician-access` (ttl 60) |
| `concept_accepts` | `fsm-task-visit-allocation <- fsm-task`, `fsm-technician-access <- fsm-technician` |
| `capabilities` | `task-visit-allocation-reader v1`, `technician-access-reader v1` |
| `connector_configurations` | `ifs-fsm-visit-allocation-connector`, `ifs-fsm-technician-access-connector` |

Não havia **nenhum** outcome, action, recipient ou subject_attribute, e nenhuma versão de caso —
nem a fixture curada `intermittent-connection-outage`. Quem montou isto parou antes de chegar a
um caso executável.

## `get-tech-access` — o mapeamento

Capability `technician-access-reader v1`, read-only, timeout **60000**, concept
`fsm-technician-access` (ttl 60), connector `ifs-fsm-technician-access-connector`.

```json
{ "method": "GET",
  "address": "http://127.0.0.1:8787/v1/technicians/${subject:login-id}/access",
  "statusMap": { "200": "ok", "403": "denied", "503": "unavailable" },
  "responseMap": { "id": "data.id", "active": "data.active",
                   "validTo": "data.validTo", "accessGroups": "data.accessGroups" } }
```

`input_schema`: `userId` — *"opaque login identifier, no validated shape"*.
`output_schema`: `{ id: string, active: boolean, validTo: string, accessGroups: array }`.

## `get-visit-allocations` — o mapeamento

Capability `task-visit-allocation-reader v1`, read-only, timeout **60000**, concept
`fsm-task-visit-allocation` (ttl 60), connector `ifs-fsm-visit-allocation-connector`.

```json
{ "method": "GET",
  "address": "http://127.0.0.1:8787/v1/tasks/${subject:task-id}/visit-allocations",
  "statusMap": { "200": "ok", "400": "denied", "403": "denied", "503": "unavailable" },
  "responseMap": { "visitId": "data.visitId", "datasetId": "data.datasetId",
                   "activityId": "data.activityId", "resourceId": "data.resourceId",
                   "schedulingStatus": "data.schedulingStatus" } }
```

`input_schema`: `taskId` — *"decimal digit string, integer value >= 1"*.
`output_schema`: `{ visitId: integer, schedulingStatus: string, datasetId: string, activityId: string, resourceId: string }`.

## Por que nenhum dos dois funcionaria, e o que isso ensina

**Os atributos de sujeito que os endereços citam nunca foram registrados.** Os placeholders são
`${subject:login-id}` e `${subject:task-id}`; a tabela `subject_attributes` estava **vazia**.
`resolveSubjectPlaceholder` recusa antes de montar a requisição quando o Subject não carrega o
atributo, então as duas chamadas parariam ali — nunca chegaram a sair.

Duas divergências a mais em relação ao registro de hoje, e as duas valem como aviso:

- **`timeout: 60000`** contra `COLLECTION_STAGE_BUDGET_MS = 7_000`. O estágio de coleta trunca
  cada chamada no menor entre o timeout da capability e o teto do estágio, então declarar 60s é
  declarar um número que o motor nunca honra.
- **Nomes de atributo divergentes** para a mesma coisa: `login-id` aqui, `user-id` no registro de
  hoje, e `userId` no `input_schema` de ambos. O vocabulário de `subject-attribute` é global e
  chato de propósito — um nome só. Se `get-tech-access` voltar, volta com `user-id`.

O `statusMap` de ambos também é mais curto que o de hoje: nenhum dos dois mapeia `500`, que é o
status que o IFS devolve quando `unknown-installation-state-fails-the-read` derruba uma leitura
inteira. Sem essa entrada, um 500 cairia no ending padrão (`unavailable`) por omissão em vez de
por decisão.

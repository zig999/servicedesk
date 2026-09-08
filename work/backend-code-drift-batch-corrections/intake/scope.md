# Scope

Correção de 13 divergências entre código e especificação, encontradas pelo reconcile
"backend-code-drift-batch" (siegard-reconcile/backend-code-drift-batch.md e seus retornos em
siegard-reconcile/backend-code-drift-batch.returns/, no repositório
/home/siegfriedneto/projects/servicedeskn1). Cada item corresponde a um achado já registrado
(`kind: contradicts`) — o código é o lado errado em todos; nenhum destes é uma decisão a levar
para a especificação.

## Os 13 achados, por arquivo

1. `src/investigation/investigation.ts` — o tipo `Investigation` declara `written_at?: string`
   (opcional); `domain/investigation/investigation` exige `written_at` obrigatório.

2. `src/case/case-query.service.ts` — `readCaseInputRequirements` nunca roda a mesma checagem
   de coerência que `readCase` roda sobre a mesma versão
   (`rules/knowledge/validation-runs-at-every-read`), então uma versão que `readCase` recusaria
   ainda devolve requisitos de entrada calculados.

3. `src/investigation/judgment-stage.ts` — o arquivo está vinculado no trace ao contrato
   `contracts/integration/capability-registry` mas não implementa nenhuma das quatro operações
   desse contrato.

4. `src/investigation/http-declarative-observation-source.adapter.ts` — a mensagem de recusa
   por método HTTP inválido reescreve "GET, POST, PUT, PATCH, DELETE" como texto literal em vez
   de derivar de `HTTP_METHODS`
   (`rules/integration/an-http-connector-configuration-declares-its-call`).

5. `src/investigation/http-declarative-observation-source.adapter.ts` — a mensagem de recusa
   por `statusMap` inválido reescreve "ok, unavailable, denied, timeout" como texto literal em
   vez de derivar de `EVIDENCE_RESULTS` (`domain/investigation/evidence-result`).

6. `src/persistence/relational-case-store.repository.ts` — `isCaseVersionState` tipa
   `'draft'/'released'` à mão em vez de derivar de uma lista canônica exportada, ao contrário do
   padrão que o próprio arquivo já usa para hypothesis-revision-state
   (`rules/knowledge/a-case-version-moves-through-its-declared-lifecycle`).

7. `src/seed.ts` — os conceitos semeados nunca recebem `description`, que
   `domain/glossary/concept` declara obrigatório.

8. `src/http/dto/simulate-case.dto.ts` — `usage.input_tokens`/`output_tokens`
   (`domain/investigation/usage`), `evaluation.elapsed_ms`
   (`domain/investigation/evaluation`) e `durations.collection`/`judgment`/`total`/`writing`
   (`domain/investigation/durations`) são validados com `z.number()` onde cada nó declara
   `integer`.

9. `src/http/dto/simulate-hypothesis.dto.ts` — os mesmos três problemas do item 8, no arquivo
   irmão.

## Fonte

Registro completo: `siegard-reconcile/backend-code-drift-batch.md`.
Evidência por arquivo, verbatim: `siegard-reconcile/backend-code-drift-batch.returns/`.

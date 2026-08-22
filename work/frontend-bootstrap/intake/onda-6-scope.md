# Onda 6 — Glossary + Capabilities Browsers (paralelizável)

Escopo cortado a partir do plano aprovado (`.claude/plans/precious-skipping-summit.md`, seção
"Onda 6 — Glossary + Capabilities Browsers (paralelizável)"), citado abaixo verbatim, mais as
seções 2.8/2.9 do `docs/frontend-triage-console-proposal.md` (citadas na íntegra), mais os fatos
reais do backend confirmados agora (não assumidos do wireframe).

## Do plano aprovado

- **2.8 Glossary Browser**: 5 abas de vocabulary terms + concepts, somente leitura.
- **2.9 Capabilities Browser**: tabela + painel de detalhe ao clicar na linha.

Território de especificação diferente (`domain/glossary/*`, `domain/integration/capability*`, não
`case-authoring`) — vai para um epic próprio (`epic/glossary-and-capabilities-browser`). **Não
depende de nada além da Onda 1** (router, tabela reutilizável, cliente de API) — pode ser entregue
em paralelo com as Ondas 2–5, em worktree separado, exatamente a convenção que
`deliver.py --outstanding` oferece quando o conjunto entregável tem mais de uma task ao mesmo
tempo. Nesta sessão, as Ondas 2-5 já foram entregues sequencialmente; a Onda 6 é cortada agora como
sua própria onda, sem paralelismo real de worktree, mas sem depender delas.

## Wireframes (docs/frontend-triage-console-proposal.md)

### 2.8 Glossary Browser

```
Glossary ▸ Concepts | Subject types | Subject attributes | Outcomes | Actions | Recipients
────────────────────────────────────────────────────────────────────
Concept                    Accepts     TTL
equipment-status           contract    300s
network-outage-flag        contract    60s
```

Somente leitura, abas simples — não há ação de escrita nesta versão porque o glossário é
vocabulário fixo consumido pelos cases, não editado por este console.

### 2.9 Capabilities Browser

```
Capabilities
────────────────────────────────────────────────────────────────────
Capability                  Nature      Connector                    Concept          Timeout
equipment-status-reader     read-only   corporate-records-equip-…    equipment-status  5000ms
network-outage-flag-reader  read-only   corporate-records-netw-…    network-outage-…  5000ms

┌ equipment-status-reader — schemas ────────────────────────────────┐
│ Input schema:  contract-identifier-input                           │
│ Output schema: {"type":"object","properties":{"status":"string"}}  │
└──────────────────────────────────────────────────────────────────────┘
```

Clique na linha troca o painel de detalhe abaixo — evita abrir um modal para algo que é só leitura
de referência.

## Achado real do backend (confirmado agora, substitui o que o wireframe assumia)

Verificado lendo o código real, não a proposta:

1. **O glossário tem 5 vocabulários de termo, não incluídos por completo em nenhuma task
   anterior.** `list-vocabulary-terms.dto.ts`'s own `TERM_VOCABULARIES` enum:
   `subject-type`, `subject-attribute`, `outcome`, `action`, `recipient`. `use-glossary-vocabulary.ts`
   (Onda 3/4) já lê `outcome`, `action`, `recipient`, `subject-type` — mas nunca `subject-attribute`,
   que nenhuma task tocou até agora. `GET /v1/glossary/:vocabulary` responde com a mesma
   `PaginatedResponse<{name: string}>` para qualquer um dos 5, então o hook existente já é genérico
   o bastante — só falta estender seu próprio union type `GlossaryVocabulary` com
   `"subject-attribute"`, exatamente como o comentário do próprio arquivo já antecipa ("a later
   task reading it extends this union rather than this one guessing its shape ahead of need").

2. **`GET /v1/glossary/concepts` responde `PaginatedResponse<Concept>`, `Concept = {name, accepts,
   ttl}`.** `use-concept-options.ts` (Onda 4) já lê esse endpoint mas descarta `ttl` (só usa
   `name`+`accepts` pro cross-check de subject-type). O wireframe do Glossary Browser mostra uma
   coluna TTL — esta onda precisa de uma leitura nova (ou um hook irmão) que preserve `ttl`, já que
   nenhum consumidor atual expõe esse campo.

3. **Ambos os endpoints de listagem (`/v1/glossary/:vocabulary`, `/v1/glossary/concepts`) são
   paginados de verdade** (`{data, total, limit, offset, pageCount}`), mas as duas hooks já
   entregues (`use-glossary-vocabulary.ts`, `use-concept-options.ts`) ignoram `total`/`limit`/
   `offset`/`pageCount` deliberadamente, por convenção já disclosed: os dados de seed cabem numa
   página default. O wireframe do Glossary Browser não desenha nenhum controle de paginação --
   **decisão herdada**: esta onda segue a mesma convenção (lê só `data`, sem paginação real),
   disclosed como o mesmo risco herdado -- se o glossário real crescer além de uma página, só a
   primeira página aparece, silenciosamente. Não é um bug desta entrega.

4. **`GET /v1/glossary/:vocabulary/:name` e `GET /v1/glossary/concepts/:name` (endpoints de
   detalhe, por nome) existem no backend mas o wireframe do Glossary Browser não precisa de
   nenhum dos dois** -- a tabela de concepts já mostra `accepts`+`ttl` inline (vindos da própria
   listagem), e as abas de vocabulary term só mostram o nome (que a listagem já traz). Esta onda
   não chama nenhum dos dois endpoints de detalhe.

5. **`GET /v1/capabilities` responde `PaginatedResponse<Capability>`, com `Capability` carregando
   TODOS os campos que o painel de detalhe do wireframe mostra** -- `name`, `version`, `nature`
   (`'read-only' | 'mutating'`), `input_schema`, `output_schema` (ambos strings), `timeout`
   (milissegundos), `connector`, `concept` (nome do concept que responde) -- tudo já vem na própria
   linha da listagem, nada aninhado. **Isso muda o design do painel de detalhe do wireframe**: "clicar
   na linha troca o painel de detalhe abaixo" não precisa de uma segunda leitura de rede -- é
   seleção client-side sobre uma linha já carregada. `GET /v1/capabilities/:concept` (o único
   endpoint de detalhe que existe) busca por NOME DO CONCEPT, não por nome da capability, e não é
   o que o painel de detalhe do wireframe precisa (que mostra o schema da MESMA linha clicada, já
   carregada) -- esta onda não chama esse endpoint.

6. **Não existe endpoint de detalhe por nome de capability** -- só list e read-by-concept. Não é um
   problema: o achado #5 já confirma que a listagem sozinha basta para tudo que o wireframe
   desenha.

7. **`GET /v1/capabilities` não tem precedente de leitura no frontend** -- zero integração real,
   só um placeholder (`CapabilitiesPlaceholder`, `route-tree.tsx`'s `/capabilities` route,
   `app-shell.tsx`'s sidebar "Capabilities"). Um novo hook (`use-capabilities.ts`, espelhando o
   padrão exato de `use-glossary-vocabulary.ts`/`use-concept-options.ts`: `apiFetch`, key
   `["capabilities"]`, lê só `data`) é necessário.

## Fora desta onda, deliberadamente

- **Qualquer ação de escrita sobre glossário ou capabilities** -- ambos são vocabulário/registro
  fixos consumidos pelos cases, nunca editados por este console (texto do próprio wireframe,
  seção 2.8).
- **Paginação real** (controles de próxima/anterior página) -- decisão herdada das duas hooks já
  entregues; ver achado #3 acima.
- **`GET /v1/glossary/:vocabulary/:name` e `.../concepts/:name`** (detalhe por nome) -- achado #4,
  não necessários para o que esta onda desenha.
- **`GET /v1/capabilities/:concept`** (detalhe por concept) -- achado #5/#6, não necessário; a
  listagem já basta.

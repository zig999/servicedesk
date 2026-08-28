# Proposta greenfield: semântica pinada na evidência para o julgamento de hipóteses

> **Status: proposta detalhada — NADA implementado.** Material para revisão humana e, se
> aprovado, para `/analyse`. Cada item G1–G8 é um fato ou desenho proposto; as decisões em
> aberto estão marcadas. Onde este documento e a especificação divergirem, a especificação
> vale. Documento-irmão de `temp/input-schema-diagnose-contract-proposal.md` (a interação
> entre os dois está na seção 8).

---

## 1. Objetivo e princípio central

Hoje o modelo que julga uma hipótese recebe nomes crus — concept `situacao-contratual`,
campo `status`, observação `{"status":"2"}` — sem nenhuma semântica além do que o criterion
de cada hipótese reescreve por conta própria. A proposta dá significado a essa língua
(descrições no glossário e por campo do `output_schema`) e o entrega ao julgamento por um
princípio único:

> **A semântica que fundamenta um julgamento é congelada dentro da própria evidência no
> momento da coleta. O prompt de julgamento é função pura dos registros de evidência e dos
> dois fatos do caso (título e when_to_use). Nenhuma leitura de registro vivo no julgamento.**

Isso é deliberadamente mais forte que "adicionar descrição e ler do registro na hora de
julgar": corrige dois defeitos reais verificados no código atual (seção 2) e preserva por
construção a filosofia de replay do sistema (a `evaluation` já grava o prompt materializado;
com isso, todos os insumos dele passam a viver em registros imutáveis da investigação).

## 2. Os dois defeitos verificados que motivam o snapshot

Verificados em 2026-08-27, no branch `case-simulation`:

1. **"Versão" de capability não é imutável.**
   `src/src/capability-registry/capability-registry.service.ts` declara que registrar um
   name+version já existente **substitui o registro** ("an already-held name and version
   replacing the record it holds"). Uma descrição lida do registro na hora do julgamento
   pode, portanto, mudar silenciosamente sob um caso released, sem nenhum pin registrar.
2. **O julgamento lê o registro vivo, não o pin da evidência.**
   `src/src/investigation/judgment-stage.ts` (`outputSchemasFor`, ~linha 345) resolve os
   `output_schema`s no momento do julgamento, pelo registro atual. A evidência pina
   capability name+version (`domain/investigation/evidence`, "The capability reference pins
   which registered capability, at which version, produced this observation"), mas se o
   registro mudou entre coleta e julgamento, o lookup pela chave pinada falha e
   `declaredFields` degrada para `[]`, recusando citações. O drift já existe hoje só com
   nomes de campo; descrições pelo mesmo canal ampliariam a superfície dele.

O snapshot na evidência elimina os dois: o que o julgamento vê é o que a coleta viu, sempre.

## 3. O desenho, item a item

### G1 — O concept ganha significado (glossário)

`domain/glossary/concept.md` ganha o atributo `description: string`. O texto atual do nó —
"Deliberately thin: the shape of the data it names belongs to the producing capability's
output schema, never to the concept" — é **revisado, não contradito**: a *forma* do dado
continua pertencendo ao `output_schema` da capability produtora; a descrição declara o
*significado* do que o concept nomeia ("a situação cadastral e financeira do contrato junto
ao ERP", por exemplo), que é exatamente o que uma "published language" deve a seus falantes.

- **Escritas novas**: registro de concept sem descrição é recusado (422, erro tipado),
  na mesma convenção das recusas de contrato existentes.
- **Concepts já registrados**: lidos como descrição vazia; a UI do glossário os marca para
  o operador completar. Sem backfill automático (escrita é do operador).
- Consumidores: snapshot na coleta (G3), browser do glossário, painéis de operador.

### G2 — Semântica por campo no `output_schema`

O `output_schema` já é JSON com `properties` no topo (forma que `declaredFieldsOf` em
`src/src/investigation/citation-validation.ts` lê por inferência disclosada). A proposta
fixa essa forma como fato declarado — a mesma fixação que a proposta do input_schema (D1)
faz para o irmão — e passa a ler, por campo, além do nome: `type` e `description`, quando
declarados. Nenhum outro campo do JSON Schema é validado ou lido; são dica de operador.

Novo leitor estrutural (casa única da forma): algo como `fieldSemanticsOf(outputSchema)` →
`[{ name, type?, description? }]`, na convenção de `declaredFieldsOf` (malformado = nada
declarado, nunca exceção).

Exemplo de `output_schema` com semântica:

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "description": "situação do contrato no ERP: 1=ativo, 2=suspenso por inadimplência, 3=cancelado"
    },
    "dias_em_atraso": { "type": "integer", "description": "dias corridos desde o vencimento mais antigo em aberto" }
  }
}
```

### G3 — Snapshot de semântica na evidência (o núcleo)

`domain/investigation/evidence.md` ganha dois atributos:

- `fields` (many): `{ name, type?, description? }` — a semântica por campo do
  `output_schema` da capability produtora, **como ela estava no instante da coleta**, lida
  por `fieldSemanticsOf` (G2).
- `concept_description: string` — a descrição do concept no glossário, no instante da
  coleta (G1; vazia para concept legado sem descrição).

Gravados pelo estágio de coleta (`evidence-collection-stage.ts`), que já resolve a
capability antes da chamada (é de onde tira `capabilityName`/`capabilityVersion` hoje) e já
tem acesso ao glossário via as dependências que `runDiagnosis` carrega. O snapshot é feito
para **todo** item de evidência, qualquer que seja o `result` (ok, unavailable, denied,
timeout) — a capability foi resolvida antes da chamada; onde nem a capability resolveu
(unavailable pré-resolução), `fields` fica vazio e a degradação é honesta, como hoje.

A referência pinada à capability (name+version) **permanece** — o snapshot não a substitui;
ela continua dizendo *quem* produziu, o snapshot diz *o que significava*.

### G4 — O julgamento vira função pura da evidência

- `judgment-stage.ts` **deixa de chamar** `outputSchemasFor` — a leitura viva do registro
  sai do julgamento. `EvidenceItem` (em `hypothesis-evaluator.port.ts`) troca
  `declaredFields: string[]` por `fields: {name, type?, description?}[]` e ganha
  `conceptDescription`, ambos vindos do snapshot da evidência.
- `citation-validation.ts`: `citesADeclaredField` passa a validar a citação contra os
  `fields` snapshotados da própria evidência citada, não contra `context.outputSchemas`
  (a regra `a-cited-field-exists-in-the-capability-output-schema` é revista de acordo —
  seção 4). O uso de `declaredFieldsOf` pelo adapter HTTP na coleta (filtrar a observação)
  permanece — lá a leitura é no momento certo.
- `anthropic-hypothesis-evaluator.adapter.ts`: o bloco `<evidence>` passa a renderizar,
  por `<item>`: o concept, sua descrição, os campos com tipo e descrição, e a observação —
  tudo escapado como hoje (`escapeForXmlText`), dado e nunca instrução. O `SYSTEM_PROMPT`
  é atualizado para explicar que cada campo carrega nome e significado e que a citação
  continua copiando **exatamente o nome** do campo. **`prompt_version` é bumpado** — o
  template mudou, e esse é o pin que existe para isso.
- Os fakes (`fake-hypothesis-evaluator.adapter.ts` etc.) acompanham a forma nova.

Exemplo do `<item>` antes e depois:

```
— hoje —
<item concept="situacao-contratual" result="ok" fields="status,dias_em_atraso">
  {"status":"2","dias_em_atraso":"47"}
</item>

— proposto —
<item concept="situacao-contratual" result="ok">
  <concept_meaning>a situação cadastral e financeira do contrato junto ao ERP</concept_meaning>
  <field name="status" type="string">situação do contrato no ERP: 1=ativo, 2=suspenso por inadimplência, 3=cancelado</field>
  <field name="dias_em_atraso" type="integer">dias corridos desde o vencimento mais antigo em aberto</field>
  <observation>{"status":"2","dias_em_atraso":"47"}</observation>
</item>
```

(A forma exata das tags é decisão de implementação; o fato é o conteúdo permitido.)

### G5 — A constraint do prompt fechado é reescrita mais forte

`constraints/the-judgment-prompt-is-closed` deixa de enumerar cinco entradas lidas de três
lugares e passa a declarar:

> Um prompt de julgamento é função pura de: o criterion da hipótese, os registros de
> evidência dela (incluindo a semântica neles snapshotada — descrição do concept e nome,
> tipo e descrição de cada campo), e o título e when_to_use do caso pinado, num bloco
> delimitado, sem tool calling. Nenhuma leitura de registro vivo entra na montagem.

O bloco continua fechado — os itens é que ficam mais ricos. Continuam **fora**, por decisão
re-derivada (seção 4): atributos do subject, criterions de outras hipóteses, qualquer
conteúdo do registro além do snapshotado, e tools.

### G6 — Regra nova: semântica, nunca política

Uma descrição — de concept ou de campo — declara **o que o dado significa**; nunca declara
uma decisão: um limiar que confirma, um outcome, um referral, uma condição de recusa. A
decisão pertence ao criterion da hipótese e aos nós da especificação. Uma descrição que
enuncia política é uma segunda casa para um fato de negócio, e o review a reporta como
reporta hoje (pass de conformidade). Exemplos na própria regra:

- ✅ `"2 = suspenso por inadimplência"` (significado do valor)
- ❌ `"quando 2, confirme a hipótese de bloqueio financeiro"` (decisão — pertence ao criterion)

### G7 — Persistência e leitura

- `constraints/the-stored-schema-mirrors-the-declared-model` obriga: o store relacional de
  investigação ganha as colunas/estrutura dos dois atributos novos da evidência; o store do
  glossário, a coluna de descrição do concept.
- Registros de investigação antigos não têm os campos → toda leitura (rotas/DTOs que expõem
  investigação e evidência) tolera ausência, expondo vazio e nunca falhando.
- **Não existe re-julgamento de evidência antiga**: evidência é criada e julgada dentro da
  mesma run de diagnose; investigações gravadas são registro, nunca re-executadas. A
  migração é, portanto, só de leitura — nenhum caminho de julgamento legado precisa existir.

### G8 — (Decisão em aberto) imutabilidade de versão de capability

O snapshot torna a sobrescrita de versão **inofensiva para julgamentos passados**, mas ela
continua existindo (defeito 1 da seção 2). Duas posições possíveis, para o humano decidir:

- **(a) Manter a substituição** como está — o snapshot já protege o que importa; corrigir um
  typo de descrição não força bump de versão. Custo: "versão" continua não significando
  imutabilidade.
- **(b) Recusar re-registro de name+version já held** — versão passa a ser imutável;
  qualquer mudança é versão nova. Custo: fluxo de operador mais rígido.

A proposta recomenda **(a)** por ora — o ganho de (b) ficou pequeno depois do snapshot — mas
a decisão é sua e muda um nó de regra num sentido ou noutro.

## 4. As regras quebradas, revistas e mantidas — a lista explícita

### Quebradas ou revistas

| nó | hoje diz | passa a dizer | natureza |
|---|---|---|---|
| `constraints/the-judgment-prompt-is-closed` | cinco entradas permitidas; "the schema's types, **descriptions** and any other content stay outside the block" | função pura dos registros de evidência (com semântica snapshotada) + título/when_to_use; sem leitura viva; sem tools | **reescrita** — a cláusula de exclusão cai, o princípio de fechamento fica mais forte |
| `domain/glossary/concept.md` | "Deliberately thin" — name, accepts, ttl | ganha `description` obrigatória em escritas novas; "thin" revisto: forma continua da capability, **significado** é do concept | **revista** |
| `domain/investigation/evidence.md` | concept, inputs, observation, observed_at, ttl, origin, result, result_detail, elapsed_ms + pin da capability | ganha `fields` (snapshot por campo) e `concept_description` | **evoluída** |
| `rules/investigation/a-cited-field-exists-in-the-capability-output-schema` | o campo citado existe no output_schema da capability produtora (lido do registro) | o campo citado existe nos `fields` snapshotados da própria evidência citada | **revista** — mesma intenção, fonte de verdade nova |
| convenção de leitura do `output_schema` (inferência disclosada no decision-log) | só as chaves de `properties`, lidas por `declaredFieldsOf` | forma fixada como fato: chaves + `type`/`description` por campo, lidas por `fieldSemanticsOf` | **promovida de inferência a fato** |

### Mantidas deliberadamente (re-derivadas, não por deferência)

| regra/postura | por que sobrevive |
|---|---|
| sem tool calling no julgamento | replay exato, custo previsível, auditabilidade; evidência faltante se resolve por orquestração (rodada extra de coleta decidida por código a partir de inconclusivos — fora do escopo desta proposta, anotada como evolução) |
| `constraints/hypotheses-are-judged-in-isolated-parallel-calls` | contexto cruzado entre hipóteses é anchoring; a consolidação já é o estágio que vê o conjunto |
| atributos do subject fora do prompt | identidade não fundamenta verdict; convida inferência pelo "quem" e manda PII ao provider sem ganho |
| dado nunca é instrução (bloco delimitado, escaping, system prompt fixo) | descrições entram exatamente como a observação externa já entra |
| `rules/integration/evidence-arrives-in-the-glossary-vocabulary` + anticorrupção | **fortalecidas**: a normalização passa a carregar nomes *e* significados |
| pin de capability na evidência | permanece — diz quem produziu; o snapshot diz o que significava |

### Novas

| regra nova | conteúdo |
|---|---|
| semântica-nunca-política (G6) | descrição declara significado, nunca decisão; review reporta |
| concept declara seu significado (G1) | registro novo sem descrição é recusado; legado lido como vazio e marcado |
| snapshot na coleta (G3) | todo item de evidência grava a semântica do instante da coleta |

## 5. Inventário de implementação (indicativo — a decomposição real é do `/plan-work`)

### Especificação (o que o `/analyse` cria/emenda)

1. Reescrever `constraints/the-judgment-prompt-is-closed` (G5).
2. Emendar `domain/glossary/concept.md` (G1) e `domain/investigation/evidence.md` (G3).
3. Rever `rules/investigation/a-cited-field-exists-in-the-capability-output-schema` (G4).
4. Regras novas: semântica-nunca-política (G6); concept-declara-significado (G1);
   forma do output_schema fixada com semântica por campo (G2).
5. Decisão G8 registrada num sentido ou noutro.
6. Scenarios novos: julgamento lê snapshot e não registro (sobrescrever capability entre
   coleta e julgamento não muda o prompt); concept legado sem descrição degrada para
   nome-só naquele item; registro de concept sem descrição recusado; investigação antiga
   lida sem os campos novos.
7. Decision-log: cada silêncio fechado (forma das tags do prompt, tratamento de vazio etc.).

### Backend (`src/`)

| onde | o quê |
|---|---|
| glossário: authoring/store/DTOs de concept | `description` no registro (recusa de ausência em escrita nova), coluna no store, exposta nas leituras |
| novo `fieldSemanticsOf` (junto a `citation-validation.ts` ou módulo próprio) | leitura estrutural nome/type/description por campo — casa única da forma G2 |
| `investigation/evidence-collection-stage.ts` | snapshot G3: `fields` da capability resolvida + `concept_description` do glossário, para todo item |
| tipo `Evidence` + store relacional de investigação + DTOs de leitura | dois atributos novos; leituras toleram registros antigos sem eles |
| `investigation/judgment-stage.ts` | remove `outputSchemasFor` (leitura viva sai); monta `EvidenceItem` do snapshot |
| `investigation/hypothesis-evaluator.port.ts` | `EvidenceItem` com `fields` ricos + `conceptDescription` |
| `investigation/anthropic-hypothesis-evaluator.adapter.ts` | prompt novo (system + `<item>` com semântica); **bump de `prompt_version`** |
| `investigation/citation-validation.ts` | citação validada contra o snapshot da evidência citada |
| fakes (`fake-hypothesis-evaluator`, fixtures) | acompanham a forma nova |

### Frontend (`frontend/app/`)

| onde | o quê |
|---|---|
| browser do glossário | exibir/editar descrição de concept; marcar legados sem descrição |
| formulário de capability | dica sobre `description` por campo no output_schema |
| detail panel da simulação / leitura de investigação | exibir a semântica snapshotada junto da evidência (opcional, recomendado) |

## 6. Migração e compatibilidade

- **Julgamento**: nenhum caminho legado — evidência nasce e é julgada na mesma run; runs
  novas sempre têm snapshot. Runs antigas são registro e nunca re-executam.
- **Leitura**: DTOs/rotas de investigação toleram ausência dos campos novos (registros
  pré-mudança).
- **Concepts legados**: descrição vazia → o `<item>` daquele concept degrada para o
  comportamento atual (nome-só), dito no próprio registro, nunca inventado.
- **`prompt_version`**: bump obrigatório junto do template novo — é o pin que separa
  julgamentos de antes e depois.

## 7. Custos aceitos

- O nó `evidence` e o store de investigação engordam (bytes por item; irrelevante em volume,
  real em superfície de schema).
- A mesma informação existe em dois momentos — registro (o que a capability *é*) e snapshot
  (o que ela *era* ao observar). Snapshot-no-tempo é cópia legítima, não segunda casa; a
  regra G6 é o que impede a cópia de virar política.
- Prompt maior por item de evidência → custo de token por julgamento sobe (proporcional ao
  tamanho das descrições; mitigável por disciplina de autoria, não por regra).
- Fardo de autoria: operadores passam a escrever descrições (concept e campos). É o preço
  de uma língua com dicionário; painel e julgamento devolvem o valor.

## 8. Interação com a proposta do input_schema

As duas propostas são **independentes e compatíveis** — podem ir num mesmo increment de
`/analyse` ou em dois:

- Compartilham a fixação de forma dos schemas de capability (properties + campos lidos
  estruturalmente): D1 lá, G2 aqui — se aprovadas juntas, é **uma** regra de forma cobrindo
  input e output.
- O `hint` do endpoint `input-requirements` (D3) e a semântica do julgamento (G2/G3) leem a
  mesma `description` — um único fardo de autoria serve os dois.
- Nenhuma depende da outra para funcionar.

## 9. Decisões em aberto para aprovação humana

| id | decisão | recomendação |
|---|---|---|
| G1 | descrição obrigatória em concept novo? | sim (recusa 422); legado vazio e marcado |
| G3 | snapshot para todo item, inclusive não-ok? | sim (capability resolvida antes da chamada) |
| G8 | versão de capability vira imutável? | não por ora — o snapshot já protege julgamentos; reavaliar depois |
| — | tags exatas do bloco `<item>` | decisão de implementação, disclosada no decision-log |
| — | um increment de `/analyse` junto com o input_schema, ou dois? | dois, se quiser aprovar/entregar em ritmos diferentes; um, se o fardo de autoria for coordenado de uma vez |

## 10. Rota (após aprovação — nada roda antes dela)

1. Humano revisa G1–G8 e as decisões em aberto; ajusta este documento.
2. `/analyse` com este documento como material → revisar o diff sobre `knowledge/` e o
   `decision-log.md`.
3. `/plan-work` com escopo: *"semântica pinada na evidência: descrição em concept e por
   campo do output_schema, snapshot na coleta, julgamento como função pura da evidência,
   prompt do avaliador enriquecido com prompt_version novo, e leituras tolerantes a
   registros legados"*.
4. `/implement-task` por task; `/review-change` ao final.

# `input_schema`, `output_schema` e `configuration` do connector — explicado sem pressa

Este documento responde a uma pergunta específica: **existe uma relação, no código, entre os dois
campos de schema de uma `capability` (`input_schema` e `output_schema`) e a `configuration` do
`connector` que ela usa?**

A resposta curta é: **existe relação com um deles, não com o outro** — e essa assimetria é o fio
condutor do documento inteiro. Não pressupõe conhecimento nenhum do sistema. Todo termo é explicado
na primeira vez que aparece, e toda afirmação técnica cita o arquivo e a linha onde foi lida.

---

## Parte 0 — Os três personagens, numa frase cada

Antes de entrar em detalhe, os três nomes que vamos usar o tempo todo:

- **`capability`** ("capacidade") — um registro que diz "eu sei observar um fato do mundo real".
  Por exemplo: "eu sei consultar o perfil de um técnico". Fica na tabela `capabilities`.
- **`connector`** — o adaptador técnico que sabe *como* falar com o sistema externo de verdade (uma
  API HTTP, por exemplo). Sua configuração fica na tabela `connector_configurations`.
- **`concept`** — o nome, no vocabulário do negócio, do fato que se quer saber (ex.: "perfil do
  técnico"). É o elo entre uma hipótese do caso e a `capability` que sabe respondê-lo.

Uma `capability` **aponta para** um `connector` pelo nome (campo `connector`, uma string). Mas
apontar pelo nome não é a mesma coisa que compartilhar estrutura — e é exatamente aí que mora a
pergunta deste documento.

---

## Parte 1 — A analogia

Pense numa ficha de fornecedor cadastrado num sistema de compras:

> **Fornecedor**: Gráfica Rápida
> **O que ele entrega**: banners impressos (formato: nome do arquivo, largura, altura, material)
> **O que eu preciso mandar pra ele pedir um banner**: *(campo de anotação livre, preenchido por
> quem cadastrou — às vezes detalhado, às vezes só "manda o pedido por e-mail")*
> **Telefone/e-mail de contato, e o script exato da ligação**: *(uma ficha totalmente separada,
> escrita por outra pessoa, no sistema de telefonia)*

A "ficha de fornecedor" é a `capability`. O campo "o que ele entrega" é o `output_schema` — e esse
campo **é usado de verdade**: o sistema de compras confere se o que chegou bate com esse formato
antes de aceitar a entrega. O campo "o que eu preciso mandar" é o `input_schema` — só uma anotação;
ninguém confere se a ligação que o telefonista faz respeita essa anotação. E o "script exato da
ligação" — o número discado, o que se fala, em que ordem — é a `configuration` do connector: uma
ficha *completamente separada*, escrita por quem cuida da telefonia, sem nenhum vínculo mecânico
com a anotação da primeira ficha.

O resto deste documento é essa mesma história, mas no código real.

---

## Parte 2 — Os dois schemas da capability

O modelo de domínio (`knowledge/domain/integration/capability.md`) declara os dois campos lado a
lado, com a mesma forma:

```yaml
- name: input_schema
  type: string
  required: true
- name: output_schema
  type: string
  required: true
```

Idênticos na declaração: os dois são obrigatórios, os dois são `string`. A diferença entre eles não
está em como são declarados — está em **o que o código faz com cada um depois**. E é isso que
vamos seguir, passo a passo, para os dois.

### 2.1 — O que os dois têm em comum: a checagem na hora do cadastro

Quando alguém cadastra ou atualiza uma capability (`PUT /v1/capabilities/{name}/{version}`), o
serviço de registro roda esta função sobre **os dois** campos:

```ts
// src/src/capability-registry/capability-registry.service.ts:228-236
function refuseMalformedSchemas(registration: DeclaredRegistration): void {
  const malformed = SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute]));
  if (malformed.length > 0) {
    throw new CapabilitySchemaNotWellFormedError(malformed);
  }
}

function isWellFormedJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
```

`SCHEMA_ATTRIBUTES` é `['input_schema', 'output_schema']`
(`src/src/capability-registry/capability.ts:90`). Ou seja: **os dois** precisam ser um texto que dá
para interpretar como JSON — senão o cadastro é recusado com erro 422. Até aqui, tratamento igual.

Essa exigência está registrada como regra de negócio:
`knowledge/rules/integration/a-capability-declares-well-formed-schemas.md` — "The registry refuses
to register or update a capability whose input schema or output schema is not syntactically valid
JSON".

**É a única vez, em todo o sistema, que `input_schema` é examinado por código.** A partir daqui, os
caminhos dos dois campos se separam completamente.

### 2.2 — `output_schema`: o que acontece depois do cadastro

Depois que uma capability está cadastrada, toda vez que ela é usada para observar um fato real
(seja numa investigação de verdade, seja no teste manual), a resposta que volta do sistema externo
passa por este filtro:

```ts
// src/src/investigation/http-declarative-observation-source.adapter.ts:376-380
function observationOf(capability: Capability, responseMap: ResponseFieldPaths, body: unknown): Record<string, unknown> {
  const extracted = extractResponseFields(responseMap, body);
  const declaredFields = declaredFieldsOf(capability.output_schema);
  return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));
}
```

Em português: o sistema extrai da resposta os campos que o connector disse que ia extrair
(`responseMap` — explicado na Parte 3), mas **só deixa passar os campos que o `output_schema` da
capability também declara**. Um campo que o connector tentou extrair mas o `output_schema` não
prevê é descartado silenciosamente. Isso é o que o comentário do domínio chama de "bounds every
citation over the evidence it produces" (`knowledge/domain/integration/capability.md:34`) — o
`output_schema` é o portão: só passa o que ele autoriza.

`output_schema` também tem uso mais adiante, em cima do laudo final: quando o sistema monta a
resposta de uma investigação e cita um campo como evidência, ele confere se esse campo existe no
`output_schema` da capability que o produziu (regra
`a-cited-field-exists-in-the-capability-output-schema`, citada no comentário da regra de sintaxe).
**`output_schema` trabalha de verdade, em dois pontos da vida do sistema.**

### 2.3 — `input_schema`: o que acontece depois do cadastro

Nada. Literalmente nenhuma função no backend lê `input_schema` depois do cadastro para validar,
filtrar, moldar ou decidir qualquer coisa. Ele é gravado e devolvido como veio:

```ts
// src/src/persistence/relational-capability-store.repository.ts:38 (a coluna)
// ...:66 (o SELECT que a lê)
// ...:101 (o objeto que devolve, sem transformação)
```

O único lugar do sistema que sequer *menciona* `input_schema` de novo é a tela de teste manual
(`/test-connector`), e mesmo ali é só para **exibir**, nunca para conferir nada:

```ts
// frontend/app/src/routes/connector-test-panel-fields.tsx:128-134
/** The chosen capability's own input_schema, pretty-printed for read-only reference;
    falls back to the raw stored text if it somehow does not parse as JSON. */
function formatSchemaForDisplay(schema: string): string {
  try {
    return JSON.stringify(JSON.parse(schema), null, 2);
  } catch {
    return schema;
  }
}
```

Repare no próprio comentário: "falls back to the raw stored text **if it somehow does not parse as
JSON**". O código já assume, na sua própria escrita, que `input_schema` pode não ser JSON de
verdade — é só uma tentativa de deixar bonito na tela, com plano B pra quando não for.

E na rota que efetivamente testa a chamada (`POST /v1/test-connector`), o campo equivalente ao
`input_schema` (chamado `input` no corpo da requisição) é aceito e **guardado só para registro do
que o operador pretendia mandar** — nunca comparado com o `input_schema`, nunca usado para montar a
chamada de verdade:

> "input is this route's own optional, opaque sample payload (**matching the capability's own
> input_schema by convention, never validated against it by this task**): accepted for a caller
> that wants to record what it intended to send, but unused in translation"
> — `src/src/http/dto/test-connector.dto.ts:23-29`

**"By convention"** é a frase-chave de todo este documento. Volto a ela na Parte 4.

---

## Parte 3 — A `configuration` do connector: uma ficha totalmente separada

A capability tem um campo `connector`, uma string simples — o nome do connector que ela usa
(`knowledge/domain/integration/capability.md:22-24`). Esse nome é a **única** ponte entre a
capability e o connector. Não é um objeto embutido, não é uma referência que carrega estrutura —
é só um nome, do jeito que "Gráfica Rápida" é só um nome na ficha do fornecedor.

O connector, por sua vez, tem sua própria tabela (`connector_configurations`), com só dois campos:

```yaml
# knowledge/domain/integration/connector-configuration.md
- name: connector       # o nome, o mesmo que a capability aponta
- name: configuration    # um texto JSON, "opaco" — a especificação não diz o que tem dentro
```

O próprio modelo de domínio confirma que ele é livre: *"Its shape is not fixed here, the same
restraint a capability's own input and output schemas already hold"* — ou seja, a especificação
decidiu deliberadamente **não** ditar o formato de `configuration`, do mesmo jeito que decidiu não
ditar o conteúdo de `input_schema`/`output_schema`. Quem dita o formato de `configuration` é o
adaptador técnico que vai usá-la (o adaptador HTTP, no caso deste projeto):

```ts
// src/src/http-connector/http-connector-call-configuration.ts:54-58
export type HttpConnectorCallConfiguration = {
  readonly method: HttpMethod;        // GET | POST | PUT | PATCH | DELETE
  readonly responseMap: ResponseFieldPaths;
  readonly statusMap: StatusEndingMap;
};

// src/src/http-connector/connector-call-descriptor.ts:36-41
export type ConnectorCallDescriptor = {
  readonly address: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
};
```

Juntando os dois pedaços (o adaptador narrows a mesma `configuration` duas vezes, para dois
propósitos diferentes), a forma completa que uma `configuration` de connector HTTP pode ter é:

```jsonc
{
  "method": "GET",                              // obrigatório
  "address": "http://.../technicians/${subject:user-id}/profile",  // obrigatório
  "statusMap": { "200": "ok", "403": "denied" }, // obrigatório
  "responseMap": { "login": "data.id" },         // obrigatório
  "query": { }, "headers": { }, "body": { }      // opcionais
}
```

Nada aqui — nenhuma dessas sete chaves — vem do `input_schema` ou do `output_schema` da capability.
Tudo aqui é escrito à mão por quem cadastra o connector, num formulário completamente diferente do
formulário de cadastro da capability.

### De onde vêm os valores reais que preenchem `${subject:user-id}`

Os placeholders `${subject:...}`, `${requester}` e `${credential:...}` dentro de `address`,
`query`, `headers` e `body` são substituídos, na hora da chamada, pelos valores do **Subject** — o
"alvo" da investigação (ex.: qual técnico), que vem do pedido de diagnóstico (`/diagnose`) ou do
teste manual, **nunca** do `input_schema`:

```ts
// src/src/http-connector/connector-request-resolver.ts:207-214
function resolveSubjectPlaceholder(attributeName: string, subject: Subject): string {
  const match = subject.attributes.find((pair) => pair.attribute === attributeName);
  if (match === undefined || match.value === '') {
    throw new ConnectorPlaceholderNotResolvedError('subject-attribute', attributeName);
  }
  return match.value;
}
```

---

## Parte 4 — Então qual é a relação, afinal?

Nenhuma que o código garanta. As duas únicas coisas que ligam uma capability à sua chamada real
são:

1. **O nome do connector** (`capability.connector`) — usado para *achar* a `configuration` certa na
   tabela `connector_configurations` (`src/src/investigation/http-declarative-observation-source.adapter.ts:261-269`).
2. **O `output_schema`** — usado para *filtrar* o que volta da chamada, como vimos na Parte 2.2.

`input_schema` não entra em nenhuma das duas pontes. A única relação que existe entre `input_schema`
e a `configuration` do connector é **humana e documental**: espera-se que quem escreve
`input_schema` descreva, em prosa ou em JSON, o que o connector configurado (`address`/`query`/
`headers`/`body`) efetivamente espera receber — porque são a mesma pessoa (ou time) decidindo os
dois, olhando pro mesmo sistema externo. Mas **nenhuma linha de código confere se os dois batem**.
É perfeitamente possível, hoje, cadastrar:

- uma capability cujo `input_schema` diz `{"type":"object","properties":{"cpf":{"type":"string"}}}`
- apontando para um connector cuja `configuration.address` usa `${subject:user-id}` — um atributo
  completamente diferente do que o `input_schema` prometeu

— e o sistema aceita os dois cadastros sem reclamar, porque cada um é validado isoladamente, nunca
um contra o outro.

### O caso real que vimos ao consultar o banco

A única capability hoje cadastrada em produção tem este `input_schema` (uma frase solta, não JSON):

```
"user-id: o usuario corporativo do tecnico, sem domínio, na grafia que o store do FSM guarda
(o IFS nao normaliza a caixa)"
```

E o connector que ela aponta (no exemplo que você trouxe) usa exatamente `${subject:user-id}` no
`address`. **Aqui, por sorte/disciplina de quem cadastrou, os dois contam a mesma história** — mas
essa consistência é toda humana. Se alguém editasse só o connector para trocar `user-id` por
`login`, nada no sistema avisaria que o `input_schema` da capability ficou desatualizado.

---

## Parte 5 — O fluxo completo, com o exemplo que você trouxe

Juntando tudo, esta é a jornada real de uma chamada, usando exatamente os dados que apareceram
nesta conversa:

**A capability, como está gravada:**

```
name:    perfil-mobile-tecnico-reader
version: 1.0.0
connector: (o connector abaixo)
input_schema:  "user-id: o usuario corporativo do tecnico..." (prosa, não-JSON)
output_schema: {"type":"object","properties":{"login":{"type":"string"},
                "installations":{"type":"array","items":{...}}}}
```

**A configuration do connector, como você a descreveu:**

```json
{
  "method": "GET",
  "address": "http://127.0.0.1:8787/v1/technicians/${subject:user-id}/profile",
  "statusMap": { "200": "ok", "400": "denied", "403": "denied", "500": "unavailable", "503": "unavailable" },
  "responseMap": { "login": "data.id", "installations": "data.installations" }
}
```

**O que acontece quando o concept que essa capability responde precisa ser observado:**

1. O sistema resolve qual capability responde o concept → acha `perfil-mobile-tecnico-reader`.
2. Lê o nome do connector nela e busca a `configuration` correspondente na outra tabela.
   *(`input_schema` já não é mais tocado a partir daqui — ficou pra trás no passo 1.)*
3. Substitui `${subject:user-id}` no `address` pelo valor real do atributo `user-id` do Subject que
   está sendo investigado (ex.: `joao.silva`) → vira
   `http://127.0.0.1:8787/v1/technicians/joao.silva/profile`.
4. Dispara um `GET` nesse endereço (o `method` da configuration).
5. A resposta chega, por exemplo `{"data": {"id": "joao.silva", "installations": [...] } }`, com
   status `200`.
6. `statusMap["200"]` diz que isso é `"ok"`.
7. `responseMap` extrai `login` de `data.id` e `installations` de `data.installations`.
8. **Agora sim `output_schema` volta a agir**: só os campos que ele declara (`login`,
   `installations`) sobrevivem — se `responseMap` tivesse extraído um terceiro campo qualquer, esse
   terceiro campo seria descartado aqui, porque `output_schema` não o declara.
9. O resultado final vira a evidência que a investigação usa.

`input_schema` participou de exatamente **um** desses nove passos — o de cadastro, que já tinha
acontecido muito antes, em outro momento, em outra tela. `output_schema` participou de **dois**:
um no cadastro (junto com `input_schema`) e outro bem no fim (passo 8), sozinho.

---

## Parte 6 — Tabela-resumo

| | `input_schema` | `output_schema` | `configuration` do connector |
|---|---|---|---|
| Onde mora | tabela `capabilities` | tabela `capabilities` | tabela `connector_configurations` |
| Quem escreve | quem cadastra a capability | quem cadastra a capability | quem cadastra o connector — formulário separado |
| Checado como JSON no cadastro? | sim | sim | sim (só "é um objeto", não a forma interna) |
| Usado depois do cadastro? | **não** | **sim** — filtra o que a chamada devolve | **sim** — é o que efetivamente monta e dispara a chamada |
| Liga-se ao `address`/`body` do connector? | não, nunca, nem em chamadas POST | não diretamente | é o próprio dono do `address`/`body` |
| Liga-se ao `responseMap`/resultado do connector? | não | sim, filtra o resultado dele | é o dono do `responseMap` |
| Vínculo com o outro lado | nenhum garantido por código — só convenção humana | nenhum vínculo automático de "os dois lados concordam" — o código só filtra, não confere consistência prévia | idem |

---

## Conclusão, sem rodeios

**Não existe, hoje, nenhuma relação programática entre `input_schema` de uma capability e a
`configuration` do connector que ela usa.** Eles vivem em tabelas diferentes, são preenchidos em
telas diferentes, e nenhuma função do sistema lê um para conferir, ajustar ou validar o outro —
nem quando o connector é um `GET`, nem quando é um `POST`.

**`output_schema` é diferente**: ele tem um vínculo real, embora indireto, com a `configuration` do
connector — não porque o código compare os dois campos, mas porque o `output_schema` **filtra**, no
fim da chamada, o que o `responseMap` da `configuration` extraiu. É um portão depois do fato, não
uma validação de entrada.

Se a intenção de negócio é que `input_schema` realmente restrinja ou valide o que um connector
manda — inclusive o corpo de um `POST` — **isso não existe no sistema hoje**. Seria uma decisão de
negócio nova, ainda não tomada, e por isso não pode ser inferida ou implementada em silêncio: teria
que passar pelo caminho formal de análise deste projeto antes de virar código.

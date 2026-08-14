Escopo — conector HTTP real para observation-source, genérico e orientado a dados.

## Contexto e pré-requisito

Hoje IObservationSource (contracts/investigation/observation-source,
contracts/integration/concept-observation) só tem uma implementação de teste,
FakeObservationSource, alimentada por um arquivo JSON estático — inclusive no processo de
produção (factories/diagnose-server.factory.ts). Este escopo entrega a implementação de produção
desse mesmo port.

Pré-requisito: a análise que generaliza o contexto de integração para um conjunto aberto e
variável de sistemas externos (contracts/system/corporate-records,
contracts/integration/corporate-records-source deixam de nomear um único sistema fixo) precisa já
ter sido validada antes deste plano — este escopo depende diretamente dela para que "qualquer
serviço externo pode ser cadastrado" seja um fato que a especificação já sustenta, e não algo que
este plano estaria inventando por conta própria.

## Princípio central

Um adaptador só, nenhuma linha de código por serviço novo. Em vez de escrever uma classe por
sistema externo, existe um adaptador genérico de IObservationSource — chamo de
HttpDeclarativeObservationSource — que executa uma chamada HTTP inteiramente a partir de dados de
configuração ("descritor de conector"), cadastrados por serviço. Cadastrar um novo sistema externo
vira inserir um registro, nunca compilar um deploy novo.

Isso encaixa perfeitamente no que a especificação já decidiu: o campo connector já é uma string
opaca de propósito ("a name is configuration... keeps vendors out of the model", decision-log.md).
O que falta é dar um corpo a essa configuração — e esse corpo não é um fato de domínio novo, é
puramente a peça de infraestrutura que a especificação já deixou como remainder. Não precisa de nó
de especificação novo.

## O que muda e o que não muda

| Peça | Muda? |
|---|---|
| IObservationSource (port) | Não — continua observeConcept(concept, subject, requester) |
| evidence-collection-stage.ts | Não — continua orquestrando timeout, paralelismo, Evidence |
| Capability (domínio) | Não — connector continua sendo só um nome |
| capabilities (tabela) | Não |
| Novo: descritor de conector | Nova tabela/registro, fora do domínio, puro dado de infraestrutura |
| Novo: adaptador genérico | Uma única classe nova |

Isso mantém o raio de impacto mínimo — nada do pipeline que já vimos (collectEvidence,
judgeHypotheses, citation-validation.ts) precisa saber que passou a existir HTTP de verdade por
trás.

## O descritor de conector — o "cadastro" de um serviço externo

Um registro por connector, guardando como montar a requisição e como ler a resposta:

```
{
  "connector": "corporate-records-equipment-status-connector",
  "method": "GET",
  "base_url": "https://records.example-corp.internal",
  "path_template": "/api/v1/equipment/{{subject.contract-number}}/status",
  "query_template": {},
  "headers_template": {
    "Authorization": "Bearer {{secret.EQUIPMENT_STATUS_TOKEN}}"
  },
  "body_template": null,
  "response_map": {
    "status": "$.data.currentStatus",
    "lastCheckedAt": "$.data.meta.checkedAt"
  },
  "status_map": {
    "200": "ok",
    "401": "denied",
    "403": "denied",
    "404": "unavailable"
  },
  "request_timeout_ms": 4000
}
```

Um segundo exemplo, para um serviço que exige POST com corpo JSON diferente:

```
{
  "connector": "network-outage-connector",
  "method": "POST",
  "base_url": "https://noc.other-vendor.example",
  "path_template": "/v2/query",
  "headers_template": { "x-api-key": "{{secret.NOC_API_KEY}}", "content-type": "application/json" },
  "body_template": {
    "customerRef": "{{subject.contract-number}}",
    "queryType": "outage-flag"
  },
  "response_map": { "active": "$.result.flags.outageActive" },
  "status_map": { "200": "ok", "429": "unavailable", "403": "denied" },
  "request_timeout_ms": 3000
}
```

Um terceiro exemplo, para um serviço que exige a chave de API como parâmetro de query em vez de
header — mostrando que query_template resolve placeholder do mesmo jeito que headers_template:

```
{
  "connector": "field-technician-directory-connector",
  "method": "GET",
  "base_url": "https://directory.another-vendor.example",
  "path_template": "/lookup",
  "query_template": {
    "apiKey": "{{secret.DIRECTORY_API_KEY}}",
    "contract": "{{subject.contract-number}}"
  },
  "headers_template": {},
  "body_template": null,
  "response_map": { "assignedTechnician": "$.records[0].technician.name" },
  "status_map": { "200": "ok", "204": "unavailable", "401": "denied" },
  "request_timeout_ms": 5000
}
```

Repare que response_map deste terceiro exemplo usa $.records[0].technician.name — a sintaxe do
caminho de extração precisa suportar índice de array além de chave aninhada, não só o caso simples
de objeto plano dos dois primeiros exemplos.

Repare também: cada descritor tem seu próprio base_url — atende diretamente "os serviços podem
estar em servidores diferentes", sem nenhuma suposição de host único.

### Exemplo de ponta a ponta, sobre um caso real já cadastrado

Para tornar concreto o que "converter collect ↔ payload do serviço" significa na prática: o caso
device-init-data-loss (subject type technician) tem a hipótese multiple-linked-devices, que
coleta o concept technician-mobile-profile. Supondo que esse concept seja respondido por uma
capability cujo connector seja field-technician-directory-connector (o terceiro exemplo acima), e
que o subject resolvido para o pedido seja { type: "technician", attributes: [{ attribute:
"contract-number", value: "CTR-0001" }] }:

1. O adaptador resolve a capability do concept technician-mobile-profile e lê o descritor do
   connector field-technician-directory-connector.
2. Monta a URL: https://directory.another-vendor.example/lookup?apiKey=<valor do
   secret>&contract=CTR-0001 — {{subject.contract-number}} foi substituído por CTR-0001, e
   {{secret.DIRECTORY_API_KEY}} pelo valor lido da variável de ambiente correspondente.
3. Chama GET nessa URL, sem corpo, sem cabeçalho extra (headers_template está vazio neste
   exemplo).
4. O serviço responde 200 com um corpo como:
   { "records": [ { "technician": { "name": "Ana Souza", "badge": "TEC-4471" } } ] }
5. status_map traduz 200 para "ok". response_map extrai $.records[0].technician.name → "Ana
   Souza".
6. O adaptador devolve { result: "ok", observation: "{\"assignedTechnician\":\"Ana Souza\"}" } —
   exatamente o formato que citation-validation.ts espera encontrar, com a chave
   assignedTechnician batendo com o que o output_schema da capability já declarou.

## Onde isso mora

Uma tabela nova, fora do domínio, ao lado de capabilities mas nunca lida por ele:

```
CREATE TABLE http_connectors (
  connector           TEXT PRIMARY KEY,   -- mesmo valor de capabilities.connector
  method              TEXT NOT NULL CHECK (method IN ('GET', 'POST')),
  base_url            TEXT NOT NULL,
  path_template       TEXT NOT NULL,
  query_template       JSONB NOT NULL DEFAULT '{}',
  headers_template     JSONB NOT NULL DEFAULT '{}',
  body_template        JSONB,               -- null para GET
  response_map         JSONB NOT NULL,       -- toda chave de output_schema precisa aparecer aqui
  status_map           JSONB NOT NULL,
  request_timeout_ms    INTEGER
);
```

E, assim como registerCapability valida antes de gravar, um registerConnector faria o mesmo —
nunca INSERT cru:
- method só GET/POST;
- base_url/path_template não vazios;
- toda chave que o output_schema da capability correspondente declara em properties precisa ter
  uma entrada em response_map — é o que fecha o ciclo: se o juiz (LLM) pode citar um campo, esse
  campo tem que ter de onde vir de verdade.

NOTA DE ESCOPO: registerConnector é uma função interna e validada, no mesmo papel que
registerCapability já cumpre hoje — chamada por script, nunca uma operação HTTP publicada. Isso é
consistente com a decisão já tomada de que cadastro de conector continua direto contra o banco de
dados por enquanto: "direto no banco" aqui significa "sem superfície administrativa", não "sem
validação nenhuma" — a validação acima continua acontecendo antes de qualquer gravação, do mesmo
jeito que já acontece hoje com capacidades.

## O resolvedor de placeholders — a parte que converte "collect" ↔ "payload do serviço"

Um motor de substituição deliberadamente burro (nunca eval, nunca código arbitrário) com três
fontes possíveis:

| Placeholder | Resolve para |
|---|---|
| {{subject.<nome-do-atributo>}} | O valor daquele atributo no Subject recebido (ex.: subject.attributes.find(a => a.attribute === 'contract-number').value) |
| {{secret.<NOME>}} | Um valor lido de variável de ambiente/gestor de segredos — nunca texto puro na tabela |
| {{requester}} | O requester da chamada, se o serviço precisar dele para escopo |

O mesmo resolvedor roda sobre path_template, query_template, headers_template e body_template —
string por string, chave por chave — então funciona igual para "atributo vira parâmetro de URL" e
"atributo vira campo de JSON".

Um subject cujo atributo citado num placeholder não existir (por exemplo, um descritor pedindo
{{subject.serial-number}} quando o subject resolvido só carrega contract-number) é uma falha de
configuração a decidir nesta frente: recusar o cadastro do descritor se o atributo citado não
constar entre os subject-attributes que o concept correspondente aceita, em vez de deixar isso
estourar só em tempo de chamada.

Nota de segurança: {{secret.*}} nunca deve resolver para um valor armazenado como coluna de texto
simples numa tabela que qualquer leitura (inclusive um SELECT * de auditoria) alcança — só para
uma variável de ambiente ou um cofre de segredos, referenciada pelo nome, nunca pelo valor.

## O adaptador genérico — o algoritmo

```
observeConcept(concept, subject, requester):
  capability   = capabilities.readCapability(concept)          // já cadastrada (passo anterior do roteiro)
  descriptor   = connectorStore.readConnector(capability.connector)
  if descriptor ausente → erro de configuração (não é um dos 4 finais — é bug de cadastro)

  url     = descriptor.base_url + resolve(descriptor.path_template, subject, requester)
  query   = resolveMap(descriptor.query_template, subject, requester)
  headers = resolveMap(descriptor.headers_template, subject, requester)
  body    = descriptor.body_template ? resolveMap(descriptor.body_template, subject, requester) : undefined

  try:
    response = httpClient.request({
      method: descriptor.method, url, query, headers, body,
      timeoutMs: min(descriptor.request_timeout_ms, capability.timeout)   // nunca ultrapassa o timeout já declarado na capability
    })
  catch networkError:
    throw networkError    // falha genuína e inesperada — nunca um dos 4 finais, propaga como já é convenção

  ending = descriptor.status_map[response.status] ?? 'unavailable'   // status não mapeado = ausência de dado, não exceção
  if ending != 'ok':
    return { result: ending }

  observationObject = extractByJsonPath(descriptor.response_map, response.json())
  return { result: 'ok', observation: JSON.stringify(observationObject) }
```

Dois pontos que fecham exatamente o que você descreveu:

- "Não tenho controle sobre o payload de entrada" → o path_template/query_template/body_template
  são o tradutor: pegam os atributos do Subject (o formato que o collect já tem) e montam
  exatamente o formato que aquele serviço específico espera, seja parâmetro de URL ou corpo JSON.
- "Não tenho controle sobre o payload de saída" → response_map é o tradutor inverso: usa um
  caminho ($.data.currentStatus, um "JSONPath" simples) para ir buscar o valor dentro de qualquer
  estrutura de JSON que o serviço devolver, e monta um objeto plano cujas chaves são exatamente as
  que output_schema promete — o mesmo objeto que citation-validation.ts já espera encontrar dentro
  de observation.

SUGESTÃO TÉCNICA, não vinculante — todo o conteúdo desta seção (mecanismo de placeholders,
formato exato do descritor, algoritmo, sintaxe de caminho JSON) é a proposta de quem escreveu este
escopo, não um fato que a especificação declare. A task que entregar esta frente é livre para
adotar outra técnica de resolução, desde que continue valendo o que está declarado: o port
observation-source responde um dos quatro finais fechados por evidence-result, nunca lança exceção
para eles, e respeita o timeout que a capability já declara.

## Por que o timeout continua funcionando sem mudar nada

evidence-collection-stage.ts já faz a corrida contra effectiveBoundMsFor(capability,
stageCeilingMs) por fora do adaptador — então o adaptador genérico só precisa respeitar um timeout
de cliente HTTP igual ou menor que capability.timeout; a estação de coleta já garante que um
serviço lento nunca trava as outras.

## Cadastro operacional

Com isso, cadastrar um serviço externo novo vira, em ordem:

1. registerConnector(descriptor) — o "como chegar" naquele serviço, chamado por script, nunca
   por uma rota HTTP (ver nota de escopo acima).
2. registerCapability({ ..., connector: descriptor.connector, concept }) — o "o que ele responde",
   já existente.
3. Nenhum deploy novo, nenhuma classe nova — o mesmo HttpDeclarativeObservationSource atende
   todos.

Remover um sistema externo (o par simétrico de "novos sistemas podem surgir, antigos podem ser
deletados", já confirmado na análise): apagar o registro de http_connectors correspondente.
Concepts cuja capability aponte para um connector removido passam a resolver "unavailable" —
mesmo caminho que hoje já existe para um concept sem capability nenhuma registrada — nunca uma
exceção.

## O que ainda fica como decisão/trabalho em aberto

- Onde ficam os segredos de verdade — variável de ambiente por serviço (EQUIPMENT_STATUS_TOKEN,
  NOC_API_KEY, DIRECTORY_API_KEY, ...) ou um cofre externo — decisão operacional, não técnica. SERÁ
  ARMAZENADO EM BANCO DE DADOS COMO TEXTO SIMPLES, isto é suficiente para este MVP.
- Allowlist de hosts — como o base_url vira dado cadastrável, vale considerar uma lista de
  domínios permitidos, para que cadastrar um conector não vire uma porta para chamar qualquer
  endereço (risco de SSRF).
- Testabilidade — este adaptador é testável com um cliente HTTP falso e alguns descritores de
  fixture, no mesmo espírito do FakeObservationSource atual — nenhuma chamada real de rede num
  teste unitário.
- Versionamento do descritor — o que acontece quando o formato de resposta de um serviço já
  cadastrado muda (um response_map que hoje aponta para um caminho que o serviço deixou de
  devolver) — decidir se isso é tratado como erro de configuração a corrigir no cadastro, ou se
  merece um mecanismo de versão próprio.

## Fora de escopo, deliberadamente

Qualquer operação HTTP publicada para cadastrar conector, capacidade, conceito ou caso — cadastro
continua interno/script, como já decidido. Endurecimento de produção fora da coleta (autenticação
da rota de diagnóstico, custo/duração medidos de verdade, observabilidade) — tratado como
iniciativa própria, não parte deste plano.

Target: backend.

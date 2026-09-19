---
title: "Connector Registry: configuração"
order: 9
part: "Contexto Glossário e Integração"
status: written
sources:
  - src/src/connector-registry/connector-configuration.ts
  - src/src/connector-registry/connector-configuration-registry.service.ts
  - src/src/connector-registry/connector-configuration-store.port.ts
  - src/src/connector-registry/connector-placeholder-declaration-check.ts
  - src/src/connector-registry/capabilities-reader.port.ts
  - src/src/errors/connector-configuration-not-found.error.ts
  - src/src/errors/connector-configuration-not-well-formed.error.ts
  - src/src/errors/connector-placeholder-outside-input-schema.error.ts
  - src/src/errors/incomplete-connector-configuration.error.ts
---

Este arquivo deve detalhar o modelo `ConnectorConfiguration` — endereço, método, mapeamento de resposta e de status guardados como payload opaco que nenhum módulo de domínio interpreta — e o serviço de registro (`ConnectorConfigurationRegistryService`): validação de boa formação, checagem de placeholder órfão contra as capacidades registradas, leitura, leitura-ou-erro e listagem paginada. A geração de placeholders de credencial fica no arquivo `10-connector-registry-draft-openapi.md`, onde ela de fato é usada.

<slide>
# Connector Registry — configuração

Módulo: `src/src/connector-registry/`

Este tópico cobre como o sistema guarda e valida a **configuração de um conector** — o "como
chamar" um sistema externo — sem nunca entender o que está dentro dela.

Hoje: o modelo, o serviço de registro/leitura, e a checagem que impede uma configuração de
referenciar algo que nenhuma capacidade declara.
</slide>
<speach>
Bom, chegamos no Connector Registry. Antes de qualquer coisa: esse módulo não sabe fazer
requisição HTTP — quem faz isso é o `http-connector`, que a gente vê depois. Aqui a
responsabilidade é bem mais estreita: guardar, validar e devolver a configuração de um conector.
"Configuração" aqui quer dizer literalmente "como eu chamo esse sistema externo" — endereço,
verbo HTTP, como mapear a resposta. E o pulo do gato, que vocês vão ver já já, é que o domínio
não entende nada dessa configuração. Ela é tratada como texto opaco. Isso é proposital.
</speach>
</slide>

<slide>
# O tipo `ConnectorConfiguration`

`src/src/connector-registry/connector-configuration.ts`

```ts
export type ConnectorConfiguration = {
  readonly connector: string;
  readonly configuration: string;
};

export type ConnectorConfigurationRegistration = {
  readonly connector?: string;
  readonly configuration?: unknown;
};
```
</slide>
<speach>
Repara no tamanho desse arquivo: quatro linhas de tipo, e mais quatro de outro tipo. É tudo. E
isso já conta a história inteira: `configuration` é uma `string`. Não é um objeto tipado com
`endpoint`, `method`, `headers` — é uma string. Uma string que por dentro é um JSON, mas que o
domínio se recusa a conhecer a forma interna. Por quê? Porque o endereço, o verbo, o mapeamento
de resposta variam de conector para conector, e o time que mantém esse serviço não quer estar no
caminho toda vez que alguém precisa integrar um sistema novo com um shape de configuração
diferente. Essa é a "guarda como payload opaco" que o README menciona.

O segundo tipo, `ConnectorConfigurationRegistration`, é o formato de entrada — antes de virar um
`ConnectorConfiguration` válido, os dois campos são opcionais e `configuration` é `unknown`.
Ou seja: alguém pode mandar qualquer coisa nesse campo, e é trabalho do serviço decidir se aquilo
é aceitável.
</speach>
</slide>

<slide>
# `IConnectorConfigurationStore` — a porta

`src/src/connector-registry/connector-configuration-store.port.ts`

```ts
export interface IConnectorConfigurationStore {

  readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]>;

  writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;
}
```
</slide>
<speach>
Essa é a porta que isola o serviço de registro de como as configurações são persistidas. Reparem
que ela não tem `readOne`/`writeOne` — é sempre a lista inteira. Isso é uma pista de como o
serviço por cima dela vai implementar upsert: lê tudo, filtra o que não é o conector que está
sendo registrado, e escreve a lista de volta com o novo item. A gente vê isso no próximo slide.
Quem implementa essa interface de verdade é `RelationalConnectorConfigurationStore`, que fica em
`src/persistence/` — mas isso é assunto da Parte 6 deste material.
</speach>
</slide>

<slide>
# `ConnectorConfigurationRegistryService` — construção

`src/src/connector-registry/connector-configuration-registry.service.ts`

```ts
const NO_REGISTERED_CAPABILITIES: ICapabilitiesReader = {
  readCapabilities: () => Promise.resolve([]),
};

export class ConnectorConfigurationRegistryService {
  public constructor(
    private readonly store: IConnectorConfigurationStore,
    private readonly capabilitiesReader: ICapabilitiesReader = NO_REGISTERED_CAPABILITIES,
  ) {}
  ...
}
```
</slide>
<speach>
O serviço recebe duas dependências: o store que a gente acabou de ver, e um `ICapabilitiesReader`
— que sabe ler quais capacidades estão registradas para checar se um placeholder da configuração
tem lastro em alguma capacidade. Reparem no valor padrão: `NO_REGISTERED_CAPABILITIES`. Se
ninguém injetar um leitor de capacidades de verdade, o serviço assume que não existe nenhuma
capacidade — e, como a gente vai ver, isso na prática desliga a checagem de placeholder órfão.
Isso é uma escolha deliberada para permitir compor o serviço em contextos onde essa checagem
ainda não faz sentido, como durante um registro isolado em teste.
</speach>
</slide>

<slide>
# `ICapabilitiesReader` — a porta auxiliar

`src/src/connector-registry/capabilities-reader.port.ts`

```ts
export type RegisteredCapabilityForPlaceholderCheck = {
  readonly connector: string;
  readonly input_schema: string;
};

export interface ICapabilitiesReader {

  readCapabilities(): Promise<readonly RegisteredCapabilityForPlaceholderCheck[]>;
}
```
</slide>
<speach>
Notem que essa porta não devolve a `Capability` inteira do capability-registry — devolve só o
suficiente para a checagem que vamos ver: o nome do conector e o `input_schema`. Isso é uma
projeção deliberadamente estreita: o connector-registry não precisa, e não deveria precisar,
conhecer tudo sobre uma capacidade. Só o que ele precisa para fazer seu trabalho.
</speach>
</slide>

<slide>
# `registerConnector` — o fluxo de registro

```ts
public async registerConnector(
  registration: ConnectorConfigurationRegistration,
): Promise<ConnectorConfiguration> {
  const configuration = heldConfiguration(registration);
  await this.refuseOrphanedPlaceholders(configuration);
  const held = await this.store.readConnectorConfigurations();
  const kept = held.filter((candidate) => candidate.connector !== configuration.connector);
  await this.store.writeConnectorConfigurations([...kept, configuration]);
  return configuration;
}
```
</slide>
<speach>
Aqui está o coração do serviço. Quatro passos: primeiro, `heldConfiguration` valida e normaliza o
que chegou — a gente vê o que isso faz no próximo slide. Segundo, `refuseOrphanedPlaceholders`
checa se a configuração usa algum placeholder que nenhuma capacidade declara — se usar, lança
erro e para tudo ali. Terceiro e quarto: lê tudo que já está registrado, tira o conector que está
sendo re-registrado (se já existia), e escreve a lista de novo com a nova versão dentro. Ou seja:
registrar um conector que já existe **substitui** a configuração anterior — não há um "update"
separado de um "create", é a mesma operação. E não tem checagem de duplicidade por leitura prévia
tipo "se já existe, recusa" — é sempre upsert.
</speach>
</slide>

<slide>
# Validando a forma: `heldConfiguration`

```ts
function heldConfiguration(registration: ConnectorConfigurationRegistration): ConnectorConfiguration {
  const resolved: ConnectorConfigurationRegistration = {
    connector: registration.connector,
    configuration: wellFormedConfiguration(registration.configuration),
  };
  refuseRegistrationDepartures(resolved);
  return { connector: resolved.connector, configuration: resolved.configuration };
}

function wellFormedConfiguration(configuration: unknown): unknown {
  if (typeof configuration === 'string') {
    return textConfigurationOrThrow(configuration);
  }
  if (isPlainObject(configuration)) {
    return JSON.stringify(configuration);
  }
  if (configuration === null || Array.isArray(configuration)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not a JSON object');
  }
  return configuration;
}
```
</slide>
<speach>
`configuration` chega como `unknown` — pode ser praticamente qualquer coisa. `wellFormedConfiguration`
aceita dois formatos de entrada: uma string (que precisa ser JSON válido representando um objeto —
função `textConfigurationOrThrow`, próximo slide) ou um objeto plano de verdade, que aí é
serializado com `JSON.stringify`. `null` e array são recusados explicitamente. Qualquer outra
coisa — número, boolean — passa direto por esse `if`/`else` sem virar erro aqui, mas repara que
ela não vira string também: isso é pego depois, em `registrationProblems`, que checa
`typeof registration.configuration !== 'string'`. Então a validação de forma acontece em duas
etapas complementares.
</speach>
</slide>

<slide>
# Validando o JSON: `textConfigurationOrThrow`

```ts
function textConfigurationOrThrow(configuration: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configuration);
  } catch {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not syntactically valid JSON');
  }
  if (!isPlainObject(parsed)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object');
  }
  return configuration;
}
```

Erro: `ConnectorConfigurationNotWellFormedError`
> "the registry refuses a registration whose configuration is not syntactically valid JSON object text: ..."
</slide>
<speach>
Duas checagens em sequência: primeiro, o `JSON.parse` não pode falhar — senão a string nem é
JSON. Segundo, o resultado do parse precisa ser um objeto plano — não pode ser um array, um
número, uma string dentro de string. Os dois casos caem no mesmo erro,
`ConnectorConfigurationNotWellFormedError`, só muda a mensagem de razão. Reparem que a função
devolve a `configuration` original, não o `parsed` — ela só valida, não reformata. O que fica
gravado é exatamente o texto que chegou.
</speach>
</slide>

<slide>
# Validando completude: `registrationProblems`

```ts
function refuseRegistrationDepartures(
  registration: ConnectorConfigurationRegistration,
): asserts registration is DeclaredRegistration {
  const problems = registrationProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteConnectorConfigurationError(problems);
  }
}

function registrationProblems(registration: ConnectorConfigurationRegistration): string[] {
  const problems: string[] = [];
  if (isUndeclared(registration.connector)) {
    problems.push('connector is undeclared');
  }
  if (typeof registration.configuration !== 'string') {
    problems.push('configuration is not a plain object');
  }
  return problems;
}
```
</slide>
<speach>
Essa função acumula **todos** os problemas antes de lançar — não para no primeiro. Se faltar o
nome do conector e a configuration não virou string, o erro `IncompleteConnectorConfigurationError`
vem com as duas razões juntas, unidas por `; `. Isso importa pra quem está integrando: em vez de
corrigir um campo, rodar de novo, achar outro problema, corrigir, rodar de novo — a pessoa já
recebe a lista completa do que está faltando de uma vez.

Reparem também na assinatura: `asserts registration is DeclaredRegistration`. É um type guard do
TypeScript — depois dessa chamada, o compilador passa a tratar `registration.connector` como
`string` garantida, não mais `string | undefined`. É assim que `heldConfiguration` consegue
devolver um `ConnectorConfiguration` com `connector` obrigatório sem outra checagem.
</speach>
</slide>

<slide>
# A checagem de placeholder órfão

```ts
private async refuseOrphanedPlaceholders(configuration: ConnectorConfiguration): Promise<void> {
  const capabilities = (await this.capabilitiesReader.readCapabilities()).filter(
    (capability) => capability.connector === configuration.connector,
  );
  const orphaned = orphanedAcrossEveryCapability(configuration.configuration, capabilities);
  if (orphaned.length > 0) {
    throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);
  }
}

function orphanedAcrossEveryCapability(
  configurationText: string,
  capabilities: readonly RegisteredCapabilityForPlaceholderCheck[],
): readonly OrphanedPlaceholder[] {
  if (capabilities.length === 0) {
    return [];
  }
  const perCapabilityOrphaned = capabilities.map(
    (capability) => new Set(orphanedPlaceholders(configurationText, capability.input_schema)),
  );
  const [first, ...rest] = perCapabilityOrphaned;
  const orphanedEverywhere = [...first].filter((placeholder) => rest.every((set) => set.has(placeholder)));
  return orphanedEverywhere.map((placeholder) => ({ placeholder, capabilities }));
}
```
</slide>
<speach>
Essa é a parte mais sutil do módulo, então vamos com calma. Primeiro, filtra as capacidades pelo
conector que está sendo registrado — só interessam as que apontam pra esse conector. Se não
sobrar nenhuma capacidade — lembrem do `NO_REGISTERED_CAPABILITIES` do slide anterior, ou um
conector recém-criado sem nenhuma capacidade ainda — a função devolve lista vazia e não recusa
nada. Isso é intencional: não dá pra checar órfão contra um universo vazio de capacidades.

Agora o miolo: pra cada capacidade daquele conector, calcula o conjunto de placeholders que a
configuração usa e que **não** estão no `input_schema` daquela capacidade específica —
isso é o `orphanedPlaceholders`, que a gente vê no próximo slide. Só que uma configuração é
compartilhada por várias capacidades do mesmo conector, cada uma com seu próprio `input_schema`.
Então a regra final é: um placeholder só é considerado de fato "órfão" — motivo pra recusar o
registro — se ele estiver ausente do `input_schema` de **todas** as capacidades daquele conector,
não só de uma. Daí o `rest.every((set) => set.has(placeholder))`: pega os órfãos da primeira
capacidade e mantém só os que também aparecem como órfãos em todas as outras.
</speach>
</slide>

<slide>
# `orphanedPlaceholders` — a função de comparação

`src/src/connector-registry/connector-placeholder-declaration-check.ts`

```ts
import { declaredInputSchemaShape } from '../capability-registry/capability-input-schema-shape.js';
import { subjectAttributePlaceholderNamesIn } from '../http-connector/connector-request-resolver.js';

export function orphanedPlaceholders(
  configurationText: string,
  inputSchema: string | undefined,
): readonly string[] {
  const { properties } = declaredInputSchemaShape(inputSchema);
  return subjectAttributePlaceholderNamesIn(configurationText).filter((name) => !properties.includes(name));
}
```
</slide>
<speach>
Essa função de nove linhas atravessa três módulos diferentes, o que já mostra como esse sistema é
costurado por interfaces pequenas. `subjectAttributePlaceholderNamesIn`, que mora no
`http-connector` — visto no arquivo 11 deste material —, extrai da configuração todo nome de
placeholder no formato `${subject:<atributo>}`. `declaredInputSchemaShape`, do
`capability-registry`, olha o `input_schema` da capacidade e devolve as propriedades que ele
declara. A checagem em si é uma linha: filtra os placeholders que **não** estão entre as
propriedades declaradas. Reparem que essa função é reaproveitada em três lugares diferentes do
código: aqui no registro de conector, na validação de uma capacidade
(`capability-registry.service.ts`), e no `test-connector.controller.ts` — sempre a mesma pergunta,
"esse placeholder tem lastro no schema declarado?".
</speach>
</slide>

<slide>
# Lendo uma configuração

```ts
export type ConnectorConfigurationResolution =
  | { readonly held: true; readonly configuration: ConnectorConfiguration }
  | { readonly held: false; readonly connector: string };

public async readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution> {
  const held = await this.store.readConnectorConfigurations();
  const configuration = held.find((candidate) => candidate.connector === connector);
  return configuration === undefined ? { held: false, connector } : { held: true, configuration };
}

public async readConnectorConfigurationOrThrow(connector: string): Promise<ConnectorConfiguration> {
  const resolution = await this.readConnectorConfiguration(connector);
  if (!resolution.held) {
    throw new ConnectorConfigurationNotFoundError(resolution.connector);
  }
  return resolution.configuration;
}
```
</slide>
<speach>
Duas formas de ler, pra dois tipos de consumidor. `readConnectorConfiguration` devolve uma union
discriminada — `held: true` ou `held: false` — pra quem quer decidir o que fazer com a ausência
sem lidar com exceção, por exemplo uma tela de detalhe que mostra "conector ainda não configurado"
em vez de dar erro. `readConnectorConfigurationOrThrow` é o atalho pra quem só quer a configuração
ou uma falha — como a etapa de coleta de evidência, que se não tem a configuração do conector não
tem como seguir, então prefere lançar `ConnectorConfigurationNotFoundError` direto.

O padrão de nomear o par "algo" / "algoOrThrow" reaparece bastante nesse código-base — é bom já
internalizar isso agora porque volta em outros contextos.
</speach>
</slide>

<slide>
# Listando com paginação

```ts
public async listConnectorConfigurations(
  pagination: PaginationRequest,
): Promise<PaginatedResponse<ConnectorConfiguration>> {
  const held = await this.store.readConnectorConfigurations();
  const total = held.length;
  const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
  return {
    data,
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    pageCount: pageCountOf(total, pagination.limit),
  };
}

function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}
```
</slide>
<speach>
Vale notar uma coisa sobre performance aqui, porque é o tipo de detalhe que passa despercebido até
virar problema: a paginação é feita em memória, depois de ler **todas** as configurações do
store. Isso é aceitável hoje porque o volume de conectores configurados é pequeno — mas se algum
dia isso crescer bastante, esse é o primeiro lugar a olhar. `pageCountOf` é só uma divisão com
arredondamento pra cima, com proteção contra `limit` zero ou negativo.
</speach>
</slide>

<slide>
# Fechando o tópico

O que este módulo garante, de ponta a ponta:

- `ConnectorConfiguration` é opaca por design — o domínio guarda, não interpreta.
- Registrar é sempre upsert: lê tudo, substitui pelo `connector`, escreve tudo.
- Duas camadas de validação: forma (JSON bem-formado) e completude (campos obrigatórios).
- Um placeholder só é recusado se estiver órfão em **todas** as capacidades do conector.

Próximo: `10-connector-registry-draft-openapi.md` — como uma configuração nasce, a partir de um
documento OpenAPI, antes de chegar pronta neste registro.
</slide>
<speach>
Resumindo: esse módulo é pequeno em número de conceitos de negócio, mas denso em decisões de
validação. Vale a pena voltar aqui sempre que mexerem em qualquer uma das quatro coisas que
acabei de listar, porque são exatamente os pontos onde uma mudança de comportamento tende a
acontecer sem ninguém perceber de primeira. No próximo tópico a gente vê de onde essa configuração
costuma vir na prática — não digitada à mão, mas gerada a partir de um documento OpenAPI do
sistema externo.
</speach>
</slide>

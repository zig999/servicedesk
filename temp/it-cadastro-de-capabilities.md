# Instrução de trabalho — cadastro de `Concept`, `Capability` e `ConnectorConfiguration`

Instrução autocontida para **cadastrar uma nova integração de leitura** em um motor de
investigação orientado a hipóteses. Este documento define sozinho tudo o que as três
entidades abaixo precisam declarar e todas as regras que um cadastro válido precisa
satisfazer — não pressupõe nenhum conhecimento prévio do sistema. O objetivo final é
gerar os arquivos JSON de saída que permitem, depois, o cadastro efetivo de cada entidade
no sistema. Onde este documento não decidir um valor, quem decide é a equipe responsável
pela integração real que está sendo cadastrada; nunca invente em silêncio um valor que a
integração real não sustenta.

---

## 1. O que você está cadastrando

O sistema investiga um problema testando **hipóteses**. Cada hipótese precisa observar
um ou mais **conceitos** (fatos nomeados sobre o assunto investigado — ex.: "o status do
equipamento", "se há uma queda de rede na área"). O sistema, sozinho, não sabe o que é
esse fato nem como observá-lo: as duas coisas vêm de fora, através de **três cadastros
encadeados**, nesta ordem de dependência:

1. **`Concept`** — o **nome** de um fato observável (ex.: `"equipment-status"`), mais duas
   garantias sobre ele: para quais tipos de assunto ele faz sentido, e por quanto tempo uma
   observação dele continua "fresca". Só diz *o que é o fato*, nunca *como observá-lo*.
2. **`Capability`** — o registro de negócio: "existe uma integração real, que eu controlo,
   capaz de responder a este conceito específico, e é assim que sua resposta se parece."
   Aponta para um `Concept` já existente (passo 1) por nome.
3. **`ConnectorConfiguration`** — o registro técnico, separado: "e é *assim* que essa
   integração é chamada de verdade" (endereço, método HTTP, cabeçalhos, como extrair a
   resposta). Uma capability nunca guarda isso diretamente — ela só aponta, por nome, para
   o conector que sabe fazer essa chamada.

As três são registros **independentes**, guardados em lugares diferentes do sistema:

```
Concept  ◄──(concept)── Capability  ◄──(connector)── ConnectorConfiguration
"o que é o fato"        "quem responde,               "como chamar de
                         e o formato da                 verdade"
                         resposta"
```

Cada seta é apenas **um nome em comum** entre dois registros vizinhos — não existe um
identificador técnico único, uma chave estrangeira formal ou um vínculo automático: é
responsabilidade de quem cadastra garantir que os nomes batem, caractere por caractere,
entre um registro e o próximo. Cadastrar uma peça sem a outra é possível (o sistema não
impede o cadastro isolado de nenhuma das três) — mas **a integração só funciona de ponta a
ponta quando as três existirem, com os nomes concordando entre si**. Faltando qualquer
uma, o problema só aparece depois, na hora de tentar coletar de verdade — nunca no
momento do cadastro em si.

Regras de fundo que todo cadastro precisa respeitar, antes de qualquer campo:

- **Uma capability só pode ler, nunca agir sobre o mundo.** O sistema diagnostica e
  encaminha; ele nunca aciona nada em nome de ninguém. Se a integração que você está
  cadastrando **muda** algum estado (abre um chamado, altera um cadastro, reinicia um
  equipamento), ela **não é uma capability válida** para este cadastro — não tente
  contornar isso classificando-a incorretamente como leitura.
- **Uma capability responde a exatamente um conceito.** Se a mesma integração real
  souber responder a mais de um conceito (ex.: um único endpoint que devolve status *e*
  localização), cadastre **uma capability por conceito** — as duas podem, inclusive,
  apontar para o **mesmo** `connector`, já que uma configuração de conector não é
  exclusiva de uma única capability.
- **Cada conceito só pode ter uma capability respondendo por ele por vez.** Se duas
  integrações diferentes soubessem responder ao mesmo conceito, o sistema não teria como
  escolher entre elas — por isso o cadastro de uma segunda capability para um conceito já
  respondido por outra é sempre recusado (ver §3.3).

Você produz, normalmente, **um JSON de `Concept` (se ainda não existir), um JSON de
`Capability` e um JSON de `ConnectorConfiguration` por integração** — cada um com os
campos descritos em §2, §3 e §4, que a equipe responsável pelo sistema efetivamente
cadastra nos respectivos registros do projeto.

---

## 2. `Concept` — o nome do fato observável

Um **conceito** é o vocabulário central que todo o resto do sistema compartilha: uma
hipótese cita conceitos para dizer o que precisa observar; uma capability cita um conceito
para dizer a qual pergunta ela responde. O conceito em si é deliberadamente simples — só
o nome e duas garantias, nunca o formato dos dados que ele representa (isso é papel da
capability, §3.2).

### 2.1 Pré-requisito: o tipo de assunto (`subject-type`) já precisa existir

Antes de cadastrar um conceito, confirme que todo **tipo de assunto** que ele vai aceitar
(campo `accepts`, abaixo) já está publicado no glossário do projeto como um `subject-type`
— o nome do tipo de "coisa" que o sistema investiga (ex.: `"contract"`, `"customer"`, um
elemento de rede). Um tipo de assunto é só um nome, nada mais — não tem campos próprios
além dele. Se o tipo de assunto que você precisa ainda não existe, sinalize à equipe
responsável pelo projeto antes de prosseguir — publicar um tipo de assunto novo está fora
do escopo deste documento.

### 2.2 Estrutura completa de um `Concept`

Um conceito tem três campos. Dois são obrigatórios; um tem valor padrão.

| Campo | Obrigatório | Tipo | Preenchimento |
|---|---|---|---|
| `name` | sim | string | O nome do conceito — o identificador que hipóteses e capabilities vão citar (ex.: `"equipment-status"`). Recomenda-se `kebab-case`, descrevendo o fato observado, nunca a integração que o produz (ex.: `"equipment-status"`, não `"acme-api-equipment-status"`). |
| `accepts` | sim | lista de strings, pelo menos um item | Os nomes dos tipos de assunto (§2.1) para os quais este conceito faz sentido (ex.: `["contract"]`). Cada nome precisa já existir como `subject-type` no glossário do projeto. Uma lista vazia não tem sentido — um conceito que não aceita nenhum tipo de assunto nunca poderia ser citado por hipótese alguma. |
| `ttl` | recomendado — sem valor padrão garantido no banco | integer (segundos) | Por quanto tempo uma observação deste conceito ainda é considerada "fresca" o suficiente para ser reaproveitada em vez de coletada de novo. **Declare sempre um valor explícito** — ver a nota de risco abaixo. |

**Nota de risco sobre `ttl`:** parte do código de leitura deste sistema sabe assumir 60
segundos quando um registro não declara `ttl` — mas isso só vale para o caminho de
leitura, e a tabela onde os conceitos são gravados **exige um valor de `ttl` no momento da
escrita** (a coluna não aceita ficar em branco). Ou seja: **na prática, ao gerar o JSON de
cadastro, sempre inclua um `ttl` explícito** — nunca conte com um valor padrão sendo
aplicado silenciosamente na gravação. Se a equipe responsável não souber informar um valor
real, proponha `60` como ponto de partida e registre isso como suposição (ver §5).

### 2.3 Regras de validação — o que é aceito e o que é recusado

**Diferente de `Capability` e `ConnectorConfiguration` (§3 e §4), não existe hoje, neste
sistema, um serviço de cadastro que valide e recuse um `Concept` malformado com uma
mensagem de erro amigável.** Um conceito é gravado como uma linha de banco de dados
direta, protegida apenas pelas restrições do próprio banco:

1. **`name` precisa ser único.** Cadastrar dois conceitos com o mesmo nome não é possível
   — o segundo cadastro colide com o primeiro (o banco recusa a segunda linha).
2. **`ttl` precisa estar preenchido** no momento da escrita (ver a nota de risco em §2.2)
   — uma tentativa de gravar um conceito sem `ttl` falha no nível do banco, não com uma
   mensagem de negócio explicando o motivo.
3. **Todo nome listado em `accepts` precisa já existir como `subject-type`** publicado no
   glossário (§2.1) — o banco recusa a gravação de um `accepts` apontando para um tipo de
   assunto inexistente.
4. **Não existe um mecanismo de "corrigir reenviando o mesmo nome"** análogo ao de
   `Capability`/`ConnectorConfiguration` (§3.3/§4.5) — trate um conceito já cadastrado como
   definitivo; qualquer correção de conteúdo é uma operação separada, fora do escopo deste
   cadastro, e deve ser tratada com cuidado pela equipe responsável pelo projeto (pode
   exigir remover e recriar o registro).

Como não há uma recusa automática amigável para a maioria dos erros de conteúdo (uma
lista `accepts` vazia, por exemplo), trate as regras acima como uma **disciplina a seguir
por conta própria** ao gerar o JSON — não como algo que o sistema vá necessariamente
barrar sozinho.

---

## 3. `Capability` — o registro de negócio da integração

Uma capability é o registro de "existe uma integração real, que eu controlo, capaz de
responder a este conceito específico — e é assim que ela deve ser chamada e como sua
resposta se parece."

### 3.1 Estrutura completa de uma `Capability`

Uma capability tem oito campos. Sete são obrigatórios; um é opcional com valor padrão.

| Campo | Obrigatório | Tipo | Preenchimento |
|---|---|---|---|
| `name` | sim | string | O nome da capability em si — um identificador estável para "esta integração específica" (ex.: `"equipment-status-reader"`). Recomenda-se `kebab-case`, terminando em algo que descreva a ação (`-reader`, `-lookup`, `-query`). |
| `version` | sim | string | A versão **desta** capability, no esquema de versionamento que a própria integração/fornecedor usa (ex.: `"1.0.0"`, ou uma data, ou o número de versão da API que ela chama). O sistema não impõe um formato específico — só exige que não fique vazio. `name` + `version` juntos identificam este registro de forma única (ver §3.3, "reenvio"). |
| `nature` | sim | string (`"read-only"` ou `"mutating"`) | **Use sempre `"read-only"`.** É o único valor que o cadastro aceita hoje — o outro valor existe apenas para que o sistema tenha algo explícito para recusar (ver §3.3). Nunca cadastre uma integração que altera dados classificando-a como `"read-only"` só para o cadastro passar — isso violaria a garantia central do sistema (§1). |
| `input_schema` | sim | string | Uma descrição do que a integração real espera receber para ser chamada (por exemplo, um identificador do parâmetro de entrada, ou o texto de um schema descrevendo os campos de entrada). O sistema hoje **não interpreta o conteúdo** deste campo — ele apenas exige que não esteja vazio. Ainda assim, preencha-o de forma útil e honesta: quem for operar ou depurar esta integração no futuro vai ler este campo para saber o que ela espera receber. Recomenda-se um texto curto e estável (ex.: `"contract-identifier-input"`) ou um schema JSON real, seguindo o mesmo formato do `output_schema` abaixo. |
| `output_schema` | sim | string (texto JSON) | **O campo mais importante do cadastro da capability.** Descreve o formato da resposta que a integração devolve, como um texto JSON contendo um objeto com uma chave de nível superior chamada `properties`. Cada chave dentro de `properties` é o nome de **um campo que a resposta desta integração declara** — e são exatamente esses nomes de campo que o motor de julgamento poderá citar depois, como prova de uma decisão. Ver o formato exato e um exemplo em §3.2. |
| `timeout` | não — padrão **60000** | integer (milissegundos) | Por quantos milissegundos o sistema espera por uma resposta desta integração antes de desistir e registrar a tentativa como "tempo esgotado". Se você não informar este campo, o sistema assume **60000** (60 segundos). **Sempre um número inteiro** — nunca uma fração de milissegundo. Recomenda-se declarar um valor realista e mais curto que o padrão (ex.: `3000` a `5000`) sempre que a integração real tiver uma latência típica conhecida, para que o sistema degrade rápido em vez de esperar o padrão inteiro. |
| `connector` | sim | string | O nome do adaptador/conector técnico que efetivamente sabe conversar com esta integração — quem, na prática, faz a chamada. É um identificador opaco para o restante do sistema (ex.: `"corporate-records-equipment-status-connector"`); recomenda-se o padrão `<sistema-de-origem>-<conceito>-connector`. **Este é o nome que precisa ter uma `ConnectorConfiguration` própria (§4) para a integração funcionar de ponta a ponta.** |
| `concept` | sim | string | O nome **exato** do conceito (§2) que esta capability responde — precisa bater, caractere por caractere, com um `name` já publicado no glossário. Este é o campo que o sistema usa para descobrir, mais tarde, "quem responde a este conceito?" |

### 3.2 Como escrever o `output_schema` corretamente

O `output_schema` precisa ser um texto que, ao ser interpretado como JSON, resulte em um
objeto com uma chave `properties`, cujas chaves internas são os nomes dos campos que a
resposta da integração carrega. Formato mínimo recomendado:

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string" }
  }
}
```

Neste exemplo, a resposta da integração declara **um único campo, chamado `status`**.
Se a resposta real tiver mais de um campo relevante, liste todos:

```json
{
  "type": "object",
  "properties": {
    "active": { "type": "boolean" },
    "since": { "type": "string" }
  }
}
```

Regras práticas para este campo:

- **Só os nomes de nível superior dentro de `properties` importam** para o restante do
  sistema hoje — o tipo declarado em cada campo (`"string"`, `"boolean"` etc.) é
  informativo, mas não é obrigatório para o funcionamento do cadastro. Ainda assim,
  declare o tipo real: é o que torna este documento útil como referência futura.
  Estruturas aninhadas (um objeto dentro de outro campo) também são aceitas, mas os
  campos de dentro delas **não** viram vocabulário citável — só os nomes de primeiro
  nível o são. Prefira, sempre que possível, uma resposta "achatada", com todos os
  campos relevantes em `properties` diretamente.
- Se o texto informado **não for um JSON válido**, ou não tiver a chave `properties`, o
  cadastro **ainda é aceito** (o sistema não recusa um `output_schema` malformado na hora
  do cadastro) — mas, na prática, **nenhum campo dessa capability poderá ser citado
  depois**, o que faz qualquer julgamento baseado nela terminar sempre como
  "inconclusivo". Trate um `output_schema` malformado como um defeito grave do cadastro,
  mesmo que ele não seja barrado automaticamente.
- Escolha nomes de campo estáveis e descritivos (`status`, `active`, `last_seen_at`) —
  eles vão aparecer, futuramente, em citações de auditoria, então evite abreviações
  obscuras.
- **Os mesmos nomes de campo que aparecem aqui em `properties` precisam reaparecer no
  `responseMap` da configuração do conector (§4.2)** — são as duas metades da mesma
  promessa: a capability diz "eu devolvo um campo chamado `status`", e a configuração do
  conector diz "e é *aqui* dentro da resposta HTTP que esse campo mora".

### 3.3 Regras de validação — o que é aceito e o que é recusado

Antes de considerar um cadastro de capability pronto, confira cada uma destas regras:

1. **Todo campo obrigatório precisa estar preenchido e não-vazio**: `name`, `version`,
   `nature`, `input_schema`, `output_schema`, `connector`, `concept`. Um cadastro com
   qualquer um desses ausente ou vazio é recusado por completo — e a recusa aponta,
   **de uma vez**, todos os campos que faltam (nunca só o primeiro encontrado).
2. **`nature` precisa ser exatamente `"read-only"`.** Qualquer outro valor —
   especialmente `"mutating"` — é sempre recusado. Não existe hoje, e não deve existir,
   um caminho para cadastrar uma capability que atua sobre o mundo.
3. **`timeout`, se informado, precisa ser um número inteiro de milissegundos.** Um valor
   fracionário (ex.: `1500.5`) é recusado.
4. **O `concept` declarado precisa já existir no glossário do projeto** (§2). Cadastrar
   uma capability apontando para um conceito inexistente falha — trate isso como um
   defeito de pré-requisito, não como um erro de preenchimento: resolva publicando o
   conceito primeiro.
5. **Um conceito só pode ter uma capability respondendo por ele.** Se você tentar
   cadastrar uma capability nova (`name`+`version` diferentes de qualquer registro
   existente) para um `concept` que **já tem outra capability diferente** respondendo
   por ele, o cadastro é recusado — a recusa informa qual capability (nome e versão) já
   responde por aquele conceito. Para trocar de integração para o mesmo conceito, é
   preciso primeiro descadastrar (ou aguardar a remoção de) a capability antiga.
6. **Reenviar o mesmo `name` + `version`, de propósito, substitui o registro anterior por
   completo** — não é um erro, é o mecanismo previsto para **corrigir** um cadastro já
   feito (por exemplo, ajustar um `timeout` ou um `output_schema` errado). Ao corrigir,
   reenvie **todos** os campos, mesmo os que não mudaram — o registro novo substitui o
   antigo inteiro, nunca é mesclado campo a campo com o que já existia.

---

## 4. `ConnectorConfiguration` — o registro técnico da chamada

Enquanto a capability é o registro de **negócio** ("existe uma integração, e é isto que
ela responde"), a `ConnectorConfiguration` é o registro **técnico**: como, na prática,
alcançar essa integração pela rede. É um registro à parte, guardado em um lugar diferente
do sistema, e a única coisa que liga um ao outro é o nome do `connector`.

### 4.1 Estrutura completa de uma `ConnectorConfiguration`

Uma configuração de conector tem apenas dois campos de alto nível:

| Campo | Obrigatório | Tipo | Preenchimento |
|---|---|---|---|
| `connector` | sim | string | O identificador do conector — precisa ser **idêntico**, caractere por caractere, ao `connector` declarado em uma ou mais capabilities (§3.1). É a chave deste registro: só pode existir uma configuração por nome de conector. |
| `configuration` | sim | objeto (JSON) | Um payload livre, específico da tecnologia de chamada usada. O sistema não impõe uma forma fixa para este campo em geral — só exige que seja um objeto (nunca uma lista, uma string ou um número soltos). **Para o único mecanismo de chamada que este sistema executa hoje — chamadas HTTP — o formato esperado é o descrito em §4.2.** |

### 4.2 O formato de `configuration` para conectores HTTP

Hoje, toda integração real que este sistema chama é feita por **HTTP** — não existe (ainda)
suporte a outro protocolo. Para que a chamada funcione, o objeto `configuration` de um
conector HTTP precisa declarar estes campos:

| Campo | Obrigatório | Tipo | Preenchimento |
|---|---|---|---|
| `address` | sim | string | **A URL** a ser chamada. Pode (e normalmente deve) conter um ou mais placeholders `${...}` (ver §4.3) em vez de valores fixos — por exemplo, o identificador do assunto investigado, que muda a cada chamada. |
| `method` | sim | string | Um destes cinco valores, exatamente: `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`. Qualquer outro valor é recusado. |
| `query` | não | objeto string→string | Parâmetros de query string a anexar à URL (ex.: `{"format": "json"}`). Cada valor também pode conter placeholders. Se omitido, nenhum parâmetro extra é anexado. |
| `headers` | não | objeto string→string | Cabeçalhos HTTP a enviar (ex.: `{"Authorization": "Bearer ${credential:ACME_API_KEY}"}`). Cada valor também pode conter placeholders — **é assim, e só assim, que uma credencial deve entrar aqui** (ver §4.3). |
| `body` | não | qualquer valor JSON | O corpo da requisição, para métodos que o admitem. Pode ser um objeto aninhado, uma lista ou um valor simples; qualquer string dentro dele (em qualquer nível) também pode conter placeholders. Omita para uma chamada sem corpo (ex.: um `GET` simples). |
| `responseMap` | sim | objeto string→string | O mapa que diz **onde**, dentro da resposta JSON recebida, encontrar cada campo que a capability declarou em seu `output_schema` (§3.2). A chave é o nome do campo (precisa bater com uma chave de `properties`); o valor é o caminho até ele dentro do corpo da resposta (ex.: `"data.equipmentStatus"` para buscar `body.data.equipmentStatus`). |
| `statusMap` | sim | objeto string→string | O mapa que traduz um código de status HTTP recebido (como texto, ex.: `"200"`, `"404"`) para um destes quatro desfechos: `"ok"`, `"unavailable"`, `"denied"`, `"timeout"`. Um status recebido que não estiver neste mapa é tratado como `"unavailable"` por padrão — declare todos os status relevantes explicitamente em vez de depender desse padrão silencioso. |

### 4.3 A mini-linguagem de placeholders `${...}`

Dentro de `address`, `query`, `headers` e `body`, qualquer trecho de texto entre `${` e `}`
é substituído automaticamente, no momento da chamada, por um valor real. Existem exatamente
três tipos:

| Placeholder | Substituído por | Exemplo |
|---|---|---|
| `${subject:<atributo>}` | O valor do atributo `<atributo>` do assunto sendo investigado. | `${subject:contract-id}` |
| `${requester}` | A identidade de quem pediu a investigação — sempre disponível. | `${requester}` |
| `${credential:<VARIÁVEL_DE_AMBIENTE>}` | O valor da variável de ambiente `<VARIÁVEL_DE_AMBIENTE>`, lida no momento da chamada. | `${credential:ACME_API_KEY}` |

Regras críticas sobre placeholders:

- **Nunca escreva uma credencial em texto puro** (uma senha, um token, uma chave de API)
  dentro de `configuration` — sempre use `${credential:NOME_DA_VARIAVEL}`, e garanta que
  essa variável de ambiente exista de fato no ambiente onde o sistema roda. O valor real
  da credencial **não é parte deste cadastro** — é uma configuração de implantação, à
  parte, que a equipe de operação do sistema mantém.
- Um placeholder `${subject:<atributo>}` só resolve se o assunto investigado **de fato
  carregar** aquele atributo com um valor não-vazio no momento da chamada; caso contrário,
  a chamada é recusada antes de sair. Use exatamente o nome do atributo como ele existe no
  glossário do projeto (fora do escopo deste cadastro).
- Um placeholder mal escrito (tipo desconhecido, ou faltando o argumento depois de `:`)
  impede a integração de funcionar — não é um erro deste cadastro em si, mas aparece só na
  hora de tentar coletar de verdade.
- Texto literal pode conviver com um placeholder na mesma string — ex.:
  `"https://api.exemplo.com/v1/contracts/${subject:contract-id}/status"`.

### 4.4 Um conector pode ser reaproveitado por mais de uma capability

Nada impede, estruturalmente, que **duas capabilities diferentes** (respondendo a
conceitos diferentes) declarem o **mesmo** `connector`. Mas lembre-se: `address` e
`responseMap` — o endereço chamado e onde extrair cada campo da resposta — vivem dentro
da **configuração do conector**, não na capability, e uma configuração de conector é
**uma só** por nome. Então reaproveitar o mesmo `connector` só faz sentido quando as duas
capabilities esperam **exatamente a mesma chamada e a mesma resposta** — o que raramente
é o caso, já que cada capability normalmente representa uma pergunta diferente
(`equipment-status` e `network-outage-flag` quase sempre chamam endereços diferentes).
**Na prática, o caminho mais simples e seguro é: um `connector` (e uma
`ConnectorConfiguration`) por capability.**

### 4.5 Regras de validação — o que é aceito e o que é recusado

1. **`connector` precisa estar preenchido e não-vazio.** Sem ele, não há como saber a qual
   integração este registro pertence.
2. **`configuration` precisa ser um objeto** — nunca uma lista, uma string, um número ou
   `null` soltos. O sistema, neste nível, não olha para dentro do objeto (isso é
   responsabilidade de quem efetivamente executa a chamada — ver regra 3).
3. **Para conectores HTTP** (§4.2), `configuration` precisa declarar, no mínimo, um
   `method` válido (um dos cinco verbos), um `responseMap` (objeto de valores string) e um
   `statusMap` (objeto mapeando status para um dos quatro desfechos) — e, para a chamada
   sair, também um `address` não-vazio. Faltando qualquer um desses, a integração falha na
   hora de tentar coletar de verdade — não no cadastro em si, já que o cadastro genérico
   (regras 1–2) não conhece este formato específico de HTTP.
4. **Reenviar o mesmo `connector`, de propósito, substitui a configuração anterior por
   completo** — o mesmo mecanismo de correção que a capability usa (§3.3, regra 6):
   reenvie o objeto `configuration` inteiro, nunca apenas o campo que mudou.
5. **Nenhuma verificação cruzada automática existe entre capability e conector.** É
   possível cadastrar uma capability cujo `connector` **ainda não tem** nenhuma
   configuração registrada — o cadastro passa normalmente. O erro só aparece depois, no
   momento em que o sistema tenta de fato coletar aquele conceito. **Sempre cadastre os
   dois juntos**, e confira que o nome do `connector` é idêntico nos dois registros.

---

## 5. Se faltar informação

Ao preencher qualquer um dos três cadastros, se você perceber que falta uma informação que
só a equipe dona da integração real sabe responder (por exemplo, o `ttl` real de um
conceito, o `timeout` real de uma capability, o formato exato de uma resposta, o endereço
verdadeiro de um endpoint, ou o nome da variável de ambiente que guardará uma credencial),
**não invente um valor plausível em silêncio** — registre a lacuna como uma pergunta
explícita para essa equipe, em vez de arriscar um cadastro que passa despercebido mas
descreve uma integração que não existe de verdade.

---

## 6. Exemplo completo

Cadastro de um conceito, uma capability que lê o status de um equipamento respondendo a
esse conceito, e a configuração do conector que efetivamente faz a chamada HTTP:

**Concept** (pré-requisito: `"contract"` já existe como `subject-type` no glossário):

```json
{
  "name": "equipment-status",
  "accepts": ["contract"],
  "ttl": 300
}
```

**Capability:**

```json
{
  "name": "equipment-status-reader",
  "version": "1.0.0",
  "nature": "read-only",
  "input_schema": "contract-identifier-input",
  "output_schema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}",
  "timeout": 5000,
  "connector": "corporate-records-equipment-status-connector",
  "concept": "equipment-status"
}
```

**ConnectorConfiguration** (mesmo `connector`, configuração HTTP completa):

```json
{
  "connector": "corporate-records-equipment-status-connector",
  "configuration": {
    "address": "https://api.corporate-records.exemplo.com/contracts/${subject:contract-id}/equipment-status",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer ${credential:CORPORATE_RECORDS_API_KEY}"
    },
    "responseMap": {
      "status": "data.equipmentStatus"
    },
    "statusMap": {
      "200": "ok",
      "404": "unavailable",
      "401": "denied",
      "403": "denied"
    }
  }
}
```

Note como o nome `"equipment-status"` aparece igual no `Concept` e no `concept` da
`Capability`, o nome `"corporate-records-equipment-status-connector"` aparece igual no
`connector` da `Capability` e no `connector` da `ConnectorConfiguration`, e o campo
`status` aparece nos três lugares que precisam concordar: em
`output_schema.properties.status` (a capability promete o campo), em
`responseMap.status` (a configuração diz onde achá-lo na resposta) e, mais adiante, em
qualquer citação que o motor de julgamento fizer sobre ele.

Um segundo trio, para outro conceito (`"network-outage-flag"`), mostrando um corpo de
resposta booleano e reaproveitando o padrão de nomes:

**Concept:**

```json
{
  "name": "network-outage-flag",
  "accepts": ["contract"],
  "ttl": 60
}
```

**Capability:**

```json
{
  "name": "network-outage-flag-reader",
  "version": "1.0.0",
  "nature": "read-only",
  "input_schema": "contract-identifier-input",
  "output_schema": "{\"type\":\"object\",\"properties\":{\"active\":{\"type\":\"boolean\"}}}",
  "timeout": 5000,
  "connector": "corporate-records-network-outage-connector",
  "concept": "network-outage-flag"
}
```

**ConnectorConfiguration:**

```json
{
  "connector": "corporate-records-network-outage-connector",
  "configuration": {
    "address": "https://api.corporate-records.exemplo.com/service-areas/${subject:service-area-id}/outage-flag",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer ${credential:CORPORATE_RECORDS_API_KEY}"
    },
    "responseMap": {
      "active": "data.outageActive"
    },
    "statusMap": {
      "200": "ok",
      "404": "unavailable"
    }
  }
}
```

Estes exemplos são ilustrativos — use-os como modelo de formato, nunca como conteúdo a
copiar para uma integração real diferente.

---

## 7. Checklist final antes de entregar um cadastro

**Concept:**

- [ ] Todo nome listado em `accepts` já existe como `subject-type` no glossário do
      projeto.
- [ ] `ttl` está declarado explicitamente (nunca omitido, apesar de o sistema descrever um
      padrão de 60 segundos apenas para leitura — ver §2.2).
- [ ] `accepts` tem pelo menos um item.
- [ ] `name` ainda não existe como outro conceito já cadastrado.

**Capability:**

- [ ] O conceito citado em `concept` já existe no glossário do projeto (o `Concept` do
      bloco anterior, ou um já publicado antes).
- [ ] Nenhum outro cadastro ativo já responde por esse mesmo conceito (ou, se este
      cadastro pretende **substituir** um existente, `name` e `version` são
      **idênticos** ao registro que se quer corrigir).
- [ ] `nature` é `"read-only"`.
- [ ] Todos os sete campos obrigatórios estão preenchidos, nenhum vazio.
- [ ] `timeout`, se declarado, é um número inteiro.
- [ ] `output_schema` é um JSON válido, com um objeto `properties` cujas chaves são os
      nomes reais dos campos que a integração devolve.
- [ ] `name` e `version` juntos identificam esta integração de forma única e estável.

**ConnectorConfiguration:**

- [ ] `connector` é **idêntico**, caractere por caractere, ao `connector` da capability
      correspondente.
- [ ] `configuration` é um objeto (nunca lista, string ou número soltos).
- [ ] `address`, `method`, `responseMap` e `statusMap` estão todos declarados (para um
      conector HTTP).
- [ ] Toda chave de `responseMap` corresponde a uma chave real de
      `output_schema.properties` da capability.
- [ ] Nenhuma credencial em texto puro aparece em nenhum lugar do payload — toda
      credencial usa `${credential:NOME_DA_VARIAVEL}`, e essa variável foi comunicada à
      equipe de operação como um pré-requisito de implantação, fora deste cadastro.
- [ ] Todo placeholder `${subject:<atributo>}` usa um nome de atributo real do glossário
      do projeto.

**Geral:**

- [ ] Toda suposição feita por falta de informação da equipe dona da integração real foi
      registrada como pergunta explícita, não decidida em silêncio.

## 8. Formato de saída esperado

Responda com:

1. **Um bloco de código JSON com o `Concept`** — um único objeto, com exatamente os
   campos descritos em §2.2. **Omita este bloco** apenas se o conceito já existir
   previamente no glossário do projeto (deixe isso explícito na lista de suposições, item
   4 abaixo).
2. **Um bloco de código JSON com a `Capability`** — um único objeto, com exatamente os
   campos descritos em §3.1 (mesmos nomes de campo, sem campos extras e sem campos
   ausentes, exceto `timeout` quando o padrão de 60000 ms for aceitável).
3. **Um bloco de código JSON com a `ConnectorConfiguration`** — um único objeto, com os
   campos descritos em §4.1 — `connector` idêntico ao da capability do bloco anterior, e
   `configuration` no formato de §4.2 quando a integração for HTTP.
4. Todos os blocos em **JSON puro**, parseável sem pré-processamento — nenhum comentário
   dentro deles.
5. Uma lista curta, em prosa, de **toda suposição ou lacuna encontrada** ao preencher os
   três cadastros (por exemplo, um `ttl` ou `timeout` real desconhecido, um tipo de
   assunto que ainda precisa ser publicado no glossário, o endereço verdadeiro do
   endpoint, ou o nome da variável de ambiente que guardará uma credencial) — vazia se
   nenhuma foi necessária.
6. Nenhum outro texto fora desses blocos: sem saudação, sem resumo do que foi feito, sem
   repetição desta instrução.

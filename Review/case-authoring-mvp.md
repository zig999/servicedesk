# Review — case-authoring-mvp

**Data**: 2026-08-09
**Iniciativa**: `case-authoring-mvp` (work_root/delivery_root)
**Target**: `backend` → `src/`
**Registro formal**: `delivery/case-authoring-mvp/review/case-authoring-mvp.md` (este documento é um detalhamento narrativo do mesmo material, para leitura e ação humana — o registro formal é a fonte de verdade validada pelo framework)

Este relatório não computa veredito. Ele consolida o que as quatro passes de revisão (cobertura, conformidade de especificação, conformidade de standard, falhas) apuraram sobre as 10 tasks entregues, para que ajustes futuros partam de contexto completo em vez de re-derivar tudo do zero.

---

## 1. O que foi revisado

**10 tasks, 62 arquivos, 1 captura de execução.**

| # | Task | Arquivos de implementação | Arquivos de teste |
|---|---|---|---|
| 1 | `published-language/build-substrate` | package.json, tsconfig.json, eslint.config.js, src/index.ts, .gitignore, .secretlintignore | — (task de substrato, sem prova) |
| 2 | `published-language/glossary-vocabulary` | src/glossary/terms.ts, glossary-store.port.ts, glossary.service.ts, 2 erros, file-glossary-store.repository.ts, glossary.factory.ts | 23 testes / 5 arquivos |
| 3 | `published-language/glossary-query` | src/glossary/glossary-query.port.ts (+ glossary.service.ts, glossary.factory.ts estendidos) | 11 testes / 2 arquivos |
| 4 | `capability-registry/capability-registration` | src/capability-registry/capability.ts, capability-store.port.ts, capability-registry.service.ts, 3 erros, file-capability-store.repository.ts, capability-registry.factory.ts | 29 testes / 4 arquivos |
| 5 | `capability-registry/capability-resolution` | src/capability-registry/capability-query.port.ts (+ service e factory estendidos), 2 erros | 13 testes / 2 arquivos |
| 6 | `case-model/case-document-model` | src/case/case.ts, parse-case-document.ts, 1 erro | 33 testes / 2 arquivos |
| 7 | `case-model/case-resolution` | src/case/case-resolution.ts | 12 testes novos + auditoria reusada |
| 8 | `case-model/case-coherence-validation` | src/case/validate-case-coherence.ts, 1 erro | 18 testes / 2 arquivos |
| 9 | `case-store/versioned-file-store` | src/case/case-store.port.ts, file-case-store.repository.ts, 1 erro, case-store.factory.ts (+ json-file.ts estendido) | 12 testes / 1 arquivo |
| 10 | `case-store/read-case` | src/case/case-query.port.ts, case-query.service.ts, 2 erros, case-query.factory.ts | 26 testes / 2 arquivos |

**Execução capturada** (`delivery/case-authoring-mvp/run/review-case-authoring-mvp/`): `npm ci` → `typecheck` → `lint` → `secret-scan` → `test`, uma vez sobre a mudança inteira (não task a task). **Todos os 5 passos passaram.**

**Standard aplicado**: `standards/backend-node-service.yaml`, pin `sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300` — 59 regras (35 por leitura, 24 por ferramenta: 20 no lint, 2 no secret-scan, 2 no typecheck). Todos os artefatos que o registry pressupõe (package.json, tsconfig.json, eslint.config.js) estavam de pé.

---

## 2. Achado de conformidade com a especificação (1)

### `Capability.concept` não declarado em `domain/integration/capability`

**Onde**: `src/capability-registry/capability.ts` — o tipo `Capability` e `REQUIRED_REGISTRATION_ATTRIBUTES`.

```ts
export type Capability = {
  readonly name: string;
  readonly version: string;
  readonly nature: CapabilityNature;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly timeout: number;
  readonly connector: string;
  readonly concept: string;   // ← este campo
};
```

**O fato**: `domain/integration/capability` (o nó da especificação) declara exatamente sete atributos — `name`, `version`, `nature`, `input_schema`, `output_schema`, `timeout`, `connector`. A responsabilidade do nó fala em declarar "nature, both schemas, timeout, connector" — cinco itens, nenhum deles `concept`. O código acrescenta um oitavo campo, exige-o em todo registro, e recusa sua ausência através do **mesmo** `IncompleteCapabilityContractError` que guarda os campos que a especificação de fato declara.

**Por que aconteceu**: durante a implementação da task 4 (`capability-registration`), o `task-implementer` precisou decidir onde vive o vínculo concept→capability — a especificação nomeia essa lacuna (`domain/integration/capability-registry` é "o lookup de um concept para a capability que o responde", mas nenhum nó diz *onde* esse vínculo é persistido). O implementador **divulgou essa decisão como inferência**, no registro de implementação:

> *"inferred: a registration states the concept it answers as a required concept attribute — a string naming the glossary concept — persisted with the record... from: domain/integration/capability-registry is the one lookup from a concept to the capability that answers it, so the link must be stated at registration for the lookup to hold a key, while domain/integration/capability declares no such attribute and the task's advisory records that no node states where the link lives"*

A divulgação foi honesta e a decisão de engenharia é defensável — sem esse campo, `capability-resolution` (task 5) não teria como resolver concept→capability. Mas divulgação não é conformidade: a passe de especificação lê o código contra o que a especificação **hoje** declara, independentemente do que um registro admitiu, e o campo continua ausente do nó.

**Custo**: quem consulta `domain/integration/capability.md` para saber o que uma capability precisa declarar não encontra `concept` ali — só no código.

**Duas rotas de correção, mutuamente exclusivas**:
1. **Estender a especificação** — `/analyse` acrescenta `concept` como atributo obrigatório de `domain/integration/capability`, tornando explícito o que já é verdade no código. É a rota mais simples e provavelmente a correta, já que a responsabilidade do nó já fala do vínculo em prosa (`"cada capacidade registrada"` respondendo a um concept), só não no `attributes` estruturado.
2. **Tirar o vínculo do contrato obrigatório da capability** — reformular o código para que a ausência de `concept` seja uma condição própria, não fundida em `IncompleteCapabilityContractError`. Mais trabalho, sem ganho óbvio sobre a rota 1.

---

## 3. Achados de conformidade com o standard (9)

### 3.1 — Sete instâncias de `COR-02`: erros tipados sem campo `status`

| Arquivo | Classe de erro | Linha (aprox.) |
|---|---|---|
| `src/capability-registry/capability-registry.service.ts` | `DuplicateConceptAnswerError` | dentro de `readCapability` |
| `src/case/case-query.service.ts` | `CaseNotFoundError` (e `CaseNotValidError`, mesmo padrão) | `heldVersion` |
| `src/glossary/glossary.service.ts` | `DuplicateGlossaryNameError` | `assertUniqueNames` |
| `src/persistence/file-capability-store.repository.ts` | `CapabilityStoreError` | `readCapabilities` |
| `src/persistence/file-case-store.repository.ts` | `CaseStoreError` | `versionFileNames` |
| `src/persistence/file-glossary-store.repository.ts` | `GlossaryStoreError` | `readRecords` |

Todos os nove erros tipados do projeto (`src/errors/*.ts`) carregam `name`, `message` e `context` — nenhum carrega `status`.

**A tensão que a própria revisão encontrou e não resolveu**: `COR-02` exige o campo `status`; `COR-03` exige que o erro de um service **não** carregue conhecimento de transporte. Satisfazer um dos dois nesse ponto do código empurra contra o outro — porque não existe transporte algum na árvore ainda (nenhum controller, nenhum endpoint HTTP), um `status` aqui não teria para onde apontar além de um número inventado. O padrão que `COR-04` propõe (um único lugar de mapeamento erro→status, quando um transporte existir) é consistente com adiar isso, não com corrigir erro por erro agora.

**Rota**: decisão de quem é dono do `standards/backend-node-service.yaml` — ou ajustar `COR-02`/`COR-03` para deixar claro qual vale quando não há transporte, ou aceitar o adiamento como está e fechar a tensão só quando a primeira rota HTTP for escrita.

### 3.2 — Duas instâncias de `STK-08`: validação manual em vez de schema

**`src/capability-registry/capability-registry.service.ts`** — `refuseContractDepartures`:
```ts
function refuseContractDepartures(
  registration: CapabilityRegistration,
): asserts registration is DeclaredRegistration {
  const problems = contractProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteCapabilityContractError(problems);
  }
}
```

**`src/case/parse-case-document.ts`** — `refuseStructuralViolations`:
```ts
function refuseStructuralViolations(document: unknown, fileName: string): asserts document is Case {
  const problems = documentProblems(document, fileName);
  if (problems.length > 0) {
    throw new InvalidCaseDocumentError(fileName, problems);
  }
}
```

**O fato**: são os dois únicos pontos onde dado não confiável entra no domínio (um registro de capability submetido por um chamador; um documento de case lido de volta do disco). Ambos são validados por árvores de checagem manual (`contractProblems`, `documentProblems` — funções que percorrem campo a campo) em vez de um schema Zod, que o projeto já usa na camada de persistência.

**Custo real**: um atributo novo acrescentado ao elemento `Capability` ou `Case` da especificação tem que ser lembrado manualmente nessas duas árvores; esquecer deixa passar um dado malformado como se fosse tipado.

**Por que não é simples trocar por Zod diretamente**: os dois pontos precisam **coletar todas as violações de uma vez** (critério "refusado uma vez, com toda violação nomeada" — presente em ambas as tasks 4 e 6). `zod`'s `safeParse` também coleta múltiplos `issues`, então a troca é tecnicamente viável — mas walks a favor de manter como está: os dois módulos (`case.ts`, `parse-case-document.ts`) fazem parte do domínio puro que **não importa nada** (constraint `the-domain-depends-on-no-infrastructure`, verificado por auditoria de import em `case-document-modules.spec.ts`). Introduzir Zod nesses módulos tensiona essa pureza — mesmo Zod não sendo "framework, driver ou provider client" no sentido literal do critério, é uma biblioteca externa que o domínio hoje não depende de nada.

**Rota**: `/implement-task` sobre as tasks 4 e 6, depois de decidir explicitamente se `STK-08` prevalece sobre a pureza de import do domínio, ou se a pureza (já testada e trace-vinculada) é a decisão que fica — nesse caso, `STK-08` precisaria de uma exceção declarada no próprio standard para módulos de domínio puro.

### 3.3 — Uma instância de `MNT-03`: lógica duplicada

**`src/persistence/file-capability-store.repository.ts`**, `readCapabilities`:
```ts
public async readCapabilities(): Promise<readonly Capability[]> {
    const file = join(this.directory, CAPABILITY_FILE);
    const data = await readJsonFileOrAbsent(
      file,
      (failure, cause) => new CapabilityStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause }),
    );
    if (data === undefined) {
      return [];
    }
    const records = capabilityRecordsSchema.safeParse(data);
    if (!records.success) {
      throw new CapabilityStoreError('the capability file does not hold the records the store port promises', {
        file,
        issues: records.error.issues,
      });
    }
    return records.data;
  }
```

Essa sequência (ler-ou-ausente → parsear com schema → lançar erro tipado se a forma não bater) já existe **generalizada** como `FileGlossaryStore.readRecords()` privado em `src/persistence/file-glossary-store.repository.ts`. Aqui foi reescrita à mão para a forma de `Capability` em vez de chamada.

**Custo**: uma correção em como um arquivo ausente é tratado, ou na mensagem lançada, agora precisa ser feita nos dois lugares — e quem esquecer um mantém o comportamento antigo sem decidir isso de propósito.

**Rota**: extrair a sequência para um helper parametrizado por schema e construtor de erro (o próprio `json-file.ts`, que já existe e já é compartilhado entre os dois stores para a metade "ler/escrever arquivo", é o lugar natural — falta só a metade "parsear com schema e lançar tipado"). `/implement-task` sobre `capability-registration` ou uma task nova de refatoração.

---

## 4. Cobertura — o que não foi provado, e por quê

### 4.1 — 7 critérios `uncovered`, todos de `build-substrate`

```
'package.json declares "type": "module" at its top level.'
package.json declares the test, lint, typecheck and secret-scan scripts...
package.json declares every dependency the project uses, each drawn from the standard's authorized list.
package.json declares the secretlint configuration the secret-scan step reads.
tsconfig.json declares the strict compiler configuration STK-01 and TYP-01 require...
eslint.config.js is a flat config declaring the TypeScript parser and a non-empty rule set...
npm ci followed by each of the declared typecheck, lint, secret-scan and test steps completes on the tree as produced.
```

**Não é gap real** — é o comportamento desenhado do framework: uma task que produz o substrato que o standard pressupõe não escreve prova (não há comportamento para um teste provar sobre um manifesto). O que substitui a prova é a **captura de execução que passou** — e essa captura (`run/review-case-authoring-mvp`) rodou de novo nesta revisão, sobre a árvore inteira, e passou nos 5 passos. Nada a corrigir aqui.

### 4.2 — 1 critério `partial`

`versioned-file-store`: "The dependency manifest declares no database driver **and the deployment provisions no database service**." A metade do manifesto está coberta (`dependency-manifest.spec.ts`); a metade de deployment não tem como ser testada — nenhum artefato de deployment existe no repositório para um teste auditar. Não é gap de teste, é ausência do próprio artefato que o critério presume (o projeto ainda não tem manifesto de deploy).

### 4.3 — Duas notas do próprio auditor de cobertura (não são achados)

- **"Os módulos de resolução não importam infraestrutura"** — coberto, mas por uma auditoria de diretório (`case-document-modules.spec.ts`, que varre todo `.ts` sob `src/case/`) em vez de um teste nomeado ao arquivo `case-resolution.ts` especificamente. Funciona porque a varredura é por diretório, não por arquivo — mas vale saber que a cobertura vem daí.
- **"Recusa uma vez, com toda violação nomeada"** (task 10, `read-case`) — nunca é exercitado com violação estrutural **e** de coerência juntas na mesma chamada, porque isso é **estruturalmente impossível**: a checagem de coerência exige o agregado já parseado, e uma falha estrutural sempre impede o parse de terminar. Não é um teste faltando — é uma combinação que o próprio desenho da composição nunca permite existir. Ver §5.

---

## 5. O achado `contested` que atravessa duas provas

A prova da task 10 (`read-case`) registra uma disputa entre produtores, do jeito que o framework pede — **registrada, não resolvida**:

> A nota original do registro de implementação afirmava que essa composição provaria uma recusa conjunta (estrutural **e** coerência) numa única chamada. Nenhum teste prova isso: `readCase`'s `structuralCase()` lança `CaseNotValidError` imediatamente sobre qualquer violação estrutural, antes de `refuseIncoherence` sequer ser chamado — um documento que falha o parse nunca chega às checagens de coerência.

**Isso não é um bug.** É uma consequência necessária da ordem da composição: coerência opera sobre o agregado já parseado (nomes de hipótese, conceitos coletados, etc.), que uma falha estrutural nunca produz. O critério 2 da task 10 ("toda regra violada nomeada na mesma recusa"), lido literalmente, não exige que as duas metades se combinem — é satisfeito por juntar toda violação **da metade que de fato rodou**, que é exatamente o que os testes provam, junto com o próprio limite de curto-circuito (testado explicitamente: "names only the structural violations, never a coherence one").

A nota de prosa original (meu erro, na composição do registro de implementação) foi corrigida antes do commit para não overclaim isso. O achado fica registrado aqui porque é exatamente o tipo de nuance de design que vale a pena um humano confirmar como intencional — se algum dia a especificação quiser mesmo uma recusa conjunta de verdade, o desenho atual (coerência depende do parse) precisaria mudar, não só o teste.

---

## 6. Duas questões em aberto, sem achado formal

Duas passes (conformidade e cobertura) notaram, sem escalar a achado, pontos que a especificação deixa genuinamente ambíguos:

1. **Os quatro vocabulários do glossário realmente exigem "exatamente uma vez" com a mesma força textual?** Só `domain/glossary/subject-type` diz "exatamente uma vez" em tantas palavras; as outras três descrições ("vocabulário global", "global e estável") sustentam a mesma leitura por proximidade, não por afirmação direta. O código trata as quatro uniformemente (checagem de nome único idêntica nas quatro). Discutível, não um achado — argumentar isso seria interpretação, não uma contradição declarada.

2. **`Case.hash` (atributo declarado no documento) precisa bater com o hash de conteúdo que o file store recomputa a cada leitura?** O código nunca reconcilia os dois — o documento pode declarar um `hash` que nada verifica contra o hash real dos bytes lidos. Nenhum nó da especificação diz que os dois precisam concordar, então não virou achado — mas é uma pergunta que vale fazer antes de alguém assumir, na prática, que `case.hash` é confiável.

---

## 7. Tabela-resumo para priorização

| # | Achado | Passe | Severidade aparente | Rota |
|---|---|---|---|---|
| 1 | `Capability.concept` não declarado | conformidade | Alta — autoridade da especificação | `/analyse` (recomendado) ou reescrever o código |
| 2 | `STK-08` × 2 (validação manual) | standard | Média — risco de drift futuro | `/implement-task`, após decidir Zod vs. pureza de domínio |
| 3 | `MNT-03` (duplicação) | standard | Baixa — sem risco funcional hoje | `/implement-task`, extrair helper em `json-file.ts` |
| 4 | `COR-02` × 7 (sem status) | standard | Baixa hoje, cresce quando houver transporte | decisão do dono do registry sobre `COR-02` vs `COR-03` |
| 5 | Contested: recusa conjunta impossível | prova (task 10) | Informativo — não é defeito | confirmar como intencional, ou reabrir o desenho |
| 6 | `Case.hash` vs. hash recomputado | aberto (sem achado) | Informativo | decisão humana se vale virar regra |
| 7 | Uniformidade "exatamente uma vez" nos 4 vocabulários | aberto (sem achado) | Informativo | nenhuma ação necessária |

**Nada nesta lista bloqueia o uso do sistema hoje.** Todos os 62 arquivos passam na suite completa; as 10 tasks têm 0 critérios não atendidos. O que esta lista aponta é onde a base de código e a especificação podem divergir silenciosamente **no futuro**, e onde o standard do projeto tem uma regra em tensão consigo mesmo.

---

## 8. Referências

- Registro formal validado: `delivery/case-authoring-mvp/review/case-authoring-mvp.md`
- Execução capturada: `delivery/case-authoring-mvp/run/review-case-authoring-mvp/`
- Trace especificação↔código: `siegard-trace.json` (42 vínculos, sem drift na última checagem)
- Especificação: `knowledge/` (24 elementos, 40 regras, 8 cenários, 17 contratos, 11 constraints)
- Standard: `standards/backend-node-service.yaml`, pin `sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300`

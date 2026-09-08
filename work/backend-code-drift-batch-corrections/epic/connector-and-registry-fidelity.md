---
title: The HTTP connector's stated vocabularies and the capability registry's binding
summary: The corrections over the integration surface -- the malformed-configuration refusal restating
  vocabularies as literal text, and the trace asserting that the judgment stage answers for the capability-registry
  contract.
rationale: I grouped these two because both answer for the integration surface own nodes and neither touches
  the case or glossary contexts; I kept them apart from the record-declaration epic because one is a refusal
  message derivation and the other is a binding assertion, not a declaration.
sources:
- intake/scope.md
covers:
- rules/integration/an-http-connector-configuration-declares-its-call
- domain/investigation/evidence-result
- contracts/integration/capability-registry
---
## What it is
Duas correcoes sobre a superficie de integracao.
As mensagens de problema de configuracao malformada da fonte de observacao HTTP declarativa reescrevem os metodos HTTP aceitos e os desfechos de evidence-result como texto literal em vez de derivar das listas canonicas que o proprio arquivo ja importa.
O trace vincula src/src/investigation/judgment-stage.ts a contracts/integration/capability-registry, um contrato cujas quatro operacoes esse arquivo nao implementa nenhuma.

## Notes
As listas canonicas que ambas as mensagens precisam derivar ja existem e ja sao importadas pelo arquivo que as reescreve: HTTP_METHODS de src/src/http-connector/http-connector-call-configuration.ts e EVIDENCE_RESULTS de src/src/investigation/evidence-result.ts.
O inventario registra que o conteudo de judgment-stage.ts bate com os outros nos de especificacao aos quais o trace o vincula, entao a divergencia ali e do vinculo, nao do arquivo.

---
title: The malformed-configuration refusal derives its vocabularies from their canonical lists
summary: The HTTP connector's malformed-configuration problem messages name the accepted methods and the
  evidence-result endings by deriving them from HTTP_METHODS and EVIDENCE_RESULTS rather than restating
  them as literal text.
rationale: I merged the two findings into one task because both are adjacent lines of one function stating
  one decision -- that a problem message names a vocabulary by deriving it -- and they share the one seam
  and the one risk; splitting them would give two tasks editing the same three lines.
sources:
- intake/scope.md
objective: No problem message the HTTP declarative observation source raises for a malformed configuration
  restates a vocabulary as literal text; each derives its accepted values from the canonical list the
  file already imports.
criteria:
- The problem message for a method outside the accepted set names those methods by deriving them from
  HTTP_METHODS.
- The problem message for a malformed statusMap names the accepted endings by deriving them from EVIDENCE_RESULTS.
- No string literal in src/src/investigation/http-declarative-observation-source.adapter.ts enumerates
  the HTTP methods or the evidence-result endings.
- A configuration declaring a method HTTP_METHODS does not hold issues no call and ends unavailable with
  a result detail reporting a MalformedHttpConnectorConfigurationError.
- A configuration whose statusMap is not an object mapping an HTTP status to one evidence-result ending
  issues no call and ends unavailable with a result detail reporting a MalformedHttpConnectorConfigurationError.
- A configuration declaring a method HTTP_METHODS holds, a responseMap of string paths, and a statusMap
  of evidence-result endings is not refused by this well-formedness check.
implements:
- rules/integration/an-http-connector-configuration-declares-its-call
- domain/investigation/evidence-result
---
## What it is
rules/integration/an-http-connector-configuration-declares-its-call declara os metodos aceitos como GET, POST, PUT, PATCH e DELETE, e declara que statusMap mapeia um status HTTP para um desfecho de evidence-result; desde a reconciliacao que originou este plano, o no tambem declara que o result detail da recusa por chave malformada nomeia, alem do erro, o vocabulario aceito que a chave nao respeitou.
domain/investigation/evidence-result guarda esses desfechos como ok, unavailable, denied e timeout.
O arquivo ja importa HTTP_METHODS e EVIDENCE_RESULTS e os usa em suas proprias guardas de pertencimento, e depois reescreve cada vocabulario como texto literal na mensagem de problema ao lado.

## Notes
UNDERDETERMINED, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call agora declara que o result detail da recusa nomeia o vocabulario aceito, alem do erro; nenhum criterio desta tarefa assere isso -- os criterios 1 e 2 seguram apenas uma mensagem de problema derivando do HTTP_METHODS/EVIDENCE_RESULTS, e os criterios 4 e 5 seguram o result detail apenas a reportar o erro. Nada liga o vocabulario derivado ao result detail com que a observacao termina unavailable. Passaria: uma checagem cujo MalformedHttpConnectorConfigurationError lancado carrega uma mensagem derivando os metodos e desfechos aceitos, mas cujo result detail da observacao nomeia so o erro, sem vocabulario nenhum.
UNDERDETERMINED, from the specification -- o no tambem sujeita a mesma recusa a chave responseMap (um objeto de caminhos em string); o criterio 6 so garante que um responseMap valido nao e recusado, mas nenhum criterio recusa um responseMap ausente ou malformado. Passaria: uma checagem que valida method e statusMap mas nunca inspeciona responseMap -- toda configuracao com responseMap ausente ou malformado emitiria a chamada em vez de terminar unavailable.
REMAINDER, from the specification -- as clausulas restantes do mesmo no (address obrigatorio, query/headers/body, os placeholders de subject/requester/credential, e os desfechos IncompleteConnectorCallDescriptorError e ConnectorPlaceholderNotResolvedError) nao sao alcancadas por nenhum criterio desta tarefa, cujo objetivo se confina aos vocabularios da recusa por configuracao malformada. Pertence ao trabalho de montagem de chamada (src/src/http-connector/connector-call-descriptor.ts e connector-request-resolver.ts) -- escopo que este plano nao cobre.
ADVISORY, from the specification -- a clausula do vocabulario no result detail esta no statement e na Description do no, mas nenhum registro de decisoes a localiza; as tres entradas existentes cobrem as tres chaves obrigatorias, o mecanismo de placeholder, e os desfechos de falha de montagem -- nao essa. E o outcome esperado para um fato ja afirmado no material de intake: nao e uma decisao de analise e por isso nao ganha entrada nesse registro, mas fica anotado aqui para quem checar a proveniencia depois.
ADVISORY, from the specification -- contracts/integration/capability-registry e candidato do epic mas nenhum criterio desta tarefa o alcanca; coberto pela tarefa irma capability-registry-binding, no mesmo epic.

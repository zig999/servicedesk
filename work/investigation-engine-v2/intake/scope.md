Escopo: fechar as três frentes abertas pelas análises recentes e o drift de trace que elas abriram sobre código já entregue, no context investigation.

1. Rework de subject-attribute — domain/investigation/subject agora carrega subject-type + um conjunto de subject-attribute-value (attribute, value), não mais um id bruto. Repropagar isso em: observation-source-port (o que a chamada de observe-concept recebe), investigation-factory (construção do subject), a janela de idempotência (a chave de repetição passa a usar o conjunto inteiro de atributos-valor, não um id), e evidence-collection-stage.

2. Estágio de consolidação — assessment-consolidator como domain-service (operação consolidate), com porta + fake adapter no mesmo padrão de hypothesis-evaluator. resolve-and-narrow-input passa a produzir a entrada estreita descrita em rules/investigation/the-writing-input-is-narrowed (avaliação de toda hipótese exigida — verdict, reason quando presente, citations — mais a evidence que essas citations nomeiam; nunca hipóteses, critérios ou when_to_use). draft-assessment-text passa a consumir a saída do consolidator em vez de montar o texto direto das evaluations. case (domain/knowledge/case) e sua validação de coerência passam a admitir consolidation_register opcional.

3. diagnose-entry-point — agora desbloqueado. requester e ticket_ref viajam no próprio payload de diagnose, junto com case, subject e narrative; requester obrigatório, ticket_ref opcional. Sem ticket_ref, nunca há dedup por janela: a chamada sempre inicia sua própria investigação.

4. Drift de trace a resolver como parte das tasks acima, não como task própria: domain/investigation/investigation, domain/investigation/subject, domain/knowledge/case, rules/investigation/an-investigation-is-idempotent-within-a-window, rules/investigation/the-writing-input-is-narrowed, scenarios/investigation/a-repeated-request-returns-the-same-investigation — todos já implementados contra uma versão anterior desses nodes; as tasks que os tocam devem reimplementar contra o texto atual e o /implement-task correspondente deve rebind-ar no fim.

5. Cobertura explícita, sem tarefa correspondente: a epic que cobre a coleta/integração deste plan deve listar contracts/integration/corporate-records-source e contracts/system/guided-diagnosis em covers e declará-los uncovered, com o porquê — corporate-records-source é a integração real com sistemas corporativos por trás do fake de observation-source, que este plan não constrói; guided-diagnosis é a capability de sistema que o fluxo síncrono de diagnose já realiza em substância, mas que nenhuma epic, em nenhum dos dois planos anteriores, jamais reivindicou formalmente em covers.

Project root: .
Target: backend
Initiative: investigation-engine-v2

Implementar o atributo opcional payload_notes em Capability (src/src/capability-registry/capability.ts
e no fluxo de register-capability), propagá-lo como capability_payload_notes no snapshot de Evidence
no momento da coleta (mesmo padrão já usado para concept_description — vazio-honesto quando a
capability não declara nenhum, nunca relido depois), e fazer o hypothesis-evaluator recebê-lo junto
com concept e field semantics ao montar o contexto de julgamento de uma hipótese.

Também ajustar a apresentação da capability registrada (leitura por identidade) para admitir
payload_notes como o único atributo que pode legitimamente aparecer ausente, ao contrário dos
demais atributos obrigatórios.

Nós de especificação já escritos e validados por /analyse nesta mesma sessão:
- domain/integration/capability (novo atributo payload_notes, string, opcional)
- domain/investigation/evidence (novo atributo capability_payload_notes, string, obrigatório,
  snapshot honesto-vazio)
- domain/investigation/hypothesis-evaluator (Responsibility cita a nova documentação como contexto
  adicional de julgamento)
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  (enumeração e cláusula de ausência atualizadas)
- rules/investigation/judgment-reads-the-evidence-snapshot (vocabulário fechado do que o julgamento
  lê do snapshot passa a incluir capability_payload_notes)

Target: backend (src).

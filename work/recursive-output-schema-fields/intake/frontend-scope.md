O texto de ajuda ao lado do campo "Output schema" na tela de cadastro de capability
(frontend/app/src/routes/capability-form-fields.tsx) ainda descreve a leitura de
topo ("chaves do próprio objeto properties de nível superior") que valia antes da
leitura recursiva. A especificação já foi atualizada (commit 3e7ce67a) e o backend já
lê recursivamente (commit e0dd3b12): este texto precisa ser atualizado para
descrever a leitura recursiva por caminho completo (properties/items, `.`/`[]`),
mantendo a mesma disciplina de disclosure já decidida em
rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
(nenhuma reivindicação nova, nenhum exemplo próprio).

Nós de especificação relevantes (já validados, nenhum muda nesta entrega):
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  (statement/expression já reescritos no /analyse desta sessão para citar a regra
  recursiva; é o texto que a tela deve refletir)
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  (bound: a tela não pode afirmar nada além do que os três nós já cobrem)
- domain/investigation/field-semantics
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema

Target: frontend.

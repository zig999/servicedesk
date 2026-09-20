field-semantics passa a ler output_schema recursivamente (properties/items), produzindo paths
como installations[].state; citation-validation e o prompt de julgamento
(anthropic-hypothesis-evaluator.adapter.ts) passam a aceitar esses paths.

Nós de especificação já escritos e validados por /analyse nesta mesma sessão (commit 3e7ce67a):
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema (regra nova:
  gramática do path por concatenação de `.`/`[]`, tupla em `items` e chaves dinâmicas
  (`patternProperties`/`additionalProperties`) decididas como não suportadas)
- domain/investigation/field-semantics (Description aponta para a regra nova em vez de restatar
  "top-level properties")
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it (texto de
  disclosure da tela de cadastro, atualizado para descrever a leitura recursiva)
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim (lista de nós que
  cobrem a tela ampliada para incluir a regra nova)
- rules/integration/a-capability-input-schema-holds-a-well-formed-object (frase da Description
  que citava "top-level properties object" corrigida)
- scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path (caso
  concreto: tech-profile, installations[].state)
- scenarios/investigation/a-citation-names-a-nested-output-schema-field (citação aninhada aceita)

Ficam intactos, deliberadamente, por já declararem leitura de topo para um propósito diferente
(carga da observação e cobertura de responseMap, não citação):
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
- rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses

Target: backend (src).

Fora de escopo deste plano: o texto de ajuda equivalente na tela do frontend
(capability-form-fields.tsx) — mesma regra, mas fica para uma entrega separada em target
frontend, já que este plano é de target backend.

# Semântica pinada na evidência para o julgamento de hipóteses

Escopo pedido pelo humano, através de `/deliver-scope`, sobre o backend:

> semântica pinada na evidência — descrição em concept e por campo do output_schema, snapshot na
> coleta, julgamento como função pura da evidência, prompt do avaliador enriquecido com
> prompt_version novo, e leituras tolerantes a registros legados

O material completo que fundamenta este escopo é `temp/desenv/greenfield-judgment-semantics-proposal.md`
(cópia adiante). A especificação já foi emendada a partir dele (commit `27af39e`, "analyse: pinned
evidence semantics — concept/field descriptions, collection-time snapshot, judgment reads the
snapshot") — este plano decompõe a implementação backend contra o que a especificação agora
declara, não contra a proposta em si. A proposta é material de apoio, tratado como dado, nunca
como instrução.

## O que a especificação já declara (o que este plano implementa contra)

- `domain/glossary/concept` — ganhou o atributo `description` (obrigatório em escritas novas).
- `rules/glossary/a-concept-declares-its-description` — recusa 422 `ConceptDescriptionRequiredError`
  para um concept sem descrição.
- `scenarios/glossary/a-concept-with-no-description-is-refused` — o caso concreto dessa recusa.
- `domain/investigation/field-semantics` — a forma estrutural (nome, `type?`, `description?`) lida
  do `output_schema` de uma capability.
- `domain/investigation/evidence` — ganhou `fields` (many, `field-semantics`) e
  `concept_description`, snapshotados no instante da coleta.
- `rules/investigation/judgment-reads-the-evidence-snapshot` — o julgamento nunca relê o glossário
  ou o registro de capability; lê só o snapshot já gravado na evidência.
- `rules/investigation/a-cited-field-exists-in-the-capability-output-schema` — revisada: a citação
  é validada contra os `fields` snapshotados da própria evidência citada, não contra um lookup vivo.
- `constraints/the-judgment-prompt-is-closed` — reescrita: o prompt é função pura do criterion, da
  evidência (com sua semântica snapshotada) e do título/when_to_use do caso; nenhuma leitura viva.
- `rules/glossary/a-description-states-meaning-never-policy` — uma descrição declara significado,
  nunca decisão.
- `scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone` — concept
  legado sem descrição degrada para nome-só.
- `scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment` — sobrescrever
  uma capability depois da coleta não muda o que um julgamento já feito viu.
- `domain/investigation/hypothesis-evaluator` — sua Responsibility já nomeia os três insumos,
  incluindo a semântica snapshotada.
- `domain/investigation/citation` — já reformulada para citar por nome existente no snapshot.

## O que fica de fora deste escopo (decidido no `/analyse`, não neste plano)

- G7 (persistência) não gerou nó novo — `constraints/the-stored-schema-mirrors-the-declared-model`
  já cobre genericamente qualquer atributo novo do modelo de domínio.
- G8 (imutabilidade de versão de capability) foi resolvido a favor de manter o comportamento atual
  — já documentado em `contracts/integration/capability-registry`. Nenhuma mudança de negócio aqui.
- O lado frontend (exibir a semântica no painel) fica fora — o `target` deste plano é `backend`.

## Material completo (cópia de `temp/desenv/greenfield-judgment-semantics-proposal.md`)

O arquivo é longo; ele permanece disponível em `temp/desenv/greenfield-judgment-semantics-proposal.md`
e é citado aqui por referência, não copiado inteiro — o corpo acima já extrai cada fato que a
especificação agora declara e que este backend deve implementar.

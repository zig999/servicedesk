A entrega da task hypothesis-revision-own-state/refuse-altering-a-released-revision (migração
0021, que move a proteção de released para a coluna própria hypothesis_revisions.state) rodou a
suíte completa e expôs dois comportamentos incorretos em código já entregue, por dois testes
reais rodando contra o sistema — não são falhas desta task, mas do que ela revela:

1. Testes obsoletos que certificam a proteção antiga (por referência de manifest/case-version
   released), que a especificação já revogou como base (rules/knowledge/a-released-hypothesis-
   revision-is-never-altered e domain/knowledge/hypothesis-revision, ambos decorrentes do
   /analyse "hypothesis-revision gains its own release lifecycle"). Arquivos, todos de
   iniciativas já fechadas (não podem receber re-entrega só-prova):
   - src/src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
     (2 asserções: "leaves a hypothesis revision's stored content exactly as it was after an
     update attempts to change it, where a released case version's manifest still references
     that revision"; "rejects the update itself... where a released case version's manifest
     still references the revision") — dono: work/hypothesis-revision-editable-until-published
     (fechada), task hypothesis-revision-overwrite/revision-alteration-refused-only-when-released.
   - src/src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
     (a mesma base de proteção por referência) — dono provável: delivery/manifest-collects-hotfix,
     task manifest-collects-hotfix/fix-collects-readback.
   - src/src/__tests__/integration/persistence/relational-case-store.repository.spec.ts, teste
     "refuses an overwrite attempt against a revision a released case version still references
     through a distinguishable error" (linha ~1852) — mesma base obsoleta, ao lado de um
     teste-irmão já correto (linha ~1883) que testa o estado próprio.
   Esses testes precisam ser reescritos (ou retirados, se a cobertura já existe em
   src/src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts,
   entregue por esta iniciativa) para não certificar mais uma base de proteção que a
   especificação proíbe.

2. Dado de fixture/seed compartilhado corrompido pela mudança de regra: revisões de hipótese
   referenciadas por versões de caso já released nunca tiveram sua própria coluna `state`
   movida para `released` (nada no sistema ainda faz essa transição — essa é a ação
   `release-hypothesis`, ainda não entregue por esta mesma iniciativa). Sob o trigger antigo isso
   era protegido por acidente (a referência do case version released bastava); sob o novo trigger
   (correto), o `collects` dessas revisões deixou de estar protegido e pode ser apagado, e a
   leitura estrutural do caso passa a recusá-lo (CaseNotValidError: manifest entry collects no
   concept). Isso quebra em cascata: src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts,
   src/src/__tests__/integration/seed.spec.ts (suite inteira falha no beforeAll),
   src/src/__tests__/integration/factories/diagnose-server.factory.spec.ts,
   simulate-case-server.factory.spec.ts, simulate-hypothesis-server.factory.spec.ts, e
   src/src/__tests__/integration/case/manifest-collects-survive-release.spec.ts. A correção
   precisa garantir que toda revisão de hipótese referenciada pelo fixture/seed canônico, quando
   a versão que a referencia é released, tenha sua própria coluna state também marcada released
   — sem depender da task release-a-revision-directly ainda não entregue (pode ser feito
   diretamente no setup do fixture/seed, já que é dado de teste, não fluxo de produção).

Fora de escopo: qualquer mudança na regra de negócio já decidida pelo /analyse; qualquer coisa
em frontend/app/.

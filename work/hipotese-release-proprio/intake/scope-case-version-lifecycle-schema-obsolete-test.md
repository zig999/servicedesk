Um quarto arquivo de teste, não coberto pelo escopo anterior (scope-suite-corrections.md), também
certifica a base de proteção obsoleta (por referência de manifest/case-version released) que a
migração 0021 já revogou — descoberto ao rodar a suíte completa após a entrega da task
`retire-manifest-basis-schema-specs`:

- src/src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts, teste "leaves
  an already-stored hypothesis revision's own columns unchanged after an ordinary UPDATE attempts
  to alter them, where a released case version's manifest references that revision" — constrói a
  fixture com a revisão em estado default (draft, não setado explicitamente) e espera que o UPDATE
  seja recusado só por causa da referência do manifest; o trigger atual (state-only) não recusa
  mais isso.

Esse arquivo não está vinculado por nenhum bind do trace (`trace.py --encodes` não retorna nada
para ele), então a rota de incremento corretivo não se aplica (ela exige um arquivo que o trace já
conhece). Trate como escopo ordinário, mesmo sendo um único arquivo/teste, sob o epic já existente
`obsolete-protection-basis-tests` (cujo `covers` já inclui os nós certos:
rules/knowledge/a-released-hypothesis-revision-is-never-altered, domain/knowledge/hypothesis-revision,
domain/knowledge/hypothesis-revision-state, constraints/the-schema-replays-from-its-scripts) —
não é necessário alterar esse epic, só adicionar uma task nova sob ele.

O teste-irmão já correto (mesma base, state-only) é
src/src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts,
entregue por esta mesma iniciativa.

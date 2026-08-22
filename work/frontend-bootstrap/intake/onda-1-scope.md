# Escopo: Onda 1 -- fundação de dados, navegação e casca visual

Onda 1 de 6 do plano em `.claude/plans/precious-skipping-summit.md`, fonte
`docs/frontend-triage-console-proposal.md`. Nenhuma tela de negócio ainda.

Constrói:
- `AppShell`: sidebar (`Cases`, `Glossary`, `Capabilities` -- sem `Hypotheses` de topo, decisão de
  2.10 da proposta), topbar com breadcrumb e indicador fixo "No auth in this build" (seção 0).
- Árvore de rotas vazia via `@tanstack/react-router`, uma rota por tela 2.1-2.10, cada uma um
  placeholder sem layout ainda.
- Cliente de API tipado: fetch wrapper lendo o envelope real do backend
  `{error:{code,message,details?}}` (confirmado em `src/src/http/error-handler.middleware.ts`) em
  um `ApiError` tipado.
- Tabela erro→estado de UI (API-02) cobrindo os 10 erros mapeados em `src/src/errors/status-map.ts`:
  - 404: `CaseNotFoundError`, `ConceptNotAnsweredError`, `ConceptNotHeldError`, `VocabularyTermNotHeldError`
  - 409: `CaseAlreadyHasDraftError`, `ManifestPositionOccupiedError`, `CaseVersionNotDraftError`, `CaseVersionNotDraftAtReleaseError`
  - 422: `CaseVersionNotReleasableError`, `ManifestWouldHoldNoHypothesisError`
  - fallback genérico para os 4 que caem em 500 sem mapa: `CaseHoldsNoDraftError`,
    `ConceptNotInGlossaryError`, `ConceptRefusesSubjectTypeError`, `CaseNotValidError` (risco #3 da
    proposta).
- Banner de conflito reutilizável (seção 2.3 da proposta).
- Hook do catálogo de 8 eventos de telemetria (seção 3) -- sink = `console.info` namespaced,
  decisão registrada em `temp/frontend-console-decisions.md` (sem endpoint real conhecido).
- Tabela reutilizável (linha clicável, estado sempre cor+palavra) composta sobre `@tui/ui/table`,
  reusada por Cases List (Onda 2), Glossary e Capabilities (Onda 6).
- `@tanstack/react-query` como camada de cache de server-state (STA-01).
- Um único `<Toaster/>` (sonner) no AppShell -- react-hook-form/zod/sonner ficam disponíveis mas só
  entram em uso real nas ondas 2-5 (formulários e toasts de tela).

Nenhum nó de specification é implementado aqui -- é arquitetura, não fato de negócio.

Standard já expandido com os 5 pacotes desta onda antes deste corte (pin
`sha256:154d391b6346febbd273d5806c95730da5db7e6ffa3df544a9792398002295e5`).

Evolui `work/frontend-bootstrap` (initiative já aberta). Epic novo dedicado a esta fundação
cross-cutting, usada tanto pelo epic `case-authoring-console` (já existente, de `build-substrate`)
quanto pelo futuro epic de Glossary/Capabilities (Onda 6).

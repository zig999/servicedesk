# Pre-existing Concept literals must satisfy the widened, required description

`domain/glossary/concept` (rules/glossary/a-concept-declares-its-description) already requires
`description: string` on every `Concept`. `task/concept-description/concept-registration-requires-a-description`
already widened `src/src/glossary/terms.ts`'s `Concept` type to match, and `Concept.description`
became required across the whole tree.

That widening broke `npm run typecheck` in pre-existing test files no task of this plan covers —
none of them test anything about `description`, they are unrelated fixtures/doubles that happen to
construct a bare `Concept`-shaped object literal:

- `src/src/__tests__/unit/case/case-query.service.spec.ts`
- `src/src/__tests__/unit/case/validate-case-coherence.spec.ts`
- `src/src/__tests__/unit/http/build-app.spec.ts` (its `stubGlossaryQuery()`/`stubRegisterConcept()`
  helpers)

## What this scope asks for

Every `Concept`-shaped object literal in the backend tree, outside the file sets the three
existing `concept-description` tasks already own (`concept-registration-requires-a-description`,
`concept-persistence-carries-description`, `read-concept-returns-description`), must satisfy the
now-required `description` attribute — with **no change to any existing assertion or behavior**.
This is fixture maintenance against a domain fact the specification already decided, not a new
business decision: the value each literal carries for `description` is an arbitrary, plausible
placeholder, since none of these files test anything about what `description` means or does.

The three files named above are the ones a build already found; the codebase-surveyor run for
this increment should sweep the whole target source root for any other `Concept`-shaped literal
outside the three existing tasks' own file sets, so this task's criteria are exhaustive rather than
matching only what one build run happened to surface.

## Authorization

The human, through `/deliver-scope pinned-evidence-semantics` ("continue com o plan-work
recomendado e siga para as próximas ações até o review-change"), asked to continue the route that
was stopped over this exact build failure — see `delivery/pinned-evidence-semantics/orchestration.md`
for the stopped attempt's own account.

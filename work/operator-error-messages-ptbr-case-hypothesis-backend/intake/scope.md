# Escopo

Traduzir para PT-br as mensagens de erro/recusa do domínio de case e hypothesis que o
backend (target `backend`, `src/`) expõe ao operador via envelope HTTP de erro
(`src/src/http/error-handler.middleware.ts`), e onde a mensagem não for clara o
suficiente para o operador entender o problema, reescrevê-la em PT-br para dar mais
clareza — mantendo o mesmo sentido/fato que a mensagem original já declarava, sem
introduzir informação nova.

As classes de erro concretas envolvidas, hoje em inglês, ficam em `src/src/errors/`:

- `case-not-found.error.ts` — "no version {version} of the case "{slug}" is stored"
- `case-version-not-valid.error.ts` — "the case "{slug}" at version {version} violates its validator rules: {violations}"
- `incoherent-case.error.ts` — "the case "{slug}" violates its coherence rules: {violations}"
- `case-already-has-draft.error.ts` — "the case "{slug}" already holds a version in draft state, and a case has at most one draft at a time"
- `case-holds-no-draft.error.ts` — "the case "{slug}" holds no version in draft state, and a hypothesis is revised only against its case's draft"
- `case-version-not-draft.error.ts` — "case "{slug}" version {version} is in state "{state}", not draft"
- `case-version-not-released.error.ts` — "the case "{slug}" version {version} is in state "{state}", and diagnosis only ever runs against a released version"
- `case-version-not-draft-at-release.error.ts` — "the case "{slug}" version {version} is in state "{state}", and release is the one trigger that only ever moves a version out of draft"
- `case-version-not-releasable.error.ts` — "the case "{slug}" version {version} cannot be released: {violations}"
- `case-version-already-stored.error.ts` — "the case "{slug}" already has a stored version {version}, and a case version is written once and never altered"
- `invalid-case-document.error.ts` — "the case document "{file}" violates its structural rules: {problems}"
- `hypothesis-not-in-manifest.error.ts` — "hypothesis "{hypothesis}" is not in the manifest of case "{slug}" version {version}"
- `concept-not-in-glossary.error.ts` — "hypothesis "{name}" of case "{slug}" collects a concept the glossary does not hold: {concepts}"
- `concept-refuses-subject-type.error.ts` — "hypothesis "{name}" of case "{slug}" collects a concept that does not accept the subject type "{subject}" the case version declares: {concepts}"
- `hypothesis-revision-collects-no-concept.error.ts` — "hypothesis "{name}" of case "{slug}" collects no concept, and a hypothesis-revision collects at least one"
- `hypothesis-revision-not-draft-at-release.error.ts` — "this hypothesis-revision is not in draft state, and release is the one trigger that only ever moves a hypothesis-revision out of draft"
- `released-hypothesis-revision-not-alterable.error.ts` — "hypothesis "{name}" revision {n} of case "{slug}" is referenced by a case version in released state, and a released hypothesis revision is never altered"
- `manifest-position-occupied.error.ts` — "case "{slug}" version {version} already places a hypothesis at position {position}, and a manifest position is unique within its case version"
- `manifest-would-hold-no-hypothesis.error.ts` — "removing this entry would leave case "{slug}" version {version}'s manifest holding no hypothesis, and a case version's manifest declares at least one entry"

## Referência de tom

As mensagens PT-br já existentes em `frontend/app/src/services/connector-configuration-messages.ts`
e `frontend/app/src/services/capability-schema-messages.ts` servem de referência de tom e estilo
(frases diretas, sem jargão interno, terminando com o fato relevante ao operador).

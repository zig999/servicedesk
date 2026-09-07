# Corrective increment — the frontend's error mapping keys on a name the backend no longer sends

The human's ask, verbatim (in the session's own language, Portuguese):

"Incremento corretivo. Projeto: /home/siegfriedneto/projects/servicedeskn1. Target: frontend.
Slug da iniciativa: case-not-valid-error-code-frontend. Comportamento errado, observado rodando
o sistema entregue: uma versão corrente que não valida é recusada pelo backend como
CaseVersionNotValidError com HTTP 409, mas o mapeamento de erro do frontend ainda chaveia pelo
nome antigo CaseNotValidError, então a busca erra, cai no estado genérico de erro e a tela deixa
de dizer ao curador que a versão corrente não lê de volta como caso — o estado case-not-valid
virou código inalcançável. Arquivo em que o comportamento errado vive:
frontend/app/src/services/error-ui-state.ts"

## The wrong behavior, as observed

A case whose current version fails a validator rule at a read is refused by the backend with an
HTTP 409 response whose error code is CaseVersionNotValidError.
The frontend's own mapping from an API error code to a user-facing state, UI_STATE_BY_ERROR_CODE
in frontend/app/src/services/error-ui-state.ts, holds the key CaseNotValidError — the name that
refusal carried before it was renamed.
uiStateForApiError reads UI_STATE_BY_ERROR_CODE[error.code] and falls back to GENERIC_ERROR_STATE
where the lookup finds nothing, so the refusal the backend now sends reaches the curator as the
generic error state.
The consequence on the surface is that a case whose current version does not read back as a case
is presented exactly as a read that did not complete, and the case-not-valid state the mapping
still declares is unreachable.

## The file the wrong behavior lives in

frontend/app/src/services/error-ui-state.ts

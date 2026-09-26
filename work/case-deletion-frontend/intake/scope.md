Ask (quoted verbatim): "pode fazer o plan, implement e review, para front e backend conforme
necessário."

Scope for this initiative (case-deletion-frontend, target frontend): the frontend half of the
already-delivered backend case-deletion capability. The backend now exposes
DELETE /v1/cases/:slug, accepted (204, no body) only for a case holding no case version — refused
with a 409 CaseHoldsVersionsError for any case holding a version, and a 404 CaseNotFoundError for
an unknown slug — per rules/knowledge/a-case-holding-no-version-may-be-deleted,
constraints/a-successful-case-deletion-answers-with-no-content and
scenarios/knowledge/a-case-holding-no-version-is-deleted (case-deletion-backend, delivered and
reviewed, now closed). The frontend must offer a curator a way to invoke this delete over a case
that currently holds no version, present the same accepted/refused outcomes the specification
already states, and reflect the deleted case's disappearance from wherever the UI shows cases.
This is a capability's surface the specification already holds in full; no /analyse is expected.

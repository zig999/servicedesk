---
target: backend
title: CaseHoldsVersionsError refusal — proof
summary: Unit tests over CaseHoldsVersionsError's own shape and its registration in
  the status map, proving every stated criterion and the two named underdetermined
  implementations, with the four implemented nodes left to a reading since none is
  decided whole within this task's scope.
implementation: sha256:83c6ae14a43d8a33ad013a32da17b1fbc18ea309056eb5e8e7298cb9a3aba01a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-deletion-case-holds-versions-refusal-suite
tests:
- file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  name: keeps its class-name string unchanged
  proves: The response to a CaseHoldsVersionsError carries the error code CaseHoldsVersionsError
    — this test pins the class's own .name, the half of the fact this task owns; the
    unchanged mapping of error.name to the response's code field is already proven
    generically by src/__tests__/unit/http/error-handler.middleware.spec.ts.
  fails_when: error.name stops reading exactly "CaseHoldsVersionsError" — renamed,
    misspelled, or left at the default "Error".
- file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  name: names the case slug in a Brazilian-Portuguese message that calls the case
    "caso" and never the English word "case"
  proves: The message of a CaseHoldsVersionsError names the case slug it was raised
    for; is written in Brazilian Portuguese; names the case by the word "caso"; and
    contains no occurrence of the English word "case" for the case.
  fails_when: the message stops containing the exact slug it was constructed with,
    stops containing the standalone word "caso", stops containing a Portuguese-only
    word evidencing the language, or gains a standalone occurrence of the English
    word "case".
- file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  name: holds exactly the slug it was constructed with, in its context, and no other
    field
  proves: The details of a CaseHoldsVersionsError carry the case slug it was raised
    for, and carry no field other than the case slug.
  fails_when: 'error.context stops equaling exactly { slug: <the constructed slug>
    } — a missing slug, a renamed key, or any extra field would fail the exact-equality
    assertion.'
- file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  name: names the remaining version by its fixed Portuguese noun "versão", unlike
    an implementation that would satisfy criteria 6-8 alone by writing the English
    word "versions" and the raw lifecycle token "draft"
  proves: UNDERDETERMINED, from the specification — criteria 6-8 hold only the noun
    "caso" and the ban on the English word "case"; constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
    also fixes "versão" for a case version, "rascunho" for draft and "liberada" for
    released, and forbids their English words and any raw lifecycle token, none of
    which any criterion here checks.
  fails_when: the message uses "version"/"versions" instead of "versão", or contains
    the raw lifecycle token "draft" — exactly the implementation the Notes entry names
    as passing criteria 6-8 while breaching the constraint.
- file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  name: extends Error directly and carries no status of its own, unlike an implementation
    that would satisfy every stated criterion by subclassing a web framework's own
    HTTP error type and setting status 409 itself
  proves: UNDERDETERMINED, from the specification — no criterion says which layer
    attaches the HTTP 409 to CaseHoldsVersionsError, and constraints/the-domain-depends-on-no-infrastructure
    bars the domain layer from importing any framework.
  fails_when: CaseHoldsVersionsError stops extending Error directly (its prototype
    chain reroutes through some other base, such as a framework's HTTP-error class)
    or gains a self-carried statusCode property — exactly the implementation the Notes
    entry names as passing every criterion while breaching constraints/the-domain-depends-on-no-infrastructure.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseHoldsVersionsError to 409
  proves: A CaseHoldsVersionsError raised from a route handler is answered with HTTP
    409 — the class-specific half of this fact (that CaseHoldsVersionsError is registered
    at 409 in the one place the standard's COR-04 requires the mapping to live); the
    generic behavior that a status the map assigns is what the middleware actually
    sends to the caller is already proven, repeatedly, by src/__tests__/unit/http/error-handler.middleware.spec.ts
    against several other mapped errors and is unchanged by this delivery.
  fails_when: statusForError(new CaseHoldsVersionsError(...)) stops returning 409
    — the class is dropped from the map, mis-registered under a different status,
    or shadowed by an earlier, wrongly-matching entry.
not_applicable:
- edge_case: An absent or malformed case slug passed to the constructor
  why: No criterion of this task distinguishes slug shapes; the constructor interpolates
    and stores whatever string it receives, and the slug's own validity is a fact
    of the case it names, decided upstream of this error class by whatever raises
    it.
- edge_case: Concurrent or repeated construction of the error
  why: CaseHoldsVersionsError is a stateless, immutable Error subclass with no state
    shared across instances; nothing here can race or interleave.
- edge_case: The accept branch of the delete operation, and the condition that chooses
    between accepting and refusing it
  why: The task's own Notes mark this REMAINDER, assigned to task/case-deletion/delete-case-over-case-lifecycle
    and task/case-deletion/store-deletes-a-versionless-case; this task implements
    only the named error and its status mapping, not the decision to raise it.
- edge_case: An error the status map does not name reaching the generic 500 fallback
  why: Criterion 1 presupposes CaseHoldsVersionsError is registered in the map; the
    fallback behavior for an error the map does not name is error-handler.middleware.ts's
    own generic behavior, already covered by its existing tests, and states no obligation
    of this task.
untested:
- rules/knowledge/a-case-holding-no-version-may-be-deleted's stated fact spans both
  the accept condition and the refuse condition; this task implements only the refuse
  half (the error, its message and its 409 mapping), so no test written here decides
  the node's fact whole — the accept branch and the condition that chooses between
  them are deferred to task/case-deletion/delete-case-over-case-lifecycle and task/case-deletion/store-deletes-a-versionless-case,
  which this delivery does not touch.
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese is stated
  system-wide, over every domain error the status map names, with its own fitness
  reading a test that raises each one from a route handler; this delivery's tests
  prove Brazilian Portuguese for CaseHoldsVersionsError's own message alone, not the
  totality across every other registered error, so no finite test written within this
  task decides the node whole.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  is likewise stated system-wide, over every domain refusal the error envelope carries,
  fixing nine nouns; this delivery's tests prove the vocabulary fixed for CaseHoldsVersionsError's
  own message ("caso", "versão", no raw lifecycle token) but not the totality across
  the other eight error classes and every other refusal the constraint reaches, so
  no finite test here decides it whole.
- constraints/the-domain-depends-on-no-infrastructure is decided by the project's
  own dependency-audit lint step per the standard's lint command, not by a unit test,
  and its statement scopes the domain modules (case, glossary, capability-registry,
  connector-registry, investigation) rather than the shared errors/ directory this
  delivery touches; no test decides it and none is written here.
---

## What it is

Unit tests proving CaseHoldsVersionsError's own shape (name, message, context) and its 409 registration in the status map.

## Notes

None.

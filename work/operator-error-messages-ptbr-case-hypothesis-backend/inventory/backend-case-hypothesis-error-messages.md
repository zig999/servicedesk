---
title: Backend case/hypothesis domain error classes and the HTTP error envelope
summary: Domain error classes under src/src/errors/, the message-construction pattern
  they share, the error-handler middleware/status-map that turns them into the client
  envelope, and the absence of any i18n mechanism.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
area:
- /home/siegfriedneto/projects/servicedeskn1/src/src/errors
- /home/siegfriedneto/projects/servicedeskn1/src/src/http
- /home/siegfriedneto/projects/servicedeskn1/src/src/__tests__
modules:
- name: errors
  path: src/src/errors
  role: touched
- name: http-error-handling
  path: src/src/http/error-handler.middleware.ts
  role: depends-on
- name: status-map
  path: src/src/errors/status-map.ts
  role: depends-on
- name: tests-errors
  path: src/src/__tests__/unit/errors
  role: adjacent
---
## What it is
`src/src/errors/` holds one file per domain error class (69 files total, no barrel/index), each a subclass of `Error` in English.
19 of these classes are named in the scope as the case/hypothesis-domain messages to translate to PT-br: `case-not-found.error.ts`, `case-version-not-valid.error.ts`, `incoherent-case.error.ts`, `case-already-has-draft.error.ts`, `case-holds-no-draft.error.ts`, `case-version-not-draft.error.ts`, `case-version-not-released.error.ts`, `case-version-not-draft-at-release.error.ts`, `case-version-not-releasable.error.ts`, `case-version-already-stored.error.ts`, `invalid-case-document.error.ts`, `hypothesis-not-in-manifest.error.ts`, `concept-not-in-glossary.error.ts`, `concept-refuses-subject-type.error.ts`, `hypothesis-revision-collects-no-concept.error.ts`, `hypothesis-revision-not-draft-at-release.error.ts`, `released-hypothesis-revision-not-alterable.error.ts`, `manifest-position-occupied.error.ts`, `manifest-would-hold-no-hypothesis.error.ts`.
`src/src/http/error-handler.middleware.ts` is the sole point where a thrown `Error` becomes the client-facing JSON envelope `{ error: { code, message, details? } }`: `code` is `error.name`, `message` is `error.message` verbatim, `details` is `error.context` when present.
`src/src/errors/status-map.ts` maps each concrete domain error class to an HTTP status via `instanceof` checks against a `ReadonlyMap`; it imports every mapped error class by name (including all 19 case/hypothesis classes), so the map itself is a full-text touch point even though it never reads `.message`.
No i18n/localization mechanism exists anywhere under `src/` — no `i18n`, `locale`, `translat*`, or `intl` hits outside unrelated matches; the middleware and every error class hard-code English text with no lookup layer.

## Notes
None.

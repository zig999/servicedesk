---
title: How each domain error's message is built
summary: The shared constructor pattern every domain error class in src/src/errors/
  follows to build its English message and carry structured context.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
area:
- /home/siegfriedneto/projects/servicedeskn1/src/src/errors
conventions:
- statement: The message is a template literal passed straight to super() in the constructor
    — no intermediate message-builder function — while a public readonly context field
    (or, for parameterless errors, no context field at all) carries the same values
    as structured data alongside it.
  seen_at: src/src/errors/case-not-found.error.ts
- statement: Some error classes take positional constructor arguments (slug, version,
    ...) and build context from them inline; others take a single typed context object
    as the sole constructor argument and both build the message from it and spread
    it into this.context.
  seen_at: src/src/errors/concept-refuses-subject-type.error.ts
- statement: error.name is always set to the class name as a string literal, independent
    of the message text, and is what status-map.ts keys HTTP status on and what the
    envelope reports as code — so translating the message never touches name or the
    status mapping.
  seen_at: src/src/errors/hypothesis-not-in-manifest.error.ts
- statement: A minority of error classes (e.g. HypothesisRevisionNotDraftAtReleaseError)
    take no constructor arguments at all and have a fully fixed English message with
    no interpolation and no context property — translation there is a plain string
    replacement with no template to preserve.
  seen_at: src/src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
must_not_duplicate:
- what: The context object on each error class, which already carries every structured
    value (slug, version, violations, hypothesis name, subject, position, etc.) referenced
    by the message — translating the message string must not touch, rename, or duplicate
    these fields.
  at: src/src/errors/*.error.ts
- what: The envelope-shaping logic in error-handler.middleware.ts (domainEnvelope/clientEnvelope,
    and hasContext), which already decides when details is included — no new branching
    is needed to carry a translated message through.
  at: src/src/http/error-handler.middleware.ts
---
## What it is
Every one of the 69 domain error classes under src/src/errors/ constructs its message the same way: a template literal built inline in the constructor and passed to super(), with a sibling context field holding the same interpolated values as data.
The message text and the context field are populated independently in the same constructor body — translating the string requires touching only the super(...) line, not the context assignment.

## Notes
None.

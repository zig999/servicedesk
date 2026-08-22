---
title: Proof for widening GlossaryVocabulary's union
summary: Direct renderHook tests against useGlossaryVocabularyOptions proving the subject-attribute request/mapping,
  the four pre-existing vocabularies' unchanged behavior, and the edge cases the widening raises.
implementation: sha256:c092286a74dd73c26b00e8762389569840f471e46caf49201ab6a56e087db94f
run: run/glossary-and-capabilities-browser-onda-6-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions("subject-attribute") > issues a GET to /v1/glossary/subject-attribute
    and maps the page's terms to {value, label} options, called with the literal typed with no cast
  proves: GlossaryVocabulary's type declaration includes "subject-attribute" as a fifth member. AND Calling
    useGlossaryVocabularyOptions("subject-attribute") issues a GET request to /v1/glossary/subject-attribute
    and returns that page's data as Select options, using the same {value, label} mapping the hook already
    applies to its other four vocabularies.
  fails_when: GlossaryVocabulary no longer includes "subject-attribute" (this test file would then fail
    the project's own tsc --noEmit typecheck step), or the hook stops issuing a GET to /v1/glossary/subject-attribute
    for that vocabulary, or the returned page's terms stop being mapped to {value, label} pairs identical
    to each term's own name
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions("subject-attribute") > returns an empty options array, rather than
    throwing or leaving it undefined, when the subject-attribute page holds no terms yet
  proves: Calling useGlossaryVocabularyOptions("subject-attribute")... exercised over the empty-collection
    edge case, since the fifth vocabulary's page can hold no terms yet.
  fails_when: options is left undefined, null, or throws, instead of resolving to an empty array, when
    the subject-attribute page's data array is empty
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions("subject-attribute") > reports isError, with options staying empty,
    when the subject-attribute request fails
  proves: the hook's generic error passthrough (isLoading/isError/refetch) is not special-cased for the
    fifth vocabulary -- a dependency-failure edge case this widening raises.
  fails_when: isError stays false after the subject-attribute request rejects, or options holds anything
    other than an empty array while the request is in a failed state
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions, the four pre-existing vocabularies > still issues a GET to /v1/glossary/outcome
    and maps its own terms to {value, label} options, unaffected by the fifth vocabulary's addition
  proves: Every existing call site of useGlossaryVocabularyOptions still compiles and behaves unchanged
    -- the "outcome" case.
  fails_when: calling the hook with "outcome" stops issuing GET /v1/glossary/outcome, or the returned
    terms stop mapping to {value, label} pairs the way they did before this widening
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions, the four pre-existing vocabularies > still issues a GET to /v1/glossary/action
    and maps its own terms to {value, label} options, unaffected by the fifth vocabulary's addition
  proves: Every existing call site of useGlossaryVocabularyOptions still compiles and behaves unchanged
    -- the "action" case.
  fails_when: calling the hook with "action" stops issuing GET /v1/glossary/action, or the returned terms
    stop mapping to {value, label} pairs the way they did before this widening
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions, the four pre-existing vocabularies > still issues a GET to /v1/glossary/recipient
    and maps its own terms to {value, label} options, unaffected by the fifth vocabulary's addition
  proves: Every existing call site of useGlossaryVocabularyOptions still compiles and behaves unchanged
    -- the "recipient" case.
  fails_when: calling the hook with "recipient" stops issuing GET /v1/glossary/recipient, or the returned
    terms stop mapping to {value, label} pairs the way they did before this widening
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: useGlossaryVocabularyOptions, the four pre-existing vocabularies > still issues a GET to /v1/glossary/subject-type
    and maps its own terms to {value, label} options, unaffected by the fifth vocabulary's addition
  proves: Every existing call site of useGlossaryVocabularyOptions still compiles and behaves unchanged
    -- the "subject-type" case.
  fails_when: calling the hook with "subject-type" stops issuing GET /v1/glossary/subject-type, or the
    returned terms stop mapping to {value, label} pairs the way they did before this widening
not_applicable:
- edge_case: two calls of the hook (for the same or different vocabularies) racing at once
  why: no criterion or bound node states concurrent-request behavior for this hook, and its deduplication/caching
    across simultaneous calls is @tanstack/react-query's own generic behavior, untouched by this widening.
- edge_case: a boundary at either end of a stated range
  why: none of the three criteria states a range this hook enforces.
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion claims uniqueness over a vocabulary's terms or over the union's members.
- edge_case: calling the hook with no vocabulary argument
  why: GlossaryVocabulary's own parameter is required at the type level; an argumentless call is a compile
    error under the project's typecheck step, not a runtime case this test file can trigger or observe.
- edge_case: an operation against state that forbids it
  why: this hook has no state machine of its own to forbid an operation against.
- edge_case: the request answering slowly, exercised as its own case distinct from isLoading's ordinary
    transition
  why: no criterion of this task governs a loading-state guarantee beyond what already generically applies
    to every vocabulary, unchanged by this widening.
untested:
- Criterion 1's pure type-membership fact -- that GlossaryVocabulary's declared union literally contains
  "subject-attribute" -- is exercised in this proof only through a no-cast literal assignment inside a
  .spec.ts file; the actual enforcement of that fact happens in the project's own tsc --noEmit typecheck
  step, a separate command from vitest run, which strips TypeScript types before executing and would not
  itself fail if the union regressed.
- Whether each of the six named existing consumers (use-hypothesis-revision-form.ts, use-edit-draft-version-form.ts,
  use-new-draft-version-form.ts, case-version-editor-form-fields.tsx, hypothesis-revision-form-fields.tsx,
  release-checklist.ts) still compiles against the widened type is not verified by this proof directly
  -- it tests the hook's own contract in isolation, not each consumer file's own compilation, which is
  the whole project's tsc --noEmit/build's concern.
---

## What it is
Seven renderHook tests over useGlossaryVocabularyOptions, proving the fifth vocabulary's request/mapping/empty/error behavior and that all four pre-existing vocabularies keep behaving exactly as before.

## Notes
No spec file existed for this hook before this delivery; authored src/hooks/use-glossary-vocabulary.spec.ts as a new sibling file, mirroring api-client.spec.ts's network-boundary-only stubbing convention (vi.stubGlobal("fetch", ...) returning real Response objects) combined with renderHook + a real QueryClientProvider (retry disabled).

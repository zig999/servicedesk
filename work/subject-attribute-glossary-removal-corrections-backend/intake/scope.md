# Scope: corrective increment over subject-attribute-glossary-removal-backend

Four findings from `/review-change` over `subject-attribute-glossary-removal-backend`
(delivery/subject-attribute-glossary-removal-backend/review/subject-attribute-glossary-removal-backend.md),
triaged and authorized for correction:

1. **The already-decided HTTP 422 refusal for an empty simulate subject is unreachable.**
   `src/http/dto/simulate-case.dto.ts` and `src/http/dto/simulate-hypothesis.dto.ts` both declare
   `attributes: z.array(subjectAttributeValueSchema).min(1)`, so Fastify's own schema validation
   refuses an empty `attributes` array with HTTP 400 before either controller ever runs — before
   `buildSubject` gets a chance to throw `SubjectCarriesNoAttributeError`, which `status-map.ts`
   already maps to 422. This contradicts the specification's own decided fact
   (decision-log.md, location rules/investigation/a-subject-carries-at-least-one-attribute.md:
   "A call whose subject carries no attribute-value is refused with an HTTP 422 response
   reporting a SubjectCarriesNoAttributeError... 400 being reserved by
   a-malformed-request-is-refused-with-a-validation-error for the route's declared shape") — an
   empty array is not a malformed shape, so 400 is not the route's own declared-shape refusal
   here, and the 422 path the decision explicitly names never runs.
   `src/__tests__/unit/http/build-app.spec.ts` locks in the wrong status for both routes.

   Scoped to simulate-case and simulate-hypothesis only: `diagnose.controller.ts` never calls
   `buildSubject` at all (it checks case-input-requirements coverage instead, a different and
   more specific rule), so loosening `diagnose.dto.ts`'s own `attributes` schema is a separate
   question with its own risk (an empty subject could then silently pass a case with no required
   inputs) and is explicitly out of scope for this correction.

2. **Leftover `SubjectAttribute` type alias.** `src/glossary/terms.ts` still exports
   `type SubjectAttribute = GlossaryTerm;`, implying a fifth governed vocabulary that no longer
   exists — dead residue of the original removal.

3. **`DuplicateConceptAnswerError` is never mapped in `status-map.ts`.** A concept read that
   finds two capabilities answering it throws this class; `statusForError` finds no entry and
   falls through to a generic 500/INTERNAL_ERROR. Pre-existing bug, surfaced during this
   initiative's own review.

4. **`run-diagnosis.ts` reports the wrong `remainingMs`.** `writeWithinDeadline`'s
   `InvestigationWriteDeadlineExceededError` is thrown with `stageBoundMs` — the bound persistence
   was granted at entry — instead of the milliseconds actually remaining of the declared deadline
   at the moment persistence gave up, which is what the node requires. Pre-existing bug, surfaced
   during this initiative's own review.

Out of scope: every other review finding (test-quality/spec-silence findings judged lower
priority — see the triage report). No new specification decision is needed for any of these four;
items 2-4 are code fixes with no governing node to reinterpret, and item 1 already has a decided
fact the code contradicts.

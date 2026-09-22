---
target: backend
title: PT-br messages for the two refusals a hypothesis revision's own state raises — proof
summary: Tests for HypothesisRevisionNotDraftAtReleaseError's and ReleasedHypothesisRevisionNotAlterableError's
  PT-br messages, combining new tests with citations of pre-existing tests that already decide obligations
  this task's own message change did not touch.
implementation: sha256:e43de4839dfcc48d86321abacbbc7ac5e94f066b8f2a6f3afb1c01755bcf8fdf
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-refusal-messages-hypothesis-revision-state-messages-suite-2
tests:
- file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  name: carries no context property at all, taking no constructor argument to build one from
  proves: HypothesisRevisionNotDraftAtReleaseError names no hypothesis, no revision number and no case,
    and still takes no constructor argument and declares no context property.
  fails_when: the class gains a context property or its constructor gains a parameter.
- file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  name: answers its own condition through a fixed name and message, unshaped by any argument
  proves: The message is in PT-br and states both that the revision is not in draft and that release is
    the sole trigger out of draft; FIXED_MESSAGE holds that text character for character; name is unchanged.
  fails_when: the message text stops being the exact PT-br sentence, or error.name stops equaling 'HypothesisRevisionNotDraftAtReleaseError'.
- file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  name: names the revision and the draft state with their fixed Portuguese words, using no English domain
    noun for either
  proves: The message uses "revisão" and "rascunho" and no English domain noun.
  fails_when: the message drops "revisão" or "rascunho", or reintroduces "revision" or "draft".
- file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  name: carries no language distinguishing which of its two triggers raised it
  proves: 'UNDERDETERMINED note: the refusal discloses no more than its own condition and message, never
    which trigger raised it.'
  fails_when: the message names either triggering condition explicitly.
- file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
  name: refuses with 409 and the class's own code and message, carrying no details field at all
  proves: status-map.ts still maps HypothesisRevisionNotDraftAtReleaseError to HTTP 409, and no details
    field reaches the response.
  fails_when: the route stops answering 409, or a details field appears.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ReleasedHypothesisRevisionNotAlterableError to 409
  proves: status-map.ts still maps ReleasedHypothesisRevisionNotAlterableError to HTTP 409.
  fails_when: status-map.ts stops mapping this class to 409.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  name: states in Brazilian Portuguese that the revision is itself in released state and is never altered,
    naming the hypothesis, the revision number and the case slug
  proves: The message is in PT-br, names hypothesis/revision/slug, and states the revision itself is in
    released state.
  fails_when: any of those facts stops being stated, or the text changes.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  name: never attributes the immutability to a case version that references the revision
  proves: The message never attributes immutability to a referencing case version -- the deliberate correction.
  fails_when: the message reintroduces a reference to a case version's own release.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  name: names the case, the hypothesis and the revision with their fixed Portuguese words, and the state
    as liberada, using no English domain noun
  proves: The message uses "caso", "hipótese", "revisão" and "liberada", and no English domain noun.
  fails_when: a fixed word is dropped, or an English domain noun is used.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  name: is distinguishable from HypothesisRevisionNotDraftAtReleaseError by text alone
  proves: The two messages are distinguishable from one another by their text alone.
  fails_when: the two messages become textually identical.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: The class's name property still holds its unchanged class-name string.
  fails_when: error.name stops equaling 'ReleasedHypothesisRevisionNotAlterableError'.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  name: carries exactly the slug, hypothesis name and revision it was constructed with in context
  proves: The context property holds exactly the properties and values it held before.
  fails_when: context gains, loses or renames a property, or a value stops matching.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: reads back a released hypothesis-revision's own collects exactly as they were stored, after an
    ordinary DELETE against those exact rows is attempted
  proves: ReleasedHypothesisRevisionNotAlterableError's refusal is scoped; a removal of one of its collects
    is accepted with no effect rather than refused.
  fails_when: a DELETE against a released revision's own collect row either throws or actually removes
    the row.
- file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError
  proves: rules/knowledge/a-released-hypothesis-revision-is-never-altered's own invariant, whole.
  fails_when: an UPDATE against a released revision's criterion either succeeds or is silently discarded.
  demonstrates: rules/knowledge/a-released-hypothesis-revision-is-never-altered
not_applicable:
- edge_case: Absent, empty-string or malformed slug, hypothesis name or revision reaching the constructor
  why: validation happens at the boundary, not inside this error class.
- edge_case: Concurrent construction, or two operations against one subject at once
  why: an error class instance carries no shared or mutable state.
- edge_case: A dependency that is unavailable, slow, or answers in an unexpected shape
  why: neither error class performs I/O or calls a dependency.
- edge_case: A duplicate or a uniqueness violation
  why: these are stateless value-carrying errors, not stored entities.
untested:
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle -- its fact is compound;
  pre-existing coverage is split across separate tests untouched by this task.
- domain/knowledge/hypothesis-revision, domain/knowledge/hypothesis and domain/knowledge/case -- each
  is an aggregate-root's full structural definition; no finite test over an error message decides that
  whole shape.
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese -- system-wide fitness; no
  comprehensive test exists.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word -- same system-wide
  totality.
- The suite-passing and no-other-file-changed facts are diff/build-shape claims, decided by reading the
  changeset and the standard's build steps.
- Whether some other undocumented fact was introduced elsewhere in the phrasing is not finite-testable
  without the retired English text.
---
## What it is
Tests proving the two hypothesis-revision-state refusals' PT-br message content, the
undisclosed-trigger discipline, the corrected causality, and preserved name/context/status-map,
plus citations of pre-existing tests that already decide the collects-removal exception.

## Notes
One fixture defect (hypothesis-name value "another-hypothesis" tripping its own negative regex)
was found and fixed during this proof's own review cycle, the same class of defect found twice
already in this initiative.

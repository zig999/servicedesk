---
title: Revise decides overwrite-vs-create from a hypothesis-revision's own state column
summary: ReviseHypothesisOperation's overwrite/insert branch and the port/repository seam it reads now
  decide from hypothesis_revisions.state directly, replacing the manifest-join reading.
task: sha256:f8f7493a4e89a063533121436cb2f69f68010c2cd6076da0a09bc2d54ade0926
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-build
files:
- path: src/case/hypothesis-revision-release-state.port.ts
  effect: 'HighestRevisionReleaseState''s revision-present branch now carries the revision''s own state:
    HypothesisRevisionState instead of a computed released_referenced: boolean; the port imports only
    that type from case-store.port.js.'
- path: src/case/revise-hypothesis.operation.ts
  effect: writeRevision reads the highest revision's own state and branches on highest.state === 'draft'
    (overwrite in place, keeping the revision number) rather than on !released_referenced; falls through
    to insertHypothesisRevision for released, no-revision or unrecognized-shape reads alike.
- path: src/persistence/relational-case-store.repository.ts
  effect: resolveHighestRevisionReleaseState/highestRevisionReleaseStateSelect now SELECT revision, state
    FROM hypothesis_revisions ... ORDER BY revision DESC LIMIT 1 (no join to case_version_hypotheses/case_versions,
    no CTE); added hypothesisRevisionStateOf/isHypothesisRevisionState (mirroring the existing caseVersionStateOf/isCaseVersionState
    pattern) and the HYPOTHESIS_REVISION_STATE_VALUES set built from the exported HYPOTHESIS_REVISION_STATES.
criteria:
- criterion: Revising a hypothesis whose highest existing revision's own state is draft replaces that
    revision's content in place and leaves its number unchanged.
  met: true
  how: writeRevision's highest.state === 'draft' branch calls overwriteHypothesisRevision with highest.revision,
    the same number read, and returns that same number.
- criterion: Revising a hypothesis whose highest existing revision's own state is released creates that
    hypothesis's next revision, in draft state, leaving the released revision's content unchanged.
  met: true
  how: A state !== 'draft' read falls through to insertHypothesisRevision, which always writes HYPOTHESIS_REVISION_DRAFT_STATE
    and assigns COALESCE(MAX(revision),0)+1 — it never issues a statement against the existing row.
- criterion: Revising a hypothesis whose highest existing revision's own state is released and which no
    case version's manifest references creates the next revision rather than replacing that revision.
  met: true
  how: The new query and branch read only hypothesis_revisions.state; no case_version or case_version_hypotheses
    table is read or joined anywhere in this path.
- criterion: Revising a hypothesis whose highest existing revision's own state is draft replaces that
    revision in place even where a case version in released state references it.
  met: true
  how: The branch condition never inspects a manifest, so a released case version referencing the revision
    cannot force the create branch while its own state reads draft.
- criterion: Revising a hypothesis that holds no revision yet creates revision 1.
  met: true
  how: 'When hypothesis_revisions holds no row for the hypothesis, the new SELECT returns no row, resolveHighestRevisionReleaseState
    answers { revision: undefined }, and writeRevision falls to insertHypothesisRevision, whose COALESCE(MAX(revision),
    0) + 1 yields 1.'
- criterion: The revise answers the number of the revision it wrote in the replace branch and in the create
    branch alike.
  met: true
  how: reviseHypothesis returns { hypothesis_name, revision } from the single writeRevision call in both
    branches, unchanged by this task.
- criterion: The revise's answer holds no field whose value differs between the replace branch and the
    create branch.
  met: true
  how: RevisedHypothesis's shape is untouched by this task, and no branch-identifying field was added.
- criterion: A case version in released state still references the revision its manifest referenced before
    a later revise of the same hypothesis, and that revision's content reads unchanged.
  met: true
  how: reviseHypothesis never writes to case_version_hypotheses in either branch, and the create branch
    never issues a statement against that revision's row.
- criterion: The port the operation reads the revision's own state through imports no database driver,
    no HTTP framework and no LLM client.
  met: true
  how: hypothesis-revision-release-state.port.ts's only import is type HypothesisRevisionState from case-store.port.js,
    a type-only, dependency-free module; the existing unit spec scans this exact file's import specifiers
    against the forbidden list and continues to find none.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/hypothesis-revision-release-state.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: '"Before release, a further edit replaces its content in place, and its number stays exactly what
    it already was" and "A case version''s manifest may point at this revision in either state; pointing
    at it moves neither" are what the branch now encodes literally.'
- node: domain/knowledge/hypothesis-revision-state
  encoded_at:
  - src/case/hypothesis-revision-release-state.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: The port's state field and the repository's hypothesisRevisionStateOf validator both carry exactly
    the two values this node declares.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: writeRevision's branch is exactly this policy — overwrite the highest existing revision in place
    unless its own state is released, in which case create the next revision, with no revision at all
    always creating revision 1.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: This task routes revising away from a released revision before any write is aimed at it; the refusal
    against a write that does reach a released revision is the sibling task refuse-altering-a-released-revision's
    own trigger, already in place.
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: RevisedHypothesis's shape and reviseHypothesis's return statement are unaffected by this task —
    both branches still answer only the revision number, with no field naming which branch ran.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: Unaffected by this task — insertHypothesisRevision's own numbering and overwriteHypothesisRevision's
    in-place UPDATE are untouched; the branch decision this task changed governs only which of the two
    write paths runs.
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: Three successive revises of a hypothesis whose highest revision's own state stays draft throughout
    all land on the same revision number with the latest content.
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/persistence/relational-case-store.repository.ts
  how: A hypothesis whose sole revision is itself in released state, referenced by no case version at
    all, gets its next revision created in draft state on a further revise, with the released revision's
    content unchanged.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: Narrowed for this task to only the fact that a later revise leaves an already-referenced revision's
    content unchanged, since the create branch never writes to the previously-referenced revision's row.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/hypothesis-revision-release-state.port.ts
  how: revise-hypothesis.operation.ts gains no new dependency on a database driver, HTTP framework or
    LLM client — it depends only on the IHighestRevisionReleaseStateQuery port's type, itself infrastructure-free.
inferences:
- inferred: 'The existing port and method names are kept, changing only the revision-present branch''s
    field from released_referenced: boolean to state: HypothesisRevisionState — a changed shape on the
    same seam rather than a second port or method.'
  from: The inventory's own must_not_duplicate entry ("this is the seam a hypothesis-revision's own state
    column changes underneath, not a query to duplicate") and the task's own framing.
- inferred: The SQL read for the highest revision's own state is a plain SELECT revision, state FROM hypothesis_revisions
    WHERE ... ORDER BY revision DESC LIMIT 1, replacing the prior CTE/join entirely.
  from: The task's own instruction to read the revision's own state column directly, and the risk entry
    in the inventory naming this exact join as what every caller reading this shape needs to move off
    of.
- inferred: A raw DB value is converted to HypothesisRevisionState through a validating hypothesisRevisionStateOf/isHypothesisRevisionState
    pair that raises CaseStoreError on an unrecognized value, mirroring the file's existing caseVersionStateOf/isCaseVersionState
    pattern.
  from: The inventory's own convention entry describing RelationalCaseStore's write/read shape, and the
    existing caseVersionStateOf precedent already in this same file.
- inferred: The case-store.port.js import became one combined import statement rather than two from the
    same specifier.
  from: The existing inline-type-modifier precedent already used in this codebase.
preserved:
- findDraftVersion-based draft-gate (refuseWithoutDraft) and the concept-resolution refusals in ReviseHypothesisOperation
  — untouched by this task.
- insertHypothesisRevision's and overwriteHypothesisRevision's own signatures, numbering and collects
  handling on RelationalCaseStore — untouched; only the read this task's branch decides from changed.
- RELEASED_STATE, CASE_VERSION_HYPOTHESES_TABLE and the manifest-read queries elsewhere in relational-case-store.repository.ts
  — all still in use, unaffected by removing the manifest join from readHighestRevisionReleaseState alone.
- The migration 0021 trigger and the isReleasedRevisionRefusal/raiseOverwriteFailure translation in overwriteRevision
  — both already delivered by the sibling task and left exactly as found.
deferred:
- what: 'Updating the assertions in relational-case-store.repository.spec.ts that check released_referenced:
    true/false against the port''s old shape, and the tests in revise-hypothesis.operation.spec.ts built
    on seedReleasedReferencedHighestRevision that still expect a manifest-referenced but own-state-draft
    revision to route to the create branch.'
  why: I write no test. These assertions test the exact manifest-join behavior this task's criteria supersede,
    so a correct implementation against the stated criteria necessarily turns them red; reconciling them
    is the test-author's file to write, in its own context.
- what: Making the second named currently-failing test ("rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError
    ... when the released-reference reading it acted on had already gone stale") assert a real rejection
    through source changes alone.
  why: Its fixture only releases the case version, never the hypothesis-revision's own row — under the
    current schema the trigger fires strictly on OLD.state = 'released', so the row's actual state stays
    'draft' throughout the test and no application-level branch choice can make the real UPDATE raise.
    Reaching the asserted rejection needs a fixture change, which is a test-file edit outside what this
    delegation writes.
---

## What it is

ReviseHypothesisOperation's overwrite/insert branch, and the port/repository seam it reads, decide
from a hypothesis-revision's own `state` column directly, replacing the prior manifest-join reading.

## Notes

Deferred: updating the pre-existing assertions in `relational-case-store.repository.spec.ts` and
`revise-hypothesis.operation.spec.ts` that were built on the manifest-join basis this task's criteria
supersede — that reconciliation is the test-author's, in its own context. Also deferred: making the
"stale released-reference" test assert a real rejection through source alone, since its fixture never
releases the hypothesis-revision's own row and needs a fixture change, not a source change.

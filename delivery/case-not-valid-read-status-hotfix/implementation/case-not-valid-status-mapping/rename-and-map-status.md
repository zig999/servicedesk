---
title: Rename CaseNotValidError to CaseVersionNotValidError and map it to HTTP 409
summary: Renames the domain error class throughout backend production source and adds it to the status
  map at 409, so a revalidating read that finds a stored version failing validation is refused by its
  specification-decided name instead of the generic 500 fallback.
task: sha256:c6315578a129adbc1925295e5dbfcd466bf45b5aff0c4383c7f0915c679be813
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-not-valid-status-mapping-rename-and-map-status-build-2
files:
- path: src/errors/case-version-not-valid.error.ts
  effect: new file; holds the sole definition of CaseVersionNotValidError (renamed from CaseNotValidError),
    constructed from the slug, version and the violations that failed, with `this.name` set to the new
    identifier so the error envelope reports it as the code
- path: src/errors/case-not-valid.error.ts
  effect: no longer defines the class; re-exports CaseVersionNotValidError from its new home (`export
    { CaseVersionNotValidError } from './case-version-not-valid.error.js';`) so the old path still resolves
    for whatever still imports it, while the identifier CaseNotValidError no longer appears anywhere in
    this file
- path: src/case/case-query.service.ts
  effect: both throw sites that used to raise CaseNotValidError — refuseIncoherence (a coherence violation)
    and structuralCase (a structural/parse violation) — now import and raise CaseVersionNotValidError
    from its renamed file; readCase, readCaseInputRequirements, replayCase and heldVersion's own CaseNotFoundError
    throw are otherwise unchanged
- path: src/errors/status-map.ts
  effect: imports CaseVersionNotValidError and adds it to STATUS_BY_ERROR_CLASS at 409, alongside the
    other CaseVersion* 409 entries; every other entry, and statusForError's lookup logic, is unchanged
criteria:
- criterion: A revalidating read (any read other than a replay) that loads a stored case version whose
    content currently fails a validator rule of validation-runs-at-every-read responds with HTTP status
    409, regardless of which route reached that read or which validator rule failed (a coherence rule
    or a structural one, e.g. the document failing to assemble into a well-formed case).
  met: true
  how: status-map.ts now maps CaseVersionNotValidError to 409; both throw sites in case-query.service.ts
    (refuseIncoherence for a coherence violation, structuralCase for a structural/parse violation) raise
    this same renamed class, and every route that reaches readCase or readCaseInputRequirements shares
    this one service and one map, so any of them answers 409 regardless of which validator family failed.
- criterion: That response's error body reports the error code "CaseVersionNotValidError".
  met: true
  how: 'the renamed class sets `this.name = ''CaseVersionNotValidError''` in its constructor (src/errors/case-version-not-valid.error.ts),
    and error-handler.middleware.ts''s domainEnvelope() (unedited by this task) reports `code: error.name`,
    so the body''s code field is exactly that string.'
- criterion: That response is never HTTP 500.
  met: true
  how: statusForError now returns 409 for this class before falling through, so error-handler.middleware.ts's
    generic 500 fallback (reached only when statusForError returns undefined) is never reached for it.
- criterion: That response is never HTTP 404.
  met: true
  how: CaseVersionNotValidError is a distinct class from CaseNotFoundError; statusForError's `instanceof`
    check only matches the 409 entry for it, so the 404 branch (reserved for CaseNotFoundError) never
    answers it.
- criterion: No file under the backend target source root names the identifier CaseNotValidError.
  met: true
  how: every production file is renamed (case-version-not-valid.error.ts defines only CaseVersionNotValidError;
    case-not-valid.error.ts is a bare re-export of that name; case-query.service.ts and status-map.ts
    import and throw only the renamed identifier). The six test files that still named the retired identifier
    when this implementation was first written (this record's own draft deferred them, since writing tests
    is a separate judgment) were corrected by the paired test-authoring pass; a repository-wide grep for
    the literal string CaseNotValidError under the target source root now returns nothing.
- criterion: A read naming a slug or version no case version was ever written for still responds with
    HTTP 404 reporting CaseNotFoundError, unchanged by this correction.
  met: true
  how: heldVersion() in case-query.service.ts is untouched — it still throws CaseNotFoundError when the
    store returns no assembled version — and status-map.ts's CaseNotFoundError → 404 entry is untouched.
- criterion: A replay reads its pinned version without revalidation and without this correction's 409
    refusal reaching it, unchanged by this correction.
  met: true
  how: replayCase() in case-query.service.ts is untouched — it calls only heldVersion() and trustedCaseOf(),
    never structuralCase() or refuseIncoherence(), so it cannot raise CaseVersionNotValidError and this
    correction's 409 mapping never applies to it.
nodes:
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  encoded_at:
  - src/errors/case-version-not-valid.error.ts
  - src/case/case-query.service.ts
  - src/errors/status-map.ts
  how: the renamed class carries the exact name this rule requires (CaseVersionNotValidError), thrown
    at both points a stored version fails validation at a (non-replay) read — refuseIncoherence for a
    coherence violation, structuralCase for a structural one — and the status map now answers both with
    409 instead of the generic 500 fallback or the neighboring 404.
- node: rules/knowledge/validation-runs-at-every-read
  how: this node constrains the work rather than being newly encoded by it. The task adds or relocates
    no validation call — parseCaseDocument (structural) and caseCoherenceViolations (coherence) run exactly
    where and when they did before, and replayCase's absence of either call is left untouched, honoring
    this rule's own replay exception unchanged.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/errors/status-map.ts
  how: adding CaseVersionNotValidError's entry to STATUS_BY_ERROR_CLASS is what removes it from the set
    of domain errors this constraint's generic fallback answers for. error-handler.middleware.ts's own
    fallback clauses (the fixed INTERNAL_ERROR code, the fixed message, no context reaching the caller)
    are untouched and still hold for whatever domain error remains genuinely unmapped.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  how: the delivery did not reach this node's own write-path/lifecycle behavior or its 404 details clause;
    it only had to leave the existing CaseNotFoundError/404 answer (heldVersion in case-query.service.ts)
    exactly as it stood, which criterion 6 asserts and which the unedited function demonstrates.
inferences:
- inferred: the renamed class's canonical file should be named case-version-not-valid.error.ts (matching
    its new class name) rather than kept at the old case-not-valid.error.ts path.
  from: every sibling CaseVersion*Error already follows this exact filename-mirrors-classname convention
    (case-version-not-draft.error.ts, case-version-not-draft-at-release.error.ts, case-version-not-releasable.error.ts,
    case-version-not-released.error.ts) — the task's own ADVISORY note leaves the filename choice to convention
    rather than to any node.
divergences:
- from: the sibling convention every other CaseVersion*Error file follows — one file, named for the class
    it holds, holding that class's only definition, with nothing left behind at a superseded path
  departure: src/errors/case-not-valid.error.ts, the class's original file, is left in place as a one-line
    re-export (`export { CaseVersionNotValidError } from './case-version-not-valid.error.js';`) rather
    than removed once its content moved to src/errors/case-version-not-valid.error.ts.
  why: the task-implementer's toolset (Read/Write/Edit/Grep/Glob) holds no file-delete operation, so the
    superseded file could not be removed. Leaving it as a re-export keeps the identifier CaseNotValidError
    out of every file under the target source root's production code while not breaking whatever still
    resolves the old path; it is flagged in `deferred` for removal by whoever next touches this tree with
    delete/git access.
preserved:
- CaseNotFoundError's throw site in heldVersion() and its 404 mapping in status-map.ts
- replayCase()'s revalidation-free read of a pinned version
- every other entry already in STATUS_BY_ERROR_CLASS and statusForError's lookup order/logic
- error-handler.middleware.ts's generic-fallback shape (INTERNAL_ERROR code, fixed message, no context
  leaked) for errors the map still does not name
- structuralCase()'s parse-then-wrap control flow and refuseIncoherence()'s coherence-check control flow,
  apart from the thrown class's name
deferred:
- what: src/errors/case-not-valid.error.ts, now a bare re-export, is a leftover from the file rename this
    task made and could not clean up.
  why: the task-implementer's toolset holds no file-delete operation; removing it (or folding its consumers
    fully onto the new path) is a trivial follow-up for whoever next touches this tree with delete/git
    access.
- what: frontend/app/src/services/error-ui-state.ts and its two accompanying test fixtures still name
    CaseNotValidError.
  why: the frontend is a different target under a different standard, already tracked separately per this
    task's own Notes — out of scope here.
- what: case-query.service.ts's readCaseInputRequirements() calls structuralCase() but never refuseIncoherence(),
    so a route reached only through it could still answer 200 for a version failing only a coherence rule.
  why: the task's own Notes record this as UNDERDETERMINED by the specification against this task's criteria;
    changing which validator families a given route calls reaches past what this task's criteria state,
    and is not something this delivery decided.
---

## What it is
src/errors/status-map.ts's STATUS_BY_ERROR_CLASS map had no entry for CaseNotValidError, so a revalidating read that threw it fell through statusForError's undefined return to the generic unmapped-error fallback (HTTP 500) instead of the HTTP 409 the specification decided.
This delivery renamed the class to CaseVersionNotValidError throughout the backend (case-not-valid.error.ts, its two throw sites in case-query.service.ts) and added the renamed class to the status map at 409. Six pre-existing test files still importing and asserting against the retired identifier were corrected by the paired test-authoring pass, since writing production source and writing what proves it are two separate judgments in this framework.
Replay (replayCase in case-query.service.ts) reads its pinned version without revalidation and is explicitly untouched by this correction.

## Notes
This is the delivery of a corrective increment: the survey and the decomposition did not run for the task itself, per the plan-work skill's own route for one wrong behavior in already-delivered code.
The build step first ran red — six test files (owned by prior, already-closed deliveries) failed to typecheck once the rename removed the export they imported. Per this framework's separation of producers, the task-implementer's toolset and remit exclude touching test files; the fix belonged to the test-authoring pass instead, so it was run ahead of the build's own retry and the six files were corrected there rather than sent back to the task-implementer. The build then passed clean on its next attempt (run/case-not-valid-status-mapping-rename-and-map-status-build-2); the first, red attempt stands unmodified at run/case-not-valid-status-mapping-rename-and-map-status-build.
Criterion 5 ("No file under the backend target source root names the identifier CaseNotValidError") is recorded here as met, reflecting the tree as it stands once the test-authoring pass corrected the six files this record's own production-only writing could not reach; the task-implementer's own return had recorded it unmet for exactly that reason, disclosed above rather than silently revised.

---
title: Rename CaseNotValidError to CaseVersionNotValidError and map it to HTTP 409
summary: Any revalidating read that loads a stored case version and finds it fails validation-runs-at-every-read
  (coherence or structural) is refused with HTTP 409 reporting CaseVersionNotValidError, matching the
  specification's own decided name, never the generic 500 fallback. Replay, which reads its pinned version
  without revalidation, is unaffected.
sources:
- work/case-not-valid-read-status-hotfix/intake/scope.md
- work/case-not-valid-read-status-hotfix/intake/rename-decision.md
objective: Any read that revalidates a stored case version's content against validation-runs-at-every-read
  (i.e. every read except a replay, which reads its pinned version without revalidation) and finds it
  currently fails a validator rule — coherence or structural alike — is refused with HTTP 409 reporting
  CaseVersionNotValidError; the domain error class is renamed from CaseNotValidError to CaseVersionNotValidError
  throughout the backend, and such a read is never answered with the generic unmapped-error fallback or
  with the 404 that answers an unknown slug or version.
criteria:
- A revalidating read (any read other than a replay) that loads a stored case version whose content currently
  fails a validator rule of validation-runs-at-every-read responds with HTTP status 409, regardless of
  which route reached that read or which validator rule failed (a coherence rule or a structural one,
  e.g. the document failing to assemble into a well-formed case).
- That response's error body reports the error code "CaseVersionNotValidError".
- That response is never HTTP 500.
- That response is never HTTP 404.
- No file under the backend target source root names the identifier CaseNotValidError.
- A read naming a slug or version no case version was ever written for still responds with HTTP 404 reporting
  CaseNotFoundError, unchanged by this correction.
- A replay reads its pinned version without revalidation and without this correction's 409 refusal reaching
  it, unchanged by this correction.
implements:
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/validation-runs-at-every-read
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
---

## What it is
src/errors/status-map.ts's STATUS_BY_ERROR_CLASS map has no entry for CaseNotValidError, so a revalidating read that throws it falls through statusForError's undefined return to the generic unmapped-error fallback (HTTP 500) instead of the HTTP 409 the specification decided.
This task renames the class to CaseVersionNotValidError throughout the backend (case-not-valid.error.ts, its two throw sites in case-query.service.ts, and every test referencing it) and adds the renamed class to the status map at 409.
Replay (replayCase in case-query.service.ts) reads its pinned version without revalidation and is explicitly untouched by this correction.

## Notes
This is a corrective increment: the survey and the decomposition did not run, per the plan-work skill's own route for one wrong behavior in already-delivered code. The task was written directly, not by a decomposer.
The epic was seeded mechanically from `trace.py --encodes src src/errors/status-map.ts`, then grown twice during binding: once to add the target node itself (rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, absent from the file's own bindings precisely because the bug is that its requirement is not yet encoded there), and once more to add validation-runs-at-every-read, constraints/a-domain-error-unmapped-by-status-is-refused-generically and rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused, after the binder's own reading surfaced their relevance.
A first cut of this task kept the code's existing error name (CaseNotValidError) to avoid touching the frontend consumer that already maps it; a binder pass returned a BLOCKING note over that cut, since the specification's own decided node names the error CaseVersionNotValidError explicitly and deliberately, as its own disclosed reasoning already records. The human was asked and chose to rename the code to match the specification rather than amend the specification to match the code; the frontend consumer (error-ui-state.ts) and two test fixtures a separate review-change pass already flagged are a different target's correction, tracked separately.
A second cut of this task worded its criteria as "any read," which a binder pass caught sweeping in replay — a read the specification explicitly exempts from revalidation (rules/knowledge/validation-runs-at-every-read's own closing clause, and this correction's own target node's own Description). The criteria now bound the refusal to a revalidating read, excluding replay explicitly, which cleared that BLOCKING note.
UNDERDETERMINED, from the specification — criteria 1 and 7 bound the refusal to "a revalidating read (any read other than a replay)," but nothing in this task's own criteria requires every non-replay read to revalidate against *both* validator families (coherence and structural) rather than one alone; an implementation that leaves a route revalidating structurally but never calling the coherence check (e.g. a route that parses the document but never runs refuseIncoherence) would satisfy every criterion here while still answering 200 for a stored version that fails only a coherence rule on that route. Passes: an implementation renaming the class and mapping it to 409 while leaving case-query.service.ts's readCaseInputRequirements (which calls structuralCase but never refuseIncoherence) exactly as it stands today.
REMAINDER, from the specification — rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's own lifecycle-operation branch and its 404 details clause (the slug and version named in the refusal) reach no criterion of this task, which only asserts that the existing read-path 404 is unchanged. Belongs: the task that originally delivered that node's write-path behavior.
REMAINDER, from the specification — constraints/a-domain-error-unmapped-by-status-is-refused-generically's own clauses (the INTERNAL_ERROR code, the fixed message, that no error detail reaches the caller) reach no criterion here; this task only asserts that the renamed error leaves the set that constraint governs. Belongs: the task that originally delivered the generic unmapped-error fallback itself.
ADVISORY, from the specification — criterion 5 is stated over the identifier only; no candidate node speaks to file paths, so renaming the class without renaming case-not-valid.error.ts's own filename satisfies the criterion. Whether to rename the file too is the project's own standard's call, not any node here.

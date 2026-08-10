---
title: Draft the assessment's text from the narrowed input
summary: Adds the Assessment value type and a pure, deterministic, template-based draftAssessment(resolved, narrowedInput) that copies outcome/referral/determining_hypothesis from the resolved outcome unchanged and drafts text from the narrowed input alone.
task: sha256:cbfc2ea00b4c0681528735687632988db7c74d44ac78d87587abc1a9fc8999f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-drafting-draft-assessment-text-build
files:
- path: src/investigation/assessment.ts
  effect: Declares the Assessment value type (domain/investigation/assessment), outcome, referral, an optional determining_hypothesis and the required text, importing only case.ts's own Referral. No behavior; a plain-data sibling type, the same convention evaluation.ts, evidence.ts and verdict.ts already established for this context.
- path: src/investigation/draft-assessment-text.ts
  effect: Declares the exported draftAssessment(resolved, narrowedInput) that assembles a whole Assessment, outcome and referral copied from resolved unchanged, determining_hypothesis present exactly when resolved.determining is defined, and its private draftText/confirmedBody/fallbackBody/summarizeEvidence/summarizeOneEvidenceItem/summarizeEvaluations/summarizeOneEvaluation helpers, which deterministically template a sentence naming the resolved outcome/referral followed by narrowedInput's own confirmed evidence or fallback verdicts/reasons. Pure and synchronous; imports only ResolvedOutcome, Assessment and this module's own sibling plain-data types.
criteria:
- criterion: The assessment's outcome, referral and determining hypothesis equal exactly the resolved values it was given, unchanged by drafting.
  met: true
  how: 'draftAssessment builds base = { outcome: resolved.outcome, referral: resolved.referral, text: draftText(...) } and, where resolved.determining is defined, adds determining_hypothesis: resolved.determining verbatim, the same object references, never reshaped, recomputed or defaulted anywhere in either file.'
- criterion: The assessment's determining hypothesis is present exactly when a hypothesis confirmed, and absent exactly when the fallback answered.
  met: true
  how: 'The single branch resolved.determining === undefined ? base : { ...base, determining_hypothesis: resolved.determining } ties the field''s presence to resolved.determining alone, which case-resolution.ts''s own resolveOutcome defines exactly when a hypothesis confirmed and leaves undefined exactly when the fallback answered. The absent branch never sets the key at all, so it is structurally missing rather than present with value undefined.'
- criterion: Drafting receives only the narrowed input a prior step assembled, never the case's own hypotheses or criteria.
  met: true
  how: draftAssessment's second parameter is typed NarrowedInput exactly as resolve-and-narrow-input.ts declares it, and every function in draft-assessment-text.ts reads only fields of that union plus resolved's own outcome/referral. Neither Case nor Hypothesis is imported anywhere in this module, so there is no field through which a hypothesis's criterion or the case's when_to_use could reach drafting.
- criterion: Drafting imports no framework, driver or provider client, remaining a pure function of its narrowed input.
  met: true
  how: draft-assessment-text.ts's only imports are type-only imports of ResolvedOutcome, Assessment and Evidence/ConfirmedNarrowedInput/FallbackEvaluationSummary/FallbackNarrowedInput/NarrowedInput, all plain-data domain modules. Every function is synchronous, has no I/O and no side effect; draftAssessment's output depends only on its two arguments.
nodes:
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/assessment.ts
  - src/investigation/draft-assessment-text.ts
  how: assessment.ts declares Assessment's four attributes exactly as the node states them. draft-assessment-text.ts's draftAssessment is the first module to assemble a whole instance of it, copying outcome/referral/determining_hypothesis from resolved and producing text, the one field the node's own Description says drafting produces, from narrowedInput alone.
- node: rules/investigation/the-outcome-comes-from-the-case
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  how: draftAssessment copies resolved.outcome, resolved.referral and resolved.determining through to the Assessment it returns, unmodified and uncomputed; nothing in this module derives an outcome, referral or determining hypothesis from anything but resolved.
- node: rules/investigation/the-writing-input-is-narrowed
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  how: draftText/confirmedBody/fallbackBody read only narrowedInput's own two admitted shapes, confirmed.evidence, or every fallback evaluation's hypothesis/verdict/reason, and resolved's own outcome/referral for the opening sentence; the case body never enters this module because it is never imported.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/assessment.ts
  - src/investigation/draft-assessment-text.ts
  how: Both files import only sibling domain plain-data types, no framework, driver or provider client. draftAssessment and every helper are synchronous pure functions with no I/O.
inferences:
- inferred: Assessment is declared in its own new sibling file, src/investigation/assessment.ts, rather than inline inside draft-assessment-text.ts.
  from: The codebase's own established one-file-per-domain-type convention for this context, evaluation.ts, evidence.ts, verdict.ts and evaluation-reason.ts each hold exactly one domain-model plain-data type, and no earlier task has declared this type yet.
- inferred: The confirmed-path body text never names the determining hypothesis by its resolved.determining value, referring to it only by role, and draws its content solely from confirmed.evidence.
  from: ConfirmedNarrowedInput itself carries no hypothesis name, by resolve-and-narrow-input.ts's own already-recorded inference that duplicating the name inside narrowedInput would be a second place for the same fact to disagree; keeping the confirmed body's own content to narrowedInput alone avoids threading a second, independently-typed fact into a branch the type system does not statically tie to it.
- inferred: An empty evidence array or empty evaluations array drafts as the literal NO_EVIDENCE_LABEL/NO_EVALUATIONS_LABEL rather than an empty sentence fragment.
  from: Neither implemented node states what an empty narrowed input drafts as, and the task's own instruction that the exact wording is this module's free choice; a literal, deterministic label was chosen over an empty or malformed fragment.
- inferred: draftAssessment takes resolved and narrowedInput as two positional parameters rather than one options object.
  from: 'This codebase''s own established convention for a two-argument pure function at or under the standard''s own three-positional-parameter ceiling (case-resolution.ts''s resolveOutcome(theCase, verdicts)), and the task''s own suggested signature draftAssessment(resolved, narrowedInput): Assessment.'
deferred:
- what: Wiring draftAssessment into any factory, judgment-stage caller or production entry point.
  why: No consumer of resolveAndNarrow's own output exists anywhere in the tree yet; per the plan's own inventory, no investigation-lifecycle module exists yet either, and that composition belongs to whichever later task wires the whole pipeline together.
- what: Assembling the Investigation aggregate itself, of which an Assessment is one part.
  why: domain/investigation/investigation is task/investigation-lifecycle/investigation-factory's own job, outside this task's own objective of producing exactly the Assessment's text.
---

## What it is

The step that produces the text and nothing else the assessment carries. Its input is already narrowed before it runs, so nothing here can contradict the resolved outcome.

## Notes

None.

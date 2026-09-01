---
title: Consolidation call-record chain carries register, usage, elapsed_ms and prompt
summary: Fixes the consolidation write-up chain so the four call-record attributes domain/investigation/assessment
  already requires (register, usage, elapsed_ms, prompt) reach the returned and stored assessment,
  instead of being computed at the consolidation call and dropped before the assessment is built or
  persisted.
objective: Every Assessment an investigation-pipeline run returns, and every Assessment a diagnosis
  persists and reads back, carries all eight attributes domain/investigation/assessment declares —
  outcome, referral, determining_hypothesis (when applicable), text, register, usage, elapsed_ms and
  prompt — never only the first four the chain carries today.
criteria:
- Every Assessment an investigation-pipeline run returns carries all eight attributes domain/investigation/assessment
  declares, never only outcome, referral, determining_hypothesis and text.
- assessment-consolidator.port.ts's consolidate() operation answers with the register it actually
  used to produce the text, in addition to the usage, elapsed_ms and prompt it already answers with
  — the same call-record shape those three already have.
- The register on a returned Assessment equals exactly the register the consolidate() call answered
  with — never a value assumed by the caller in advance, and never a value different from what the
  call actually used.
- The register and usage values carried onto the assessment are exactly the domain/knowledge/consolidation-register
  enumeration value and domain/investigation/usage integers the consolidate() call answered with —
  never a wider or looser type standing in for either.
- The prompt on a returned Assessment is the consolidation prompt as the writing call actually
  materialized it, and is never carried on a field of the pipeline's own result object instead of on
  the assessment.
- A stored and re-read Assessment carries the same register, usage (input_tokens and output_tokens),
  elapsed_ms and prompt values the write recorded — none of the four is dropped or altered by a
  persistence round trip.
implements:
- domain/investigation/assessment
- domain/investigation/assessment-consolidator
- domain/knowledge/consolidation-register
- domain/investigation/usage
- rules/investigation/the-consolidation-answer-states-its-register
sources:
- intake/scope.md
---

## What it is

The corrective fix carrying the consolidation call's own register, usage, elapsed_ms and prompt
through draft-assessment-text.ts and investigation-pipeline.ts to the returned Assessment, and
through relational-investigation-store.repository.ts to the persisted and read-back record — with
the port's own answer now stating which register it used, per
rules/investigation/the-consolidation-answer-states-its-register.

## Notes

Decision, beyond the covers — stand: rules/investigation/the-consolidation-answer-states-its-register
was decided into the specification while this task was bound (an unstated fact: the port's own
answer must state which register the call used) and is named in implements; the epic's covers grew
to include it.
ADVISORY, from the binder — criterion 6 (the persistence round trip) is demonstrated against
domain/investigation/assessment's own required attributes; whether an Assessment is stored and
re-read at all is stated by domain/investigation/investigation.
Decision, beyond the covers — stand: domain/investigation/investigation is not claimed in
implements; this task changes nothing about the investigation aggregate itself, only the
assessment value it carries, so the fact is left where it stands rather than growing this epic's
claim over an unrelated aggregate.
ADVISORY, from the binder — the first clause of rules/investigation/the-outcome-comes-from-the-case
reaches no criterion of this task and belongs to the already-delivered act that carries the case's
resolve-outcome onto the assessment.
Decision, beyond the covers — stand: rules/investigation/the-outcome-comes-from-the-case is not
claimed in implements; this task changes nothing about how outcome, referral or
determining_hypothesis are decided.
ADVISORY, from the binder — both clauses of rules/investigation/the-writing-input-is-narrowed reach
no criterion of this task and belong to the already-delivered act that assembles the consolidation
call's input and prompt.
Decision, beyond the covers — stand: rules/investigation/the-writing-input-is-narrowed is not
claimed in implements; this task changes what the consolidation answer carries out, never what is
carried into the call.
ADVISORY, from the binder — constraints/consolidation-runs-behind-a-port reaches no criterion of
this task and belongs to the already-delivered act that routes consolidation through the port and
its adapters.
Decision, beyond the covers — stand: constraints/consolidation-runs-behind-a-port is not claimed in
implements; this task changes the port's own answer shape, never whether consolidation is reached
only through it.

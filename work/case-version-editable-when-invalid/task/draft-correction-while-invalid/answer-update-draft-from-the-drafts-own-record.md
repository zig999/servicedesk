---
title: Answer update-draft from the draft's own record
summary: update-draft builds its answer from the draft's own stored record after the
  write, not from read-case, so an update that leaves the draft failing validation is
  accepted.
rationale: Cut apart from the read because it changes the source and shape of an
  answer already published, a different reason to change than adding a read; the
  answer is decided to carry the draft's own declared attributes in the new route's
  shape, because the editing surface re-hydrates its form from this answer and
  read-case cannot build it for a draft that fails validation.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
objective: A well-formed update-draft over a draft is accepted whatever validator rule
  of validation-runs-at-every-read fails over that draft after the write.
criteria:
  - A well-formed update-draft over a draft whose manifest holds no entry is answered
    HTTP 200.
  - After that update-draft, the draft's own stored record carries the submitted
    title.
  - The 200 answer carries the declared attributes the draft's own stored record
    carries after the write.
  - The 200 answer carries no manifest entry.
  - A well-formed update-draft whose submitted subject names a subject type the
    glossary does not hold, over a draft, is answered HTTP 200.
depends_on:
  - task/draft-correction-while-invalid/read-a-drafts-own-declared-attributes
  - task/draft-correction-while-invalid/serve-a-drafts-own-declared-attributes-over-http
implements:
  - rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - domain/knowledge/case-version
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
---

## What it is

This removes the second readCase() call from update-draft.controller.ts's answer path, which the inventory names as a risk.

## Notes

update-draft's existing refusals, CaseVersionNotDraftError over a released version and CaseNotFoundError over an unknown one, are raised by the store before the write and are not changed here.
The answer's shape changes from the read-case DTO, and the frontend editor, which re-hydrates from it, is a consumer outside this backend scope.
UNDERDETERMINED, from the specification — the criteria do not require the answer to leave out a consolidation_register the stored record lacks, though the governing rule's expression requires exactly that. Passes despite: an update-draft answer that fills an absent consolidation_register with the consolidation adapter's default, or a previously released version's register, in place of the absence.
REMAINDER, from the specification — the editing-surface rule's clause that the surface presents the five attributes on a reading where the draft's read is refused reaches no criterion here; this task answers only the surface's acceptance of update-draft on that reading. Belongs to: the editing-surface (frontend) task that presents the draft's own stored declared attributes.
ADVISORY, from the specification — the scenario's surface-facing then-steps (the surface states the version does not read back as a case, and presents the stored attributes) are not answered by this task, which answers only the curator submitting and having an update-draft accepted; the scenario is fully demonstrated only once the editing-surface task also lands.
ADVISORY, from the specification — the criterion over a submitted subject naming a subject type the glossary does not hold rests in part on rules/knowledge/validation-runs-at-every-read and rules/knowledge/case-terms-exist-in-the-glossary, together with contracts/knowledge/case-lifecycle, none of which is in the epic's claim; the candidates in the claim (domain/knowledge/case-version's correction freedom and the editing-surface rule's "whichever rule is failing") still support the outcome, but the caller may want to grow the claim to make the fact explicit.
Decision, beyond the covers — stand: rules/knowledge/case-terms-exist-in-the-glossary is cited only as background for why a glossary-absent subject type is a coherence failure, not as a fact this task implements; the criterion is already backed inside the claim, and growing it for a citation would claim scope this task does not deliver.
Decision, beyond the covers — stand: contracts/knowledge/case-lifecycle is cited only as background naming update-draft's publisher, not as a fact this task implements; the operation's identity is already settled and this task changes only what its answer carries.
ADVISORY, from the specification — constraints/a-successful-case-version-own-record-read-answers-with-http-200 and contracts/knowledge/case-query govern read-case-version, not update-draft, and are left out of implements; reusing that read to build this answer is an implementation choice this rule does not require. constraints/a-malformed-request-is-refused-with-a-validation-error and rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused are likewise left out, being the refusals the accepted-answer rule defers to the rules that name them, and no criterion here demonstrates either.

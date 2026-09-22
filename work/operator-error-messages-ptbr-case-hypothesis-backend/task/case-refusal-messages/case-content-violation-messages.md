---
title: PT-br messages for the two case refusals that report violated rules
summary: CaseVersionNotValidError and CaseVersionNotReleasableError rewritten in PT-br, together with
  the structural and release-only violation strings parse-case-document.ts and release.operation.ts interpolate
  into them.
rationale: These two are cut together because they share one reason to change -- how a list of violated
  rules is presented to the operator -- and a wording decided for one that differed in the other would
  put two shapes on the same fact. IncoherentCaseError and InvalidCaseDocumentError are deliberately left
  out of this task's scope, because the specification's validation-runs-at-every-read states that a structural
  or a coherence failure at a read is one refusal, CaseVersionNotValidError, and never a condition of
  its own, so the two extra classes are a drift between the code and the specification that this translation
  task does not resolve -- a human decided to leave that drift standing for a corrective increment of
  its own rather than fold it into a wording change. The scope grew once, by a human decision, because
  the newly-decided constraint binding a domain refusal's whole message to Brazilian Portuguese with no
  English domain noun reaches the violation strings these two classes interpolate, produced outside the
  error classes themselves. This task takes only the violation producers whose domain nouns the two decided
  vocabulary constraints already cover -- parse-case-document.ts's structural violations (case, hypothesis,
  manifest, position) and release.operation.ts's one release-only violation (hypothesis, revision, released
  state). validate-case-coherence.ts's coherence violations name domain nouns the vocabulary constraint
  does not cover -- the glossary, a registered capability, a subject type, an outcome, a referral, an
  action, a recipient, a criterion -- and deciding PT-br words for those is outside this initiative's
  case-and-hypothesis scope, so they are left in English, a second, narrower drift than IncoherentCaseError/InvalidCaseDocumentError's,
  for a later increment.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
implements:
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
objective: The two case refusals that report a list of violations carry PT-br messages stating the same
  fact their English text stated, in one shared shape, with every structural and release-only violation
  string itself in PT-br.
criteria:
- CaseVersionNotValidError's message is in PT-br and names the case slug, the version number and the validator
  rules that version violates at the reading.
- CaseVersionNotReleasableError's message is in PT-br and names the case slug, the version number and
  the violations that refuse its release.
- Each of the two messages names the thing refused before it states the kind of rule that refuses it.
- The two messages introduce the list of violations with the same PT-br wording as one another.
- The two messages are distinguishable from one another by their text alone, so an operator reading one
  can tell which of the two conditions occurred.
- Where CaseVersionNotReleasableError's release finds no rule specifically violated, its PT-br message
  says so explicitly rather than presenting the curator with an unexplained empty list.
- Every structural violation string parse-case-document.ts produces is rewritten in PT-br, stating the
  same fact its English original stated.
- The one release-only violation string release.operation.ts produces (a hypothesis manifested at a revision
  that is not released) is rewritten in PT-br, stating the same fact its English original stated, naming
  the released state "liberada" rather than its raw lifecycle token.
- validate-case-coherence.ts's coherence violation strings are left untouched by this task.
- No message and no violation string states a fact its English original did not state, and every interpolated
  value in each PT-br violation string also appeared in that string's English original.
- Each message and each violation string uses "caso" for a case, "versão" for a case version, "hipótese"
  for a hypothesis, "revisão" for a hypothesis revision, "manifesto" for a manifest, "posição" for a manifest
  position and "liberada" for the released state, and uses no English domain noun among these seven.
- Each of the two classes' name property still holds its unchanged class-name string.
- src/src/errors/status-map.ts is unchanged and still maps each of the two classes to the HTTP status
  it mapped to before.
- Each of the two classes' context property holds exactly the properties and values it held before, with
  no value moved into or out of it.
- IncoherentCaseError and InvalidCaseDocumentError are left untouched by this task.
- The suite under src/src/__tests__ passes with no test file changed.
---
## What it is
The two case refusals whose English message ends in a colon and a list of what was violated: a stored
version failing validation at a read, and a release attempt -- together with the structural and
release-only English strings that list can be built from.

## Notes
CaseVersionNotReleasableError is the one of the two whose governing rule also speaks to the case where
nothing specific was found to name.
Neither is asserted against literal message text by any existing test.
IncoherentCaseError and InvalidCaseDocumentError are excluded on purpose: the specification states that
a structural or coherence failure at a read is CaseVersionNotValidError and never a condition of its own,
so those two classes are a pre-existing drift between the code and the specification, left for a
corrective increment of its own.
validate-case-coherence.ts's coherence violation strings (through caseCoherenceViolations and
glossaryCoherenceViolations) are deliberately left out of produces: they name domain nouns -- the
glossary, a registered capability, a subject type, an outcome, a referral, an action, a recipient, a
criterion -- that constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word does
not fix a PT-br word for, and this initiative's scope is case and hypothesis messages, not the glossary
and capability vocabulary a further vocabulary decision would require. After this task,
CaseVersionNotValidError's and CaseVersionNotReleasableError's messages can still interpolate an English
coherence-violation string when release-time coherence checking is the branch that fires; that mixed
outcome is a known, narrower remainder than IncoherentCaseError/InvalidCaseDocumentError's, left for a
later increment that also covers the glossary/capability vocabulary.
The exact set of violation strings parse-case-document.ts and release.operation.ts produce is for the
implementer to enumerate fresh against the current source, not fixed here.
REMAINDER, from the specification -- IncoherentCaseError and InvalidCaseDocumentError interpolate the very
structural/coherence violation strings this task partly rewrites; belongs to the corrective increment
noted above, sequenced soon so the mixed-language window stays short.
REMAINDER, from the specification -- validate-case-coherence.ts's coherence violation strings (glossary,
capability, subject-type, outcome, referral, action, recipient, criterion vocabulary) belong to a later
increment that also decides PT-br words for those nouns.
